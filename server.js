const express = require('express');
const { OpenAI } = require('openai');
const app = express();

app.use(express.json());

const openai = new OpenAI({ apiKey: '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' });

app.post('/analyze', async (req, res) => {
    const { content, experience, specialization } = req.body;

    // Validation: Check for required fields
    if (!content || !experience || !specialization) {
        return res.status(400).json({ error: 'Missing required fields: content, experience, and specialization are required' });
    }

    const prompt = `Analyze this portfolio content for a ${experience} ${specialization} designer: "${content}". Provide feedback on navigation, hero section, and visuals.`;

    try {
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
        res.status(500).send('Something went wrong');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));