const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors'); // Import CORS middleware

const app = express();
const PORT = 5000;

const BASE_URL = 'http://www.osu.edu.et/';

// Configure CORS to allow requests from localhost:5173
app.use(cors({
  origin: ['http://localhost:5173', 'https://osu-hub.vercel.app']
}));

const fetchNewsAndEvents = async () => {
  try {
    console.log('Fetching news and events from OSU website...');
    const response = await axios.get(BASE_URL, { timeout: 100000 });
    const html = response.data;

    const $ = cheerio.load(html);
    const newsItems = [];
    const upcomingEvents = [];

    // Fetch news items
    $('#block-views-my-latest-news-block .view-content .views-row').each((i, el) => {
      const title = $(el).find('.views-field-title a').text().trim();
      const link = $(el).find('.views-field-title a').attr('href');
      const fullLink = new URL(link, BASE_URL).href;
      const sampleText = $(el).find('.views-field-body p').first().text().trim();
      const imageLink = $(el).find('.views-field-body img').attr('src');
      const datePosted = $(el).find('.views-field-title a').text().match(/\d{4}-\d{2}-\d{2}/);

      newsItems.push({
        title,
        link: fullLink,
        sampleText,
        imageLink: imageLink ? new URL(imageLink, BASE_URL).href : null,
      });
    });

    // Fetch upcoming events
    $('#block-views-upcoming-events-block .view-content .views-row').each((i, el) => {
      const title = $(el).find('.views-field-title a').text().trim();
      const link = $(el).find('.views-field-title a').attr('href');
      const fullLink = new URL(link, BASE_URL).href;
      const imageLink = $(el).find('.views-field-field-upcoming-events img').attr('src');

      upcomingEvents.push({
        title,
        link: fullLink,
        imageLink: imageLink ? new URL(imageLink, BASE_URL).href : null,
      });
    });

    console.log('News items fetched:', newsItems);
    console.log('Upcoming events fetched:', upcomingEvents);
    return { newsItems, upcomingEvents };
  } catch (error) {
    console.error('Error fetching news and events:', error.message);
    return { newsItems: [], upcomingEvents: [] };
  }
};

// Define a route to fetch and serve the news and events
app.get('/api/news', async (req, res) => {
  const data = await fetchNewsAndEvents();
  res.json(data);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});