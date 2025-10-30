import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        // --- AICI ESTE MODIFICAREA ---
        // Construim URL-ul complet folosind variabila din .env
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/ads`;
        // Folosim noul URL în cererea axios
        const response = await axios.get(apiUrl);

        setAds(response.data);
      } catch (error) {
        console.error("Eroare la preluarea datelor din backend:", error);
        alert(
          "Nu am putut încărca datele. Verifică dacă serverul backend este pornit."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <h1>Se încarcă anunțurile...</h1>
      </div>
    );
  }

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
