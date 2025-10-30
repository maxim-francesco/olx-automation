const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendNotificationEmail } = require("../services/emailService");

router.post("/reply", async (req, res) => {
  const from = req.body.From;
  const body = req.body.Body;
  console.log(`📥 Webhook primit de la ${from}: "${body}"`);

  // --- LOGICĂ NOUĂ ȘI CORECTATĂ: Filtrarea cuvintelor întregi ---
  const negativeKeywords = [
    "nu",
    "refuz",
    "stop",
    "greseala",
    "anuleaza",
    // Am scos 'nu sunt' etc. pentru că 'nu' este suficient dacă e cuvânt întreg
  ];

  // Construim o expresie regulată care caută oricare dintre cuvintele cheie
  // \b - reprezintă o limită de cuvânt (spațiu, punctuație, etc.)
  // 'i' - face căutarea insensibilă la majuscule (case-insensitive)
  const negativeRegex = new RegExp(
    `\\b(${negativeKeywords.join("|")})\\b`,
    "i"
  );

  if (negativeRegex.test(body)) {
    console.log(`💬 Răspuns negativ detectat. Nu se va trimite notificare.`);
    return res.status(200).send("OK - Negative Reply");
  }
  // --- Sfârșitul logicii noi ---

  try {
    const latestAd = await prisma.ad.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (latestAd) {
      console.log(
        `[MOD DE TEST] Răspuns pozitiv/neutru. Se trimite email pentru: "${latestAd.title}"`
      );
      await sendNotificationEmail(latestAd, body);
      await prisma.ad.update({
        where: { id: latestAd.id },
        data: { status: "REPLIED" },
      });
    } else {
      console.warn(`[AVERTISMENT] Nu am găsit niciun anunț în baza de date.`);
    }
  } catch (error) {
    console.error("Eroare în procesarea webhook-ului:", error);
  }

  res.status(200).send("OK");
});

module.exports = router;
