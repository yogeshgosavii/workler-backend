import puppeteer from 'puppeteer';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: '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', // Replace with your OpenAI API key
});

// Scrape Job Details
export const scrapeJobDetails = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Job URL is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set user-agent and additional headers to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Navigate to the job URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract job details
    const jobDetails = await page.evaluate(() => {
      const title = document.querySelector('h1')?.innerText || 'Job title not found';
      const company = document.querySelector('.icl-u-lg-mr--sm')?.innerText || 'Company name not found';
      const description =
        document.querySelector('#jobDescriptionText')?.innerText ||
        document.querySelector('.job-description')?.innerText ||
        'Job description not found';

      return { title, company, description };
    });

    await browser.close();

    // If no job description is found, use AI to generate one
    if (jobDetails.description === 'Job description not found') {
      jobDetails.description = await generateJobDescription(jobDetails.title, jobDetails.company);
    }

    res.json(jobDetails);
  } catch (error) {
    console.error('Scraping Error:', error.message);
    res.status(500).json({
      error: 'Failed to scrape the webpage.',
      details: error.message,
    });
  }
};

// Function to generate job description using OpenAI
const generateJobDescription = async (title, company) => {
  try {
    const response = await openai.completions.create({
      model: 'text-davinci-003',
      prompt: `Generate a detailed job description for the following job title at the company: ${title} at ${company}.`,
      max_tokens: 200,
    });

    return response.choices[0].text.trim();
  } catch (error) {
    console.error('AI Generation Error:', error.message);
    return 'Job description not available.';
  }
};
