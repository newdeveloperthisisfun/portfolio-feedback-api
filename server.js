const express = require('express');
const puppeteer = require('puppeteer');
const { OpenAI } = require('openai');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // Allows requests from any origin (e.g., Netlify)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/analyze', async (req, res) => {
    const { url, password, experience, specialization } = req.body;

    if (!url || !experience || !specialization) {
        return res.status(400).json({ error: 'Missing required fields: url, experience, and specialization are required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        if (password) {
            await page.goto(url);
            await page.type('#password', password);
            await page.click('#submit');
            await page.waitForNavigation();
        } else {
            await page.goto(url);
        }

        const content = await page.evaluate(() => document.body.innerText);
        await browser.close();

        const prompt = `Analyze this portfolio content for a ${experience} ${specialization} designer: "${content}". Provide feedback on navigation, hero section, and visuals.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 300
        });

        const feedback = response.choices[0].message.content;
        res.json({ feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));