import express from 'express';
import { initiatePayment, mpesaCallback, queryPaymentStatus, getPaymentHistory, getReceiptData, downloadReceipt } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.post('/stk-push', protect, initiatePayment);
router.post('/callback', mpesaCallback); // public — Safaricom calls this
router.get('/status/:checkoutRequestId', protect, queryPaymentStatus);
router.get('/history', protect, getPaymentHistory);
router.get('/receipt-data/:orderId', protect, getReceiptData);
router.get('/receipt/:orderId', protect, downloadReceipt);
export default router;
