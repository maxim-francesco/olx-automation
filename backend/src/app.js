const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const whatsappRoutes = require("./api/whatsappRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Salut! Serverul pentru OLX Automation funcționează!");
});

app.use("/api/whatsapp", whatsappRoutes);

app.listen(port, () => {
  console.log(`Serverul rulează pe http://localhost:${port}`);
});
