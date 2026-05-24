require("dotenv").config();
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname)));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalize(value) {
  return String(value || "").trim();
}

function makeTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

app.post("/contact", async (req, res) => {
  try {
    const name = normalize(req.body.name);
    const email = normalize(req.body.email);
    const phone = normalize(req.body.phone);
    const message = normalize(req.body.message);
    const honeypot = normalize(req.body.company); // должно быть пустым

    // Базовая защита от ботов
    if (honeypot) {
      return res.status(200).json({ success: true, message: "OK" });
    }

    // Серверная валидация
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: "Заполните все обязательные поля."
      });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Некорректный email."
      });
    }

    if (message.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Сообщение слишком короткое."
      });
    }

    const toEmail = process.env.RECIPIENT_EMAIL || "iva170930@gmail.com";
    const transporter = makeTransporter();

    const subject = "Новая заявка с сайта";
    const text = [
      "Новая заявка с сайта",
      "",
      `Имя: ${name}`,
      `Email: ${email}`,
      `Телефон: ${phone}`,
      "",
      "Сообщение:",
      message
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
        <h2 style="margin:0 0 12px">Новая заявка с сайта</h2>
        <table cellpadding="6" cellspacing="0" border="0" style="border-collapse:collapse">
          <tr><td><strong>Имя:</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
          <tr><td><strong>Телефон:</strong></td><td>${phone}</td></tr>
        </table>
        <p style="margin:14px 0 6px"><strong>Сообщение:</strong></p>
        <p style="margin:0;white-space:pre-wrap">${message}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"GREEN-RESULT Site" <${process.env.SMTP_USER}>`,
      to: toEmail,
      replyTo: email,
      subject,
      text,
      html
    });

    console.log(
      `[CONTACT] ${new Date().toISOString()} | name="${name}" | email="${email}" | phone="${phone}"`
    );

    return res.status(200).json({
      success: true,
      message: "Сообщение успешно отправлено."
    });
  } catch (error) {
    console.error("[CONTACT_ERROR]", error);
    return res.status(500).json({
      success: false,
      error: "Ошибка отправки. Попробуйте позже."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
