const express = require("express");
const pool = require("./config/db");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Node.js backend!");
});
app.get("/campaigns", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM finance.campaign"); // ví dụ bảng users
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi truy vấn database");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
