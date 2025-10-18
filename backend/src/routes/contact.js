// backend/src/routes/contact.ts
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/send', async (req, res) => {
  const { name, email, subject, priority, message } = req.body;

  if (!name || !email || !subject || !priority || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Configure your mail transporter (using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.FIRE_STATION_EMAIL,
        pass: process.env.FIRE_STATION_PASSWORD
      }
    });

    await transporter.sendMail({
      from: email,
      to: process.env.FIRE_STATION_EMAIL, // fire station email
      subject: `[${priority.toUpperCase()}] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nPriority: ${priority}\n\n${message}`
    });

    return res.status(200).json({ message: 'Message sent to fire station' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
