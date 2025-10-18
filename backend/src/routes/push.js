const express = require('express');
const webpush = require('web-push');
const router = express.Router();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('VAPID keys not found in .env. Web push will not work until VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are set.');
}

webpush.setVapidDetails(
  `mailto:${process.env.PUSH_CONTACT_EMAIL || 'admin@example.com'}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// In-memory subscriptions store (for demo). In production persist per-user in DB.
let subscriptions = [];

/**
 * POST /push/subscribe
 * Body: subscription object from the browser
 */
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Invalid subscription' });
  }

  // avoid duplicates
  const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    console.log('Push subscription added:', subscription.endpoint);
  }

  res.status(201).json({ success: true });
});

/**
 * Utility: sendNotification(message)
 * other files can require this and call sendNotification(msg)
 */
const sendNotification = async (message, payload = {}) => {
  const payloadObj = {
    title: payload.title || '🚨 Gas Alert',
    body: message,
    data: payload.data || {}
  };

  const body = JSON.stringify(payloadObj);

  subscriptions.forEach(async (sub, idx) => {
    try {
      await webpush.sendNotification(sub, body);
    } catch (err) {
      console.error('Error sending push to', sub.endpoint, err.message || err);
      // Remove subscription if gone
      if (err.statusCode === 410 || err.statusCode === 404) {
        subscriptions.splice(idx, 1);
      }
    }
  });
};

module.exports = { router, sendNotification };
