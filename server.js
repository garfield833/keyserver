const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.use(express.json());

// Pfad zur Datei, die die Key-Daten speichert
const keysFilePath = path.join(__dirname, "keys.json");

// Liste der Keys und UserIds (diese Datei wird die Daten speichern)
let keysData = {
  "Free-A9F2Q-LM8X4": null,
  "Free-K7D3P-2R9WQ": null,
  "Prem-X9A2Q-W8PLM": null,
  "Prem-QX2W9-8APLM": null
};

// Load the keys data from the file at server startup
if (fs.existsSync(keysFilePath)) {
  const rawData = fs.readFileSync(keysFilePath);
  keysData = JSON.parse(rawData);
}

app.post("/verify", (req, res) => {
  const { key, userId } = req.body;

  if (!key || !userId) {
    return res.status(400).json({ status: "error", message: "Key und UserId fehlen" });
  }

  // Überprüfen, ob der Key existiert
  if (!keysData[key]) {
    return res.status(404).json({ status: "error", message: "Key nicht gefunden" });
  }

  // Überprüfen, ob der Key bereits an eine UserId gebunden ist
  if (keysData[key] && keysData[key] !== userId) {
    return res.status(400).json({ status: "hwid_mismatch", message: "Dieser Key ist bereits an einen anderen Benutzer gebunden" });
  }

  // Wenn der Key noch nicht gebunden ist, binde ihn an die UserId
  keysData[key] = userId;

  // Speichern der Daten
  fs.writeFileSync(keysFilePath, JSON.stringify(keysData, null, 2));

  // Rückmeldung an den Client
  res.status(200).json({
    status: "success",
    message: "Key gebunden",
    type: key.includes("Prem") ? "Prem" : "Free" // Je nach Key-Typ
  });
});

// Server starten
const port = 3000;
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
