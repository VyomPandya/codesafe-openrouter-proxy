// Vercel Serverless Function: /api/openrouter.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OpenRouter API key not configured on server.' });
  }
  try {
    const { code, ...options } = req.body;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.origin || '',
      },
      body: JSON.stringify({
        model: options.model || 'openai/gpt-4',
        messages: [
          { role: 'system', content: 'You are an AI assistant that enhances code.' },
          { role: 'user', content: `Enhance this code: ${code}` }
        ],
        ...options
      })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
