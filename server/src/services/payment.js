import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env.js';

let instance;

const getRazorpay = () => {
  if (!instance) {
    instance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};

/**
 * Create a Razorpay order.
 * @param {number} amount — in INR (will be converted to paise)
 * @param {string} receipt — unique receipt id
 * @returns {Promise<object>} Razorpay order
 */
export const createOrder = async (amount, receipt) => {
  const rz = getRazorpay();
  const options = {
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt,
  };
  return rz.orders.create(options);
};

/**
 * Verify Razorpay payment signature.
 */
export const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};
