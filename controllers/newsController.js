import axios from "axios";
import News from "../models/newsModel.js"; // Assuming a news model is created

// Fetch and store news from the News API
export const fetchAndStoreNews = async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

        const response = await axios.get(`${process.env.NEWS_API_URL}?q=jobs`, {
          params: {
            apiKey: process.env.NEWS_API_KEY,
            pageSize: 100,
            sortBy: "publishedAt",
          },
        });
      
  
      const articles = response.data.articles;
  
      // Clear old news if necessary
      await News.deleteMany();
  
      // Map and save new articles
      const newsData = articles.map(article => ({
        source: {
          id: article.source.id,
          name: article.source.name,
        },
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        content: article.content,
      }));
  
      await News.insertMany(newsData);
  
      res.status(200).json({ message: "News updated successfully" });
    } catch (error) {
      console.error("Error fetching news:", error.message);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  };
  
// Serve news to the frontend
export const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ publishedAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news from database:", error.message);
    res.status(500).json({ error: "Failed to retrieve news" });
  }
};
