// Importăm configurarea variabilelor de mediu
require("dotenv").config();

// Inițializăm clientul Twilio cu cheile din .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

/**
 * Trimite un mesaj WhatsApp folosind Twilio
 * @param {string} to - Numărul de telefon al destinatarului (ex: 'whatsapp:+40712345678')
 * @param {string} body - Conținutul mesajului
 */
const sendWhatsAppMessage = async (to, body) => {
  try {
    const message = await client.messages.create({
      body: body,
      from: process.env.TWILIO_WHATSAPP_NUMBER, // Numărul sandbox-ului Twilio
      to: to, // Numărul destinatarului
    });
    console.log(
      `✅ Mesaj WhatsApp trimis cu succes către ${to}. SID: ${message.sid}`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Eroare la trimiterea mesajului WhatsApp către ${to}:`,
      error.message
    );
    return false;
  }
};

module.exports = { sendWhatsAppMessage };
