const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Endpoint: GET /api/ads/
// Scop: Returnează toate anunțurile din baza de date
router.get("/", async (req, res) => {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: {
        createdAt: "desc", // Sortează de la cel mai nou la cel mai vechi
      },
    });
    res.json(ads);
  } catch (error) {
    console.error("Eroare la preluarea anunțurilor:", error);
    res.status(500).json({ error: "Nu am putut prelua anunțurile." });
  }
});

module.exports = router;
