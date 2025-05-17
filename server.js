// server.js
const express = require('express');
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const app = express();
const PORT = 3000;

// Serve static files like index.html
app.use(express.static(__dirname + '/frontend'));

// Keywords-based category logic (mini "ML")
function getCategory(title, description) {
  const text = (title + " " + description).toLowerCase();
  if (text.includes("plastic") || text.includes("waste")) return "Pollution";
  if (text.includes("coral") || text.includes("fish") || text.includes("turtle")) return "Marine Life";
  if (text.includes("climate") || text.includes("temperature")) return "Climate";
  if (text.includes("policy") || text.includes("regulation")) return "Policy";
  return "General";
}

// Fetch RSS and filter logic
app.get('/news', async (req, res) => {
  const RSS_URL = 'https://news.google.com/rss/search?q=ocean+marine+pollution&hl=en-IN&gl=IN&ceid=IN:en';

  try {
    const response = await fetch(RSS_URL);
    const xml = await response.text();

    xml2js.parseString(xml, (err, result) => {
      if (err) return res.status(500).send("XML parse error");

      const items = result.rss.channel[0].item.slice(0, 10).map(item => {
        const title = item.title[0];
        const description = item.description[0];
        const link = item.link[0];
        return {
          title,
          description,
          link,
          category: getCategory(title, description)
        };
      });

      res.json(items);
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).send("Failed to load news.");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
