// backend/controllers/paymentController.js
import Payment     from '../models/Payment.js';
import Order       from '../models/Order.js';
import PDFDocument from 'pdfkit';
import { initiateSTKPush, querySTKStatus } from '../services/mpesa.js';
import logger from '../config/logger.js';

// ── Initiate STK Push ─────────────────────────────────────────────────────
export const initiatePayment = async (req, res, next) => {
  try {
    const { orderId, phone } = req.body;

    if (!orderId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'orderId and phone are required',
      });
    }

    const order = await Order.findById(orderId).populate('product', 'name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    // Attempt STK Push — catch config/credential errors cleanly
    let stkRes;
    try {
      stkRes = await initiateSTKPush({
        phone,
        amount:      order.totalPrice,
        orderId:     order._id.toString(),
        description: `${order.product?.name || 'Produce'}`.slice(0, 13),
      });
    } catch (mpesaErr) {
      // Return 400 so the frontend shows the real error, not a generic 500
      logger.error(`STK Push error: ${mpesaErr.message}`);
      return res.status(400).json({
        success: false,
        message: mpesaErr.message,
      });
    }

    const payment = await Payment.create({
      order:             orderId,
      buyer:             req.user.id,
      amount:            order.totalPrice,
      phone,
      merchantRequestId: stkRes.MerchantRequestID,
      checkoutRequestId: stkRes.CheckoutRequestID,
      status:            'pending',
    });

    order.paymentStatus = 'pending';
    await order.save();

    logger.info(`STK Push sent — CheckoutRequestID: ${stkRes.CheckoutRequestID}`);

    res.json({
      success:           true,
      message:           'STK Push sent. Check your phone and enter your M-Pesa PIN.',
      checkoutRequestId: stkRes.CheckoutRequestID,
      paymentId:         payment._id,
    });
  } catch (err) {
    next(err);
  }
};

// ── Safaricom Callback (always return 200 to Safaricom) ──────────────────
export const mpesaCallback = async (req, res) => {
  try {
    logger.info(`Daraja callback received: ${JSON.stringify(req.body)}`);

    const callback = req.body?.Body?.stkCallback;
    if (!callback) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

    const payment = await Payment.findOne({ checkoutRequestId: CheckoutRequestID });
    if (!payment) {
      logger.warn(`No payment record for CheckoutRequestID: ${CheckoutRequestID}`);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    payment.resultCode   = String(ResultCode);
    payment.resultDesc   = ResultDesc;
    payment.callbackData = req.body;

    if (ResultCode === 0) {
      // ── Payment successful ──
      const items   = CallbackMetadata?.Item || [];
      const getMeta = (name) => items.find((i) => i.Name === name)?.Value;

      payment.mpesaReceiptNumber = getMeta('MpesaReceiptNumber');
      payment.transactionDate    = String(getMeta('TransactionDate'));
      payment.status             = 'completed';

      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: 'paid',
        status:        'confirmed',
        paidAt:        new Date(),
        mpesaReceipt:  payment.mpesaReceiptNumber,
      });

      logger.info(`✅ Payment success — receipt: ${payment.mpesaReceiptNumber}`);
    } else {
      // ── Payment failed ──
      payment.status = 'failed';
      await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'failed' });
      logger.warn(`❌ Payment failed: ${ResultDesc}`);
    }

    await payment.save();
    // Safaricom requires exactly this response
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

  } catch (err) {
    logger.error(`Callback processing error: ${err.message}`);
    // Always acknowledge Safaricom even on internal errors
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};

// ── Query payment status ─────────────────────────────────────────────────
export const queryPaymentStatus = async (req, res, next) => {
  try {
    let payment = await Payment.findOne({
      checkoutRequestId: req.params.checkoutRequestId,
    }).populate('order');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'pending') {
      try {
        const statusRes = await querySTKStatus(req.params.checkoutRequestId);
        if (statusRes.ResultCode === '0') {
          payment.status = 'completed';
          await payment.save();
          await Order.findByIdAndUpdate(payment.order, {
            paymentStatus: 'paid',
            status:        'confirmed',
            paidAt:        new Date(),
          });
        }
      } catch (e) {
        logger.warn(`STK query warning: ${e.message}`);
      }
    }

    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

// ── Payment history ──────────────────────────────────────────────────────
export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ buyer: req.user.id })
      .populate({
        path:     'order',
        populate: { path: 'product', select: 'name category' },
      })
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

// ── Get receipt data (for modal) ─────────────────────────────────────────
export const getReceiptData = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyer',   'name phone email location')
      .populate('farmer',  'name phone location')
      .populate('product', 'name category unit pricePerUnit');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const allowed =
      order.buyer._id.toString()  === req.user.id ||
      order.farmer._id.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const payment = await Payment.findOne({ order: order._id, status: 'completed' });
    res.json({ success: true, order, payment });
  } catch (err) {
    next(err);
  }
};

// ── Download PDF receipt ─────────────────────────────────────────────────
export const downloadReceipt = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyer',   'name phone email location')
      .populate('farmer',  'name phone location')
      .populate('product', 'name category unit pricePerUnit');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const allowed =
      order.buyer._id.toString()  === req.user.id ||
      order.farmer._id.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Receipt is only available for paid orders',
      });
    }

    const payment = await Payment.findOne({ order: order._id, status: 'completed' });

    // ── Build PDF ────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="AGC-${order._id.toString().slice(-8).toUpperCase()}.pdf"`
    );
    doc.pipe(res);

    // Header bar
    doc.rect(0, 0, 595, 80).fill('#166534');
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold')
       .text('AGRO-CONNECT KENYA', 50, 20);
    doc.fontSize(11).font('Helvetica').fillColor('#86efac')
       .text('Direct Farm to Buyer Marketplace', 50, 48);
    doc.fillColor('#FFFFFF').fontSize(11)
       .text('Official Payment Receipt', 400, 34, { align: 'right', width: 145 });

    doc.moveDown(2);
    doc.fillColor('#166534').fontSize(16).font('Helvetica-Bold')
       .text('PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown(0.4);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#166534');
    doc.moveDown(0.8);

    // Meta rows
    const row = (label, value, green = false) => {
      doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold')
         .text(label, 50, doc.y, { continued: true, width: 180 });
      doc.font('Helvetica').fillColor(green ? '#166534' : '#111827')
         .text(value || 'N/A');
      doc.moveDown(0.4);
    };

    row('Receipt Date:',    new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }));
    row('Order ID:',        `#${order._id.toString().slice(-8).toUpperCase()}`);
    row('M-Pesa Receipt:',  payment?.mpesaReceiptNumber, true);
    row('Transaction Date:', payment?.transactionDate || '—');

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
    doc.moveDown(0.8);

    // Buyer & Farmer columns
    const infoY = doc.y;
    doc.fillColor('#166534').fontSize(11).font('Helvetica-Bold')
       .text('BUYER', 50, infoY)
       .text('FARMER', 300, infoY);

    const bLines = [order.buyer?.name, order.buyer?.phone, order.buyer?.location?.county].filter(Boolean);
    const fLines = [order.farmer?.name, order.farmer?.phone, order.farmer?.location?.county].filter(Boolean);

    bLines.forEach((l, i) => doc.fillColor('#374151').fontSize(10).font('Helvetica').text(l, 50,  infoY + 18 + i * 16));
    fLines.forEach((l, i) => doc.fillColor('#374151').fontSize(10).font('Helvetica').text(l, 300, infoY + 18 + i * 16));

    doc.y = infoY + 18 + Math.max(bLines.length, fLines.length) * 16 + 8;
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
    doc.moveDown(0.8);

    // Items table
    doc.fillColor('#166534').fontSize(11).font('Helvetica-Bold').text('ORDER DETAILS');
    doc.moveDown(0.4);

    const tY = doc.y;
    doc.rect(50, tY, 495, 22).fill('#F0FDF4');
    doc.fillColor('#166534').fontSize(9).font('Helvetica-Bold');
    const headers = ['PRODUCT', 'CATEGORY', 'QTY', 'UNIT PRICE', 'SUBTOTAL'];
    const xPos    = [55, 200, 305, 365, 465];
    const wPos    = [140, 100, 55, 95, 80];
    headers.forEach((h, i) => doc.text(h, xPos[i], tY + 6, { width: wPos[i] }));
    doc.y = tY + 26;

    const items = order.isCartOrder && order.cartItems?.length > 0
      ? order.cartItems
      : [{
          name:      order.product?.name,
          category:  order.product?.category,
          quantity:  order.quantity,
          unitPrice: order.unitPrice,
          subtotal:  order.totalPrice,
        }];

    items.forEach((item, idx) => {
      const rY = doc.y;
      if (idx % 2 === 1) doc.rect(50, rY, 495, 20).fill('#F9FAFB');
      doc.fillColor('#374151').fontSize(9).font('Helvetica');
      doc.text(item.name  || '—',                                55,  rY + 4, { width: 140 });
      doc.text(item.category || order.product?.category || '—',  200, rY + 4, { width: 100 });
      doc.text(`${item.quantity} ${order.product?.unit || ''}`,  305, rY + 4, { width: 55 });
      doc.text(`KSh ${(item.unitPrice || 0).toLocaleString()}`,  365, rY + 4, { width: 95 });
      doc.text(
        `KSh ${(item.subtotal || (item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}`,
        465, rY + 4, { width: 80, align: 'right' }
      );
      doc.y = rY + 22;
    });

    // Total
    doc.moveDown(0.3);
    doc.moveTo(365, doc.y).lineTo(545, doc.y).stroke('#166534');
    doc.moveDown(0.2);
    doc.fillColor('#166534').fontSize(13).font('Helvetica-Bold')
       .text('TOTAL PAID:', 365, doc.y, { continued: true, width: 95 });
    doc.text(`KSh ${order.totalPrice?.toLocaleString()}`, { align: 'right', width: 80 });
    doc.moveDown(1);

    // M-Pesa stamp
    const stampY = doc.y;
    doc.rect(50, stampY, 495, 48).fill('#F0FDF4').stroke('#86efac');
    doc.fillColor('#166534').fontSize(11).font('Helvetica-Bold')
       .text('✅  PAYMENT CONFIRMED VIA M-PESA', 50, stampY + 8, { align: 'center', width: 495 });
    doc.fillColor('#374151').fontSize(9).font('Helvetica')
       .text(
         `Receipt: ${payment?.mpesaReceiptNumber || 'N/A'}  |  ` +
         `KSh ${order.totalPrice?.toLocaleString()}  |  ` +
         `Phone: ${payment?.phone || '—'}`,
         50, stampY + 28, { align: 'center', width: 495 }
       );

    // Footer
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
    doc.moveDown(0.3);
    doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica')
       .text(
         'Agro-Connect Kenya  |  Empowering Farmers, Connecting Markets  |  This is an official receipt',
         { align: 'center' }
       );

    doc.end();
  } catch (err) {
    logger.error(`PDF error: ${err.message}`);
    next(err);
  }
};