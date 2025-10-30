const express = require("express");
const router = express.Router();
const { scrapeOLX } = require("../services/scraperService");

// Endpoint: GET /api/system/start-scrape
// Scop: Pornește manual procesul de scraping.
router.get("/start-scrape", async (req, res) => {
  // O metodă simplă de securitate pentru a preveni accesul neautorizat
  const secret = req.query.secret;
  if (secret !== process.env.TRIGGER_SECRET) {
    return res.status(403).send("Acces interzis.");
  }

  // Trimitem un răspuns imediat, ca să nu aștepte browser-ul
  res
    .status(202)
    .send("Procesul de scraping a fost pornit în fundal. Verifică log-urile.");

  // Rulăm funcția de scraping, dar nu așteptăm finalizarea ei (o lăsăm să ruleze în fundal)
  scrapeOLX().catch((err) => {
    console.error("Eroare în timpul rulării manuale a scraper-ului:", err);
  });
});

module.exports = router;
