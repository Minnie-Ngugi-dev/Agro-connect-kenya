// backend/services/mpesa.js
import axios from 'axios';
import logger from '../config/logger.js';

const BASE = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

// ─── Normalize any Kenyan number → 2547XXXXXXXX ───────────────────────────
export const normalizePhone = (raw) => {
  let p = String(raw).replace(/[\s\-().]/g, '');
  if (p.startsWith('+'))  p = p.slice(1);
  if (p.startsWith('0')  && p.length === 10) p = '254' + p.slice(1);
  if ((p.startsWith('7') || p.startsWith('1')) && p.length === 9) p = '254' + p;
  if (p.startsWith('254') && p.length === 12) return p;
  throw new Error(
    `Invalid phone number: "${raw}". Use: 0712345678 | +254712345678 | 712345678`
  );
};

// ─── Validate .env before making any API call ─────────────────────────────
const validateEnv = () => {
  const errors = [];
  if (!process.env.MPESA_CONSUMER_KEY   || process.env.MPESA_CONSUMER_KEY.includes('your_'))
    errors.push('MPESA_CONSUMER_KEY is not set');
  if (!process.env.MPESA_CONSUMER_SECRET || process.env.MPESA_CONSUMER_SECRET.includes('your_'))
    errors.push('MPESA_CONSUMER_SECRET is not set');
  if (!process.env.MPESA_PASSKEY         || process.env.MPESA_PASSKEY === 'your_passkey')
    errors.push('MPESA_PASSKEY is not set — sandbox value: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919');
  if (!process.env.MPESA_SHORTCODE)
    errors.push('MPESA_SHORTCODE is not set — sandbox value: 174379');
  if (!process.env.MPESA_CALLBACK_URL    || process.env.MPESA_CALLBACK_URL.includes('your-'))
    errors.push('MPESA_CALLBACK_URL is not set — use your ngrok URL + /api/payments/callback');
  if (errors.length) throw new Error(`M-Pesa .env errors:\n  • ${errors.join('\n  • ')}`);
};

// ─── Get OAuth access token ───────────────────────────────────────────────
const getToken = async () => {
  validateEnv();
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  try {
    const res = await axios.get(
      `${BASE}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` }, timeout: 15000 }
    );
    return res.data.access_token;
  } catch (err) {
    const status = err.response?.status;
    const msg    = err.response?.data?.errorMessage || err.message;
    logger.error(`M-Pesa OAuth failed (${status}): ${msg}`);

    if (status === 400 || status === 401) {
      throw new Error(
        'Safaricom rejected your credentials. ' +
        'Double-check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in your .env file.'
      );
    }
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw new Error('Connection to Safaricom timed out. Check your internet connection.');
    }
    throw new Error(`Safaricom auth failed: ${msg}`);
  }
};

// ─── Generate timestamp ───────────────────────────────────────────────────
const getTimestamp = () => {
  const n = new Date();
  return [
    n.getFullYear(),
    String(n.getMonth() + 1).padStart(2, '0'),
    String(n.getDate()).padStart(2, '0'),
    String(n.getHours()).padStart(2, '0'),
    String(n.getMinutes()).padStart(2, '0'),
    String(n.getSeconds()).padStart(2, '0'),
  ].join('');
};

// ─── STK Push ─────────────────────────────────────────────────────────────
export const initiateSTKPush = async ({ phone, amount, orderId, description }) => {
  validateEnv();

  const normalized  = normalizePhone(phone);
  const shortcode   = process.env.MPESA_SHORTCODE;
  const passkey     = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const timestamp   = getTimestamp();
  const password    = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const amountInt   = Math.ceil(Number(amount));

  if (isNaN(amountInt) || amountInt < 1) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const token = await getToken();

  const payload = {
    BusinessShortCode: shortcode,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   'CustomerPayBillOnline',
    Amount:            amountInt,
    PartyA:            normalized,
    PartyB:            shortcode,
    PhoneNumber:       normalized,
    CallBackURL:       callbackUrl,
    AccountReference:  `AGC-${String(orderId).slice(-8).toUpperCase()}`,
    TransactionDesc:   (description || 'Agro-Connect Pay').slice(0, 13),
  };

  logger.info(`STK Push → ${normalized} | KSh ${amountInt} | order ${orderId}`);
  logger.info(`Callback URL: ${callbackUrl}`);

  try {
    const res = await axios.post(
      `${BASE}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    logger.info(`STK response: ${JSON.stringify(res.data)}`);

    if (res.data.ResponseCode !== '0') {
      throw new Error(res.data.ResponseDescription || 'STK Push rejected by Safaricom');
    }
    return res.data;

  } catch (err) {
    if (err.response) {
      const d      = err.response.data;
      const status = err.response.status;
      logger.error(`Daraja STK error ${status}: ${JSON.stringify(d)}`);
      throw new Error(
        d?.errorMessage ||
        d?.ResponseDescription ||
        `Safaricom error (${status})`
      );
    }
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw new Error('Safaricom API timed out. Please try again.');
    }
    throw err;
  }
};

// ─── Query STK status ─────────────────────────────────────────────────────
export const querySTKStatus = async (checkoutRequestId) => {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey   = process.env.MPESA_PASSKEY;
  const token     = await getToken();
  const timestamp = getTimestamp();
  const password  = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  try {
    const res = await axios.post(
      `${BASE}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: shortcode,
        Password:          password,
        Timestamp:         timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    return res.data;
  } catch (err) {
    logger.error(`STK query error: ${err.response?.data || err.message}`);
    throw new Error('Failed to query payment status');
  }
};