const express = require("express");
const cors = require("cors");
const whatsappRoutes = require("./api/whatsappRoutes");
const adRoutes = require("./api/adRoutes"); // <-- ADAUGĂ ASTA
const systemRoutes = require("./api/systemRoutes"); // <-- ADAUGĂ ASTA

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Salut! Serverul pentru OLX Automation funcționează!");
});

// Folosim rutele pe căile corespunzătoare
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/ads", adRoutes); // <-- ADAUGĂ ASTA
app.use("/api/system", systemRoutes); // <-- ADAUGĂ ASTA

app.listen(port, "0.0.0.0", () => {
  console.log(`Serverul rulează pe portul ${port}`);
});
