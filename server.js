const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const logs = [
  {
    id: "1",
    name: "Garama and Madundung",
    value: 1500000,
    tier: "highlights",
    jobId: "",
    timestamp: Math.floor(Date.now() / 1000)
  }
];

app.get("/", (req, res) => {
  res.send("Megalodon Backend Online");
});

app.get("/recent", (req, res) => {
  res.json({
    findings: logs
  });
});

app.get("/stats", (req, res) => {
  res.json({
    total: logs.length,
    peaklights: logs.filter(x => x.tier === "peaklights").length,
    highlights: logs.filter(x => x.tier === "highlights").length,
    midlights: logs.filter(x => x.tier === "midlights").length,
    lowlights: logs.filter(x => x.tier === "lowlights").length,
    steals: logs.filter(x => x.tier === "steals").length
  });
});

app.get("/bots", (req, res) => {
  res.json({ bots: [] });
});

app.post("/add", (req, res) => {
  const item = {
    id: String(Date.now()),
    name: req.body.name || "Unknown Brainrot",
    value: Number(req.body.value || 0),
    tier: req.body.tier || "midlights",
    jobId: req.body.jobId || "",
    timestamp: Math.floor(Date.now() / 1000)
  };

  logs.unshift(item);

  if (logs.length > 100) {
    logs.pop();
  }

  res.json({
    ok: true,
    item
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
