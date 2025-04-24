const fetch = require('node-fetch');
const { json } = require('micro');

module.exports = async (req, res) => {
  // CORS headers for all responses
  const allowedOrigins = [
    'https://vyompandya.github.io',
    'https://code-safe-vercel.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    res.status(500).json({ error: 'OpenRouter API key not configured on server.' });
    return;
  }

  try {
    const body = await json(req);
    const { code, ...options } = body;
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