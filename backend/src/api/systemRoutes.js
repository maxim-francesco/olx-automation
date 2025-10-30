const express = require("express");
const router = express.Router();
const { scrapeOLX } = require("../services/scraperService");
const { PrismaClient } = require("@prisma/client"); // <-- ADAUGĂ ASTA
const prisma = new PrismaClient(); // <-- ADAUGĂ ASTA

// Endpoint: GET /api/system/start-scrape
// Scop: Pornește manual procesul de scraping.
router.get("/start-scrape", async (req, res) => {
  const secret = req.query.secret;
  if (secret !== process.env.TRIGGER_SECRET) {
    return res.status(403).send("Acces interzis.");
  }

  res
    .status(202)
    .send("Procesul de scraping a fost pornit în fundal. Verifică log-urile.");

  scrapeOLX().catch((err) => {
    console.error("Eroare în timpul rulării manuale a scraper-ului:", err);
  });
});

// --- ENDPOINT NOU: GET /api/system/clear-db ---
// Scop: Șterge toate anunțurile din baza de date pentru a permite re-testarea.
router.get("/clear-db", async (req, res) => {
  const secret = req.query.secret;
  if (secret !== process.env.TRIGGER_SECRET) {
    return res.status(403).send("Acces interzis.");
  }

  try {
    const { count } = await prisma.ad.deleteMany({});
    const message = `✅ Baza de date a fost curățată. ${count} anunțuri au fost șterse.`;
    console.log(message);
    res.status(200).send(message);
  } catch (error) {
    console.error("Eroare la curățarea bazei de date:", error);
    res.status(500).send("Nu am putut curăța baza de date.");
  }
});

module.exports = router;
