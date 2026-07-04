const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      value BIGINT DEFAULT 0,
      tier TEXT DEFAULT 'midlights',
      job_id TEXT DEFAULT '',
      timestamp BIGINT NOT NULL
    );
  `);

  const count = await pool.query("SELECT COUNT(*) FROM logs");

  if (Number(count.rows[0].count) === 0) {
    await pool.query(
      `INSERT INTO logs (id, name, value, tier, job_id, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        "1",
        "Garama and Madundung",
        1500000,
        "highlights",
        "",
        Math.floor(Date.now() / 1000)
      ]
    );
  }

  console.log("Database ready");
}

app.get("/", (req, res) => {
  res.send("Megalodon Backend Online");
});

app.get("/recent", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        value,
        tier,
        job_id AS "jobId",
        timestamp
      FROM logs
      ORDER BY timestamp DESC
      LIMIT 100
    `);

    res.json({
      findings: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recent logs" });
  }
});

app.get("/stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE tier = 'peaklights')::int AS peaklights,
        COUNT(*) FILTER (WHERE tier = 'highlights')::int AS highlights,
        COUNT(*) FILTER (WHERE tier = 'midlights')::int AS midlights,
        COUNT(*) FILTER (WHERE tier = 'lowlights')::int AS lowlights,
        COUNT(*) FILTER (WHERE tier = 'steals')::int AS steals
      FROM logs
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/bots", (req, res) => {
  res.json({ bots: [] });
});

app.post("/add", async (req, res) => {
  try {
    const item = {
      id: String(Date.now()),
      name: req.body.name || "Unknown Brainrot",
      value: Number(req.body.value || 0),
      tier: req.body.tier || "midlights",
      jobId: req.body.jobId || "",
      timestamp: Math.floor(Date.now() / 1000)
    };

    await pool.query(
      `INSERT INTO logs (id, name, value, tier, job_id, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        item.id,
        item.name,
        item.value,
        item.tier,
        item.jobId,
        item.timestamp
      ]
    );

    res.json({
      ok: true,
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add log" });
  }
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database init failed:", err);
    process.exit(1);
  });
