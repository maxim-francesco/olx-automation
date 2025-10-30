const nodemailer = require("nodemailer");

// 1. Configurăm "transportatorul" de email folosind datele din .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true pentru portul 465, false pentru alte porturi
  auth: {
    user: process.env.EMAIL_USER, // adresa ta de gmail
    pass: process.env.EMAIL_PASS, // parola de 16 caractere pentru aplicație
  },
});

/**
 * Trimite un email de notificare folosind Nodemailer
 * @param {object} adDetails - Detaliile anuntului din baza de date
 * @param {string} conversationContext - Mesajul primit de la proprietar
 */
const sendNotificationEmail = async (adDetails, conversationContext) => {
  const { title, price, location, url, phone } = adDetails;

  const mailOptions = {
    from: `"Notificări OLX Bot" <${process.env.EMAIL_USER}>`, // Numele expeditorului și adresa
    to: process.env.TO_EMAIL,
    subject: `🔥 Răspuns nou pe WhatsApp de la ${phone}`,
    html: `
      <p>Ai primit un răspuns pe WhatsApp! Trebuie să preiei manual conversația.</p>
      <hr>
      <h3>Detalii Anunț:</h3>
      <ul>
        <li><strong>Titlu:</strong> ${title}</li>
        <li><strong>Preț:</strong> ${price}</li>
        <li><strong>Locație:</strong> ${location}</li>
        <li><strong>Telefon:</strong> ${phone}</li>
        <li><strong>Link:</strong> <a href="${url}">${url}</a></li>
      </ul>
      <hr>
      <h3>Context Conversație:</h3>
      <p><em>"${conversationContext}"</em></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email de notificare trimis cu succes către ${process.env.TO_EMAIL}`
    );
  } catch (error) {
    console.error("❌ Eroare la trimiterea emailului de notificare:", error);
  }
};

module.exports = { sendNotificationEmail };
