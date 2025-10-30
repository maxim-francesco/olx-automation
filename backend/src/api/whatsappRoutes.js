const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendNotificationEmail } = require("../services/emailService");

router.post("/reply", async (req, res) => {
  const from = req.body.From;
  const body = req.body.Body;
  console.log(`📥 Webhook primit de la ${from}: "${body}"`);

  const phoneToSearch = from.replace("whatsapp:+40", "0");

  try {
    const ad = await prisma.ad.findFirst({
      where: { phone: { contains: phoneToSearch.substring(1) } },
    });

    if (ad) {
      await sendNotificationEmail(ad, body);
      await prisma.ad.update({
        where: { id: ad.id },
        data: { status: "REPLIED" },
      });
    } else {
      console.warn(
        `[AVERTISMENT] Nu am găsit niciun anunț pentru numărul ${phoneToSearch}`
      );
    }
  } catch (error) {
    console.error("Eroare în procesarea webhook-ului:", error);
  }

  res.status(200).send("OK");
});

module.exports = router;
