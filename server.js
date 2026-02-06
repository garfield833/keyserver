const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const db = new sqlite3.Database("./keys.db");

app.use(bodyParser.json());

app.post("/verify", (req, res) => {
    const { key, hwid } = req.body;

    if (!key || !hwid) {
        return res.json({ status: "error" });
    }

    db.get("SELECT * FROM keys WHERE key = ?", [key], (err, row) => {
        if (err) return res.json({ status: "error" });
        if (!row) return res.json({ status: "invalid" });

        if (!row.hwid) {
            db.run(
                "UPDATE keys SET hwid = ?, used = 1 WHERE key = ?",
                [hwid, key]
            );
            return res.json({ status: "success", type: row.type });
        }

        if (row.hwid === hwid) {
            return res.json({ status: "success", type: row.type });
        }

        return res.json({ status: "hwid_mismatch" });
    });
});

app.get("/", (_, res) => {
    res.send("Key Server Online");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server läuft auf Port", PORT));
