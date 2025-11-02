const { PrismaClient } = require("@prisma/client");
const { sendWhatsAppMessage } = require("./whatsappService"); // <-- ADAUGĂ ACEASTĂ LINIE
const prisma = new PrismaClient();
const puppeteer = require("puppeteer");

// --- NOU: Funcție de detecție euristică a agențiilor ---
const isAgency = async (page) => {
  // Cuvinte cheie care indică o agenție, GĂSITE ÎN NUMELE VÂNZĂTORULUI
  const AGENCY_KEYWORDS_IN_NAME = [
    "imobiliare",
    "srl",
    "agency",
    "agentie",
    "real estate",
    "consulting",
    "grup",
  ];

  // Cuvinte cheie care indică o agenție, GĂSITE ÎN DESCRIEREA ANUNȚULUI
  const AGENCY_KEYWORDS_IN_DESC = [
    "comision",
    "exclusivitate",
    "agentia",
    "consultant",
    "va propune",
  ];

  try {
    // 1. Analizăm NUMELE vânzătorului - cel mai puternic indicator
    const sellerNameSelector = '[data-testid="user-profile-user-name"]'; // <-- LINIA NOUĂ
    const sellerName = await page.$eval(sellerNameSelector, (el) =>
      el.innerText.toLowerCase()
    );

    for (const keyword of AGENCY_KEYWORDS_IN_NAME) {
      if (sellerName.includes(keyword)) {
        console.log(
          `- Detecție (Nume vânzător: "${sellerName}" conține "${keyword}")`
        );
        return true; // Este agenție
      }
    }

    // 2. Analizăm DESCRIEREA anunțului
    const descriptionSelector = '[data-cy="ad_description"]'; // <-- LINIA NOUĂ
    const description = await page.$eval(descriptionSelector, (el) =>
      el.innerText.toLowerCase()
    );

    for (const keyword of AGENCY_KEYWORDS_IN_DESC) {
      if (description.includes(keyword)) {
        console.log(`- Detecție (Descriere conține "${keyword}")`);
        return true; // Este agenție
      }
    }
  } catch (error) {
    console.warn(
      `Avertisment: Nu am putut analiza vânzătorul/descrierea. E posibil ca selectorii să se fi schimbat.`,
      error.message
    );
    // Presupunem că este agenție dacă nu putem verifica, pentru siguranță
    return true;
  }

  // Dacă nu am găsit niciun cuvânt cheie suspect, probabil este proprietar
  return false;
};

// --- Funcția de extragere a detaliilor, V3.5 - gestionează butoane duplicate ---
const getAdDetails = async (url, browser) => {
  let adPage;
  try {
    adPage = await browser.newPage();
    await adPage.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    if (await isAgency(adPage)) {
      console.log(`- Ignorat (Detectat ca Agenție): ${url}`);
      await adPage.close();
      return null;
    }

    const title = await adPage.$eval("h4.css-1l3a0i9", (el) => el.innerText);
    const price = await adPage.$eval("h3.css-1j840l6", (el) => el.innerText);
    const location = await adPage.$eval("p.css-9pna1a", (el) => el.innerText);

    let phoneNumber = null;

    try {
      const phoneButtonSelector = '[data-cy="ad-contact-phone"]';
      const phoneNumberSelector = '[data-testid="contact-phone"]';

      // --- LOGICĂ NOUĂ: Găsim TOATE butoanele și încercăm să dăm click pe cel vizibil ---
      await adPage.waitForSelector(phoneButtonSelector); // Așteptăm să existe cel puțin un buton

      // Folosim o funcție direct în browser pentru a găsi și a da click pe butonul VIZIBIL
      await adPage.evaluate((selector) => {
        const buttons = Array.from(document.querySelectorAll(selector));
        const visibleButton = buttons.find(
          (btn) => btn.offsetHeight > 0 && btn.offsetWidth > 0
        );
        if (visibleButton) {
          visibleButton.click();
        } else {
          throw new Error("Nu am găsit niciun buton de telefon vizibil.");
        }
      }, phoneButtonSelector);

      await adPage.waitForSelector(phoneNumberSelector, { visible: true });
      phoneNumber = await adPage.$eval(
        phoneNumberSelector,
        (el) => el.innerText
      );

      console.log(`+ Găsit proprietar: ${title} | Telefon: ${phoneNumber}`);
    } catch (e) {
      console.warn(
        `[AVERTISMENT] Anunțul "${title}" nu are un număr de telefon vizibil sau a apărut o eroare la click: ${e.message}`
      );
    }

    if (!phoneNumber) {
      console.log(`- Ignorat (Fără număr de telefon): ${title}`);
      await adPage.close();
      return null;
    }

    await adPage.close();

    return { title, price, location, phone: phoneNumber, url };
  } catch (error) {
    console.error(`Eroare la procesarea URL-ului ${url}: ${error.message}`);
    if (adPage) await adPage.close();
    return null;
  }
};

// --- Funcția principală, acum cu filtru pentru Storia ---
const scrapeOLX = async () => {
  console.log("🚀 Se pornește scraper-ul V4 (Căutare Inteligentă)...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: puppeteer.executablePath(),
  });

  // NOU: Definim o limită pentru a nu căuta la nesfârșit
  const MAX_PAGES_TO_CHECK = 5;
  let foundNewAd = false;

  for (
    let pageNum = 1;
    pageNum <= MAX_PAGES_TO_CHECK && !foundNewAd;
    pageNum++
  ) {
    const page = await browser.newPage();

    // NOU: Construim URL-ul dinamic, adăugând numărul paginii
    const OLX_URL = `https://www.olx.ro/imobiliare/apartamente-garsoniere-de-vanzare/cluj-napoca/?page=${pageNum}`;
    console.log(`🔎 Verific pagina ${pageNum}: ${OLX_URL}`);

    await page.goto(OLX_URL, { waitUntil: "networkidle2" });

    // Închidem pop-up-ul de cookie-uri dacă apare (cod defensiv)
    try {
      await page.waitForSelector('[data-testid="accept-cookies-button"]', {
        timeout: 3000,
      });
      await page.click('[data-testid="accept-cookies-button"]');
    } catch (e) {
      /* Nu facem nimic dacă nu apare */
    }

    // Extragem link-urile de pe pagina curentă
    const adUrls = await page.$$eval('[data-cy="l-card"] a', (links) =>
      links.map((link) => link.href)
    );

    if (adUrls.length === 0) {
      console.log(
        "Nu am mai găsit anunțuri pe această pagină. Oprire căutare."
      );
      break; // Ieșim din buclă dacă pagina nu are anunțuri
    }

    // NOU: Iterăm prin link-uri și ne oprim la primul anunț nou găsit
    for (const url of adUrls) {
      if (url.includes("storia.ro")) {
        console.log(`- Ignorat (Link Storia): ${url.substring(0, 50)}...`);
        continue;
      }

      const existingAd = await prisma.ad.findUnique({ where: { url } });

      if (!existingAd) {
        // --- AM GĂSIT UN ANUNȚ NOU! ---
        console.log(`✅ Anunț nou găsit! Procesez: ${url}`);
        foundNewAd = true; // Setăm steagul pentru a opri bucla exterioară

        const adDetails = await getAdDetails(url, browser);

        if (adDetails) {
          const newAd = await prisma.ad.create({ data: adDetails });
          console.log(`💾 Salvat în baza de date: ${newAd.title}`);

          // Logica de trimitere WhatsApp rămâne la fel
          const cleanedPhone = newAd.phone.replace(/\D/g, "");
          const realRecipient = `whatsapp:+40${cleanedPhone.substring(1)}`;
          const finalRecipient =
            process.env.MY_TEST_WHATSAPP_NUMBER || realRecipient;
          const messageBody = `Buna ziua! Am gasit anuntul dvs. "${newAd.title}" pe OLX. Doresc sa va prezint o oferta de colaborare. Sunteti disponibil(a) pentru o scurta discutie?`;

          await sendWhatsAppMessage(finalRecipient, messageBody);
          if (process.env.MY_TEST_WHATSAPP_NUMBER) {
            console.log(
              `REDIRECT: Mesajul pentru ${realRecipient} a fost trimis la numărul de test.`
            );
          }
        }

        break; // Ieșim din bucla curentă (for...of)
      }
    }
    await page.close();

    if (foundNewAd) {
      console.log("🏁 Misiune îndeplinită. Oprire căutare generală.");
    } else {
      console.log(
        `Trec la pagina următoare. Toate cele ${adUrls.length} anunțuri de pe pagina ${pageNum} erau deja salvate.`
      );
    }
  }

  await browser.close();
  console.log("✅ Procesul de scraping s-a încheiat.");
};

module.exports = { scrapeOLX };
