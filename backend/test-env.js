// Importăm librăria dotenv
require("dotenv").config();

// Afișăm în consolă valoarea variabilei DATABASE_URL
console.log("Variabila citită din .env este:");
console.log(process.env.DATABASE_URL);
