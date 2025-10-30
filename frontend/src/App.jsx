import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Vom crea acest fișier pentru stilizare

function App() {
  // 1. Creăm o variabilă "state" unde vom stoca lista de anunțuri.
  // Inițial, este un array gol.
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true); // O variabilă pentru a afișa un mesaj de încărcare

  // 2. Folosim "useEffect" pentru a rula cod la încărcarea componentei.
  // Array-ul gol `[]` de la final asigură că se rulează o singură dată.
  useEffect(() => {
    // Definim funcția care preia datele
    const fetchAds = async () => {
      try {
        // 3. Facem o cerere GET către API-ul nostru.
        // Asigură-te că serverul backend rulează pe portul 3000!
        const response = await axios.get("http://localhost:3000/api/ads");

        // 4. Actualizăm state-ul cu datele primite de la server.
        setAds(response.data);
      } catch (error) {
        console.error("Eroare la preluarea datelor din backend:", error);
        alert(
          "Nu am putut încărca datele. Verifică dacă serverul backend este pornit."
        );
      } finally {
        // Indiferent dacă a reușit sau nu, oprim starea de încărcare
        setLoading(false);
      }
    };

    fetchAds(); // Apelăm funcția
  }, []);

  // Afișăm un mesaj de încărcare cât timp se preiau datele
  if (loading) {
    return (
      <div className="App">
        <h1>Se încarcă anunțurile...</h1>
      </div>
    );
  }

  // 5. Afișăm datele într-un tabel.
  return (
    <div className="App">
      <h1>Panou de Control - Anunțuri OLX</h1>
      <p>Au fost găsite **{ads.length}** anunțuri salvate.</p>
      <table>
        <thead>
          <tr>
            <th>Titlu</th>
            <th>Preț</th>
            <th>Telefon</th>
            <th>Status</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {/* 6. Iterăm prin fiecare anunț și creăm un rând în tabel */}
          {ads.map((ad) => (
            <tr key={ad.id}>
              <td>{ad.title}</td>
              <td>{ad.price}</td>
              <td>{ad.phone}</td>
              <td>
                <span className={`status status-${ad.status.toLowerCase()}`}>
                  {ad.status}
                </span>
              </td>
              <td>
                <a href={ad.url} target="_blank" rel="noopener noreferrer">
                  Vezi Anunț
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
