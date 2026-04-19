const nodemailer = require('nodemailer')
const Contact    = require('../models/Contact')

// ─── POST /api/contact ────────────────────────────────────────────────────────
const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body

    if (!name || !email || !message)
      return res.status(400).json({ message: 'Name, email and message are required' })

    // Save to DB first
    const contact = await Contact.create({ name, email, message })

    // Send email via nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from:    `"AIQuiz Contact" <${process.env.EMAIL_USER}>`,
      to:      process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: `[AIQuiz Contact] New message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#020817;color:#e2e8f0;padding:32px;border-radius:12px;border:1px solid rgba(6,182,212,0.2)">
          <h2 style="color:#06b6d4;margin-top:0">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:100px">Name</td>
              <td style="padding:8px 0;color:#f1f5f9;font-weight:bold">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8">Email</td>
              <td style="padding:8px 0;color:#06b6d4">${email}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0"/>
          <p style="color:#94a3b8;margin-bottom:8px">Message</p>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;color:#f1f5f9;line-height:1.6;white-space:pre-wrap">${message}</div>
          <p style="color:#475569;font-size:12px;margin-top:24px">Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
      `,
    }

    try {
      await transporter.sendMail(mailOptions)
      contact.status = 'sent'
      await contact.save()
    } catch (mailErr) {
      console.error('Email send error:', mailErr.message)
      contact.status = 'failed'
      await contact.save()
      // Still return success to user — message is saved in DB
    }

    res.status(201).json({ message: 'Message received! We will get back to you soon.' })
  } catch (err) { next(err) }
}

module.exports = { submitContact }