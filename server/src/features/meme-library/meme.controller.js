const { env } = require('../../config/env');
const { isDatabaseConfigured } = require('../../config/database');

// In-memory store for dev mode
const memMemes = new Map();
function getMemeStore(userId) {
  if (!memMemes.has(userId)) memMemes.set(userId, []);
  return memMemes.get(userId);
}

const CATEGORIES = ['reaction', 'comparison', 'decision', 'classic', 'conspiracy'];

async function listTemplates(req, res, next) {
  try {
    const { category, search, page = 1, limit = 48 } = req.query;

    let templates = [];
    try {
      const imgflipRes = await fetch('https://api.imgflip.com/get_memes');
      if (imgflipRes.ok) {
        const data = await imgflipRes.json();
        if (data.success) {
          const TRENDING_IDS = new Set(['181913649','87743020','112126428','217743513','93895088','188390779','247375501']);
          templates = data.data.memes.slice(0, 100).map(m => ({
            id: m.id,
            name: m.name,
            // rewrite remote URL to full backend proxy URL to avoid client-side CORS issues
            url: `${req.protocol}://${req.get('host')}/api/memes/proxy?u=${encodeURIComponent(m.url)}`,
            width: m.width, height: m.height, box_count: m.box_count,
            category: getCategoryForMeme(m.name),
            trending: TRENDING_IDS.has(m.id),
          }));
        }
      }
    } catch { /* fallback */ }

    if (!templates.length) {
      templates = await getMemeTemplates({ category, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit) });
    }

    if (search) templates = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    if (category && category !== 'all') templates = templates.filter(t => t.category === category);

    res.json({ success: true, templates, total: templates.length });
  } catch (err) { next(err); }
}

// Proxy remote image URLs to avoid CORS and mixed-content blocking in the client.
async function proxyImage(req, res, next) {
  try {
    const { u } = req.query;
    if (!u) return res.status(400).send('Missing url');
    const url = decodeURIComponent(u);
    console.log('proxyImage called for', url, 'auth:', req.headers.authorization ? 'present' : 'missing');

    // Allow public remote hosts, but block localhost/private IPs to reduce SSRF risk.
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return res.status(400).send('Invalid protocol');
      // Allow remote images from any public host, but block localhost/private IPs to reduce SSRF risk.
      const hostname = parsed.hostname.toLowerCase();
      if (['localhost', '127.0.0.1', '::1'].includes(hostname)) {
        return res.status(403).send('Host not allowed');
      }
      const forbidden = /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|fc00:|fe80:)/i;
      if (forbidden.test(hostname)) {
        return res.status(403).send('Host not allowed');
      }
    } catch (e) { return res.status(400).send('Invalid url'); }

    const upstream = await fetch(url, { method: 'GET' });
    if (upstream.ok) {
      // propagate content-type and cache headers
      const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('content-type', contentType);
      const cacheControl = upstream.headers.get('cache-control');
      if (cacheControl) res.setHeader('cache-control', cacheControl);

      const body = await upstream.arrayBuffer();
      return res.status(200).send(Buffer.from(body));
    }

    // If upstream failed, attempt to generate a replacement image if a Gemini key is provided.
    // Otherwise return a simple placeholder SVG so the client always has an image to display.
    const headerKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
    const useKey = headerKey || env.GEMINI_API_KEY;
    if (useKey) {
      try {
        const prompt = `Generate a clean meme template image suitable for captioning. Keep subject neutral; no text. Source: ${url}`;
        const gen = await generateImageWithGemini(prompt, useKey);
        if (gen && gen.length) {
          res.setHeader('content-type', 'image/png');
          return res.status(200).send(gen);
        }
      } catch (e) {
        // generation failed; fall through to placeholder
      }
    }

    // Return a lightweight SVG placeholder (200) so client displays an image instead of error
    const name = (new URL(url)).pathname.split('/').pop() || 'meme';
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>\n  <rect width='100%' height='100%' fill='#f3f4f6'/>\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='28'>Image Unavailable</text>\n  <text x='50%' y='60%' dominant-baseline='middle' text-anchor='middle' fill='#cbd5e1' font-family='Arial, Helvetica, sans-serif' font-size='16'>${escapeXml(name)}</text>\n</svg>`;
    res.setHeader('content-type', 'image/svg+xml');
    res.setHeader('cache-control', 'no-cache');
    return res.status(200).send(svg);
  } catch (err) { next(err); }
}

// Generate an image using Google Gemini (Generative Images) API
async function generateImageWithGemini(prompt, keyOverride) {
  // Basic implementation: POST to generative images endpoint using the GEMINI_API_KEY
  const key = keyOverride || env.GEMINI_API_KEY;
  if (!key) throw new Error('No Gemini key');

  // Try common endpoint shapes and handle multiple response formats
  const endpoints = [
    'https://generativemedia.googleapis.com/v1/images:generate',
    'https://generative.googleapis.com/v1/images:generate',
    'https://image-generative.googleapis.com/v1/images:generate',
  ];

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024', format: 'png' }),
      });
      if (!resp.ok) {
        continue;
      }
      const data = await resp.json().catch(() => null);
      // Possible response shapes: { image: '<base64>' } or { data: [{ b64_json: '...' }] }
      if (!data) continue;
      if (data.image) {
        return Buffer.from(data.image, 'base64');
      }
      if (data.data && Array.isArray(data.data) && data.data[0].b64_json) {
        return Buffer.from(data.data[0].b64_json, 'base64');
      }
      if (data.output && Array.isArray(data.output) && data.output[0].image) {
        return Buffer.from(data.output[0].image, 'base64');
      }
    } catch (e) {
      // try next endpoint
      continue;
    }
  }
  throw new Error('Gemini generation failed');
}

// Endpoint to generate a template image on demand via Gemini
async function generateTemplateImage(req, res, next) {
  try {
    const name = req.query.name || 'Meme template';
    const headerKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
    const useKey = headerKey || env.GEMINI_API_KEY;
    if (!useKey) {
      // No Gemini key configured — return a simple SVG placeholder so the client gets an image.
      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>\n  <rect width='100%' height='100%' fill='#eef2ff'/>\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#4f46e5' font-family='Arial, Helvetica, sans-serif' font-size='28'>Generated Meme</text>\n  <text x='50%' y='60%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='16'>${escapeXml(name)}</text>\n</svg>`;
      res.setHeader('content-type', 'image/svg+xml');
      return res.status(200).send(svg);
    }

    const prompt = `Create a blank meme template image inspired by: ${name}. High contrast, neutral background, no text, square aspect ratio.`;
    const buf = await generateImageWithGemini(prompt, useKey);
    res.setHeader('content-type', 'image/png');
    return res.status(200).send(buf);
  } catch (err) { next(err); }
}

// Simple XML escaper for safe insertion into SVG
function escapeXml(unsafe) {
  return String(unsafe).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c];
  });
}

async function listMyMemes(req, res, next) {
  try {
    let memes;
    if (isDatabaseConfigured()) {
      const { getMemesByUser } = require('./meme.queries');
      memes = await getMemesByUser(req.user.id);
    } else {
      memes = getMemeStore(req.user.id);
    }
    res.json({ success: true, memes });
  } catch (err) { next(err); }
}

async function remixMeme(req, res, next) {
  try {
    const { templateId, topText, bottomText, boxes } = req.body;
    if (!templateId) return res.status(400).json({ success: false, message: 'templateId is required' });

    let outputUrl = null;

    if (env.IMGFLIP_USERNAME && env.IMGFLIP_PASSWORD) {
      const params = new URLSearchParams({
        template_id: templateId,
        username: env.IMGFLIP_USERNAME,
        password: env.IMGFLIP_PASSWORD,
      });
      if (boxes?.length) {
        boxes.forEach((box, i) => {
          params.append(`boxes[${i}][text]`, box.text || '');
          if (box.color) params.append(`boxes[${i}][color]`, box.color);
        });
      } else {
        params.append('text0', topText || '');
        params.append('text1', bottomText || '');
      }
      const imgRes = await fetch('https://api.imgflip.com/caption_image', { method: 'POST', body: params });
      const imgData = await imgRes.json();
      if (imgData.success) outputUrl = imgData.data.url;
    }

    if (isDatabaseConfigured()) {
      const { createMeme, incrementTemplateUses } = require('./meme.queries');
      await incrementTemplateUses(templateId);
      const meme = await createMeme(req.user.id, { templateId, topText, bottomText, outputUrl });
      res.status(201).json({ success: true, meme, outputUrl });
    } else {
      const meme = { id: `mem-${Date.now()}`, user_id: req.user.id, template_id: templateId, top_text: topText, bottom_text: bottomText, output_url: outputUrl, created_at: new Date().toISOString() };
      getMemeStore(req.user.id).unshift(meme);
      res.status(201).json({ success: true, meme, outputUrl });
    }
  } catch (err) { next(err); }
}

async function generateAiCaption(req, res, next) {
  try {
    const { templateName, context, tone = 'funny' } = req.body;
    if (!templateName) return res.status(400).json({ success: false, message: 'templateName is required' });

    let captions = [];

    if (env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Generate 3 ${tone} meme captions for the "${templateName}" meme template.${context ? ` Context: ${context}` : ''} Return JSON: {"captions":[{"top":"...","bottom":"..."}]}`,
          }],
          response_format: { type: 'json_object' },
          max_tokens: 300,
        }),
      });
      const data = await response.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      captions = parsed.captions || [];
    } else {
      captions = getDemoCaptions(tone);
    }

    res.json({ success: true, captions });
  } catch (err) { next(err); }
}

// NEW: Generate AI meme background image using Stability AI
async function generateAiBackground(req, res, next) {
  try {
    const { prompt, style = 'meme' } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'prompt is required' });

    if (!env.STABILITY_API_KEY) {
      return res.status(400).json({ success: false, message: 'Stability AI key not configured' });
    }

    const stylePrompts = {
      meme: 'funny meme style, bold colors, internet humor aesthetic, high contrast',
      viral: 'viral social media image, eye-catching, bold, trending aesthetic',
      cartoon: 'cartoon style, vibrant colors, comic book aesthetic, clean lines',
      realistic: 'photorealistic, high quality, cinematic lighting',
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.meme}, no text, no watermark`;

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STABILITY_API_KEY}`,
        'Accept': 'application/json',
      },
      body: (() => {
        const form = new FormData();
        form.append('prompt', enhancedPrompt);
        form.append('output_format', 'webp');
        form.append('aspect_ratio', '1:1');
        return form;
      })(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(400).json({ success: false, message: err.message || 'Image generation failed' });
    }

    const data = await response.json();
    const imageBase64 = data.image;
    const imageUrl = `data:image/webp;base64,${imageBase64}`;

    res.json({ success: true, imageUrl });
  } catch (err) { next(err); }
}

async function removeMeme(req, res, next) {
  try {
    if (isDatabaseConfigured()) {
      const { deleteMeme } = require('./meme.queries');
      await deleteMeme(req.user.id, req.params.id);
    } else {
      const store = getMemeStore(req.user.id);
      const idx = store.findIndex(i => i.id === req.params.id);
      if (idx !== -1) store.splice(idx, 1);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
}

function getCategoryForMeme(name) {
  const n = name.toLowerCase();
  if (n.includes('drake') || n.includes('distracted') || n.includes('woman yelling') || n.includes('waiting')) return 'reaction';
  if (n.includes('brain') || n.includes('buff') || n.includes('cheems') || n.includes('balloon')) return 'comparison';
  if (n.includes('button') || n.includes('exit') || n.includes('uno') || n.includes('draw')) return 'decision';
  if (n.includes('alien') || n.includes('conspiracy')) return 'conspiracy';
  return 'classic';
}

function getDemoCaptions(tone) {
  const map = {
    funny: [
      { top: 'Me at 9pm: I should sleep', bottom: 'Me at 3am: just one more video' },
      { top: 'My brain during an exam', bottom: 'My brain at 2am remembering embarrassing moments' },
      { top: 'When the WiFi drops for 0.1 seconds', bottom: 'My entire personality' },
    ],
    savage: [
      { top: 'My patience', bottom: 'People who type "k"' },
      { top: 'Me pretending to listen', bottom: 'Me actually listening' },
      { top: 'My standards', bottom: 'My choices' },
    ],
    relatable: [
      { top: 'Adulting they said', bottom: 'It will be fun they said' },
      { top: 'My to-do list on Monday', bottom: 'My to-do list on Friday' },
      { top: 'Sleep schedule before 2020', bottom: 'Sleep schedule now' },
    ],
    wholesome: [
      { top: 'When your friend checks in on you', bottom: 'Feeling like the luckiest person alive' },
      { top: 'Me supporting my friends', bottom: 'Even when I have no idea what they do' },
      { top: 'Small wins', bottom: 'Still wins' },
    ],
    dark: [
      { top: 'My sleep schedule', bottom: 'My will to fix it' },
      { top: 'Deadlines', bottom: 'My motivation' },
      { top: 'Me: I\'ll start Monday', bottom: 'Also me every Monday' },
    ],
  };
  return map[tone] || map.funny;
}

async function searchGiphyProxy(req, res, next) {
  try {
    const { q, limit = 20, offset = 0, type = 'gifs' } = req.query;
    const apiKey = env.GIPHY_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: 'Giphy API key is not configured' });
    }

    const endpoint = type === 'stickers' 
      ? 'https://api.giphy.com/v1/stickers/search' 
      : 'https://api.giphy.com/v1/gifs/search';

    const params = new URLSearchParams({
      api_key: apiKey,
      q: q || '',
      limit: String(limit),
      offset: String(offset),
      rating: 'g'
    });

    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ success: false, message: `Giphy API error: ${errText}` });
    }

    const data = await response.json();
    const memes = (data.data || []).map(item => ({
      title: item.title || (type === 'stickers' ? 'Sticker' : 'GIF'),
      url: item.images?.fixed_height?.url || item.images?.original?.url || '',
      postLink: item.url,
      subreddit: type === 'stickers' ? 'stickers' : 'gifs',
      ups: 100,
      author: item.username || 'Giphy'
    }));

    res.json({ success: true, memes });
  } catch (err) { next(err); }
}

async function trendingGiphyProxy(req, res, next) {
  try {
    const { limit = 20, offset = 0, type = 'gifs' } = req.query;
    const apiKey = env.GIPHY_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: 'Giphy API key is not configured' });
    }

    const endpoint = type === 'stickers' 
      ? 'https://api.giphy.com/v1/stickers/trending' 
      : 'https://api.giphy.com/v1/gifs/trending';

    const params = new URLSearchParams({
      api_key: apiKey,
      limit: String(limit),
      offset: String(offset),
      rating: 'g'
    });

    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ success: false, message: `Giphy API error: ${errText}` });
    }

    const data = await response.json();
    const memes = (data.data || []).map(item => ({
      title: item.title || (type === 'stickers' ? 'Sticker' : 'GIF'),
      url: item.images?.fixed_height?.url || item.images?.original?.url || '',
      postLink: item.url,
      subreddit: type === 'stickers' ? 'stickers' : 'gifs',
      ups: 100,
      author: item.username || 'Giphy'
    }));

    res.json({ success: true, memes });
  } catch (err) { next(err); }
}

module.exports = { 
  listTemplates, 
  listMyMemes, 
  remixMeme, 
  generateAiCaption, 
  generateAiBackground, 
  removeMeme, 
  proxyImage, 
  generateTemplateImage,
  searchGiphyProxy,
  trendingGiphyProxy
};
