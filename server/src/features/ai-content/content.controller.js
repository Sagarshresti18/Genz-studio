const { env } = require('../../config/env');
const { isDatabaseConfigured } = require('../../config/database');

// In-memory store for dev mode
const memStore = new Map();

function getStore(userId) {
  if (!memStore.has(userId)) memStore.set(userId, []);
  return memStore.get(userId);
}

const CONTENT_TYPES = {
  script:      { label: 'YouTube Script',   system: 'You are a viral YouTube scriptwriter. Write engaging hook-driven scripts with timestamps, B-roll notes, and CTAs. Use pattern interrupts every 30 seconds.' },
  hook:        { label: 'Video Hook',        system: 'You are a viral content strategist. Write 5 powerful video hooks (first 3-7 seconds) that stop the scroll. Each hook should create curiosity, shock, or FOMO.' },
  caption:     { label: 'Social Caption',    system: 'You are a social media expert. Write platform-optimized captions with emojis, hashtags, and a strong CTA. Provide versions for Instagram, TikTok, and Twitter/X.' },
  thread:      { label: 'Twitter Thread',    system: 'You are a viral Twitter/X thread writer. Write a numbered thread with a killer opener, value-packed body tweets, and a strong closer with CTA. Max 280 chars per tweet.' },
  blog:        { label: 'Blog Post',         system: 'You are an SEO content writer. Write a well-structured blog post with H2/H3 headings, bullet points, and keyword-rich content that ranks on Google.' },
  email:       { label: 'Newsletter',        system: 'You are an email marketing expert. Write a high-converting newsletter with a compelling subject line, preview text, engaging body, and clear CTA.' },
  idea:        { label: 'Content Ideas',     system: 'You are a creative content strategist. Generate 10 viral content ideas with titles, hooks, and brief outlines. Focus on trending formats.' },
  description: { label: 'YouTube Description', system: 'You are a YouTube SEO expert. Write a keyword-optimized video description with timestamps, links section, and relevant hashtags.' },
};

const TONES = ['Casual & Fun', 'Professional', 'Hype & Energetic', 'Educational', 'Controversial', 'Storytelling', 'Minimalist'];

const TRENDING_TOPICS = [
  { topic: 'AI tools replacing jobs in 2025', niche: 'Tech', trend: '🔥 Viral' },
  { topic: 'How I made $10k with one video', niche: 'Finance', trend: '📈 Trending' },
  { topic: 'Day in my life as a creator', niche: 'Lifestyle', trend: '💫 Popular' },
  { topic: 'Honest review: [Product]', niche: 'Reviews', trend: '⚡ Hot' },
  { topic: 'Things I wish I knew before starting YouTube', niche: 'Creator', trend: '🎯 Evergreen' },
  { topic: 'I tried [viral trend] for 30 days', niche: 'Challenge', trend: '🚀 Viral' },
  { topic: 'The truth about [controversial topic]', niche: 'Opinion', trend: '💥 Controversial' },
  { topic: 'How to grow from 0 to 10k subscribers', niche: 'Growth', trend: '📊 Trending' },
];

async function getMetadata(req, res) {
  res.json({
    success: true,
    contentTypes: Object.entries(CONTENT_TYPES).map(([key, val]) => ({ key, label: val.label })),
    tones: TONES,
    trendingTopics: TRENDING_TOPICS,
  });
}

async function listContent(req, res, next) {
  try {
    const { search, type } = req.query;
    let items;

    if (isDatabaseConfigured()) {
      const { getContentByUser, searchContent } = require('./content.queries');
      items = search ? await searchContent(req.user.id, search, type) : await getContentByUser(req.user.id, type);
    } else {
      items = getStore(req.user.id).filter(i => (!type || i.type === type) && (!search || i.prompt.includes(search) || i.output_text?.includes(search)));
    }

    res.json({ success: true, content: items });
  } catch (err) { next(err); }
}

async function generateContent(req, res, next) {
  try {
    const { prompt, type = 'script', tone = 'Casual & Fun', platform, keywords } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ success: false, message: 'Prompt is required' });

    const typeConfig = CONTENT_TYPES[type] || CONTENT_TYPES.script;
    const enhancedPrompt = [prompt, tone && `Tone: ${tone}`, platform && `Platform: ${platform}`, keywords && `Keywords: ${keywords}`].filter(Boolean).join('\n');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let outputText = '';

    if (env.GEMINI_API_KEY) {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      
      try {
        const responseStream = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: enhancedPrompt,
          config: {
            systemInstruction: typeConfig.system,
          }
        });

        for await (const chunk of responseStream) {
          const token = chunk.text || '';
          if (token) {
            outputText += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
        }
      } catch (geminiErr) {
        console.error('Gemini streaming error:', geminiErr);
        res.write(`data: ${JSON.stringify({ error: geminiErr.message || 'Gemini error' })}\n\n`);
        return res.end();
      }
    } else if (env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini', stream: true,
          messages: [{ role: 'system', content: typeConfig.system }, { role: 'user', content: enhancedPrompt }],
          max_tokens: 1500, temperature: 0.85,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        res.write(`data: ${JSON.stringify({ error: err.error?.message || 'OpenAI error' })}\n\n`);
        return res.end();
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const token = JSON.parse(data).choices?.[0]?.delta?.content || '';
            if (token) { outputText += token; res.write(`data: ${JSON.stringify({ token })}\n\n`); }
          } catch { /* skip */ }
        }
      }
    } else {
      // Demo streaming
      for (const chunk of getDemoContent(type, tone, prompt)) {
        outputText += chunk;
        res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
        await new Promise(r => setTimeout(r, 15));
      }
    }

    // Persist
    let saved;
    if (isDatabaseConfigured()) {
      const { createContent } = require('./content.queries');
      saved = await createContent(req.user.id, { prompt: enhancedPrompt, type, tone, outputText });
    } else {
      saved = { id: `mem-${Date.now()}`, user_id: req.user.id, prompt: enhancedPrompt, type, tone, output_text: outputText, created_at: new Date().toISOString() };
      getStore(req.user.id).unshift(saved);
    }

    res.write(`data: ${JSON.stringify({ done: true, id: saved.id })}\n\n`);
    res.end();
  } catch (err) { next(err); }
}

async function removeContent(req, res, next) {
  try {
    if (isDatabaseConfigured()) {
      const { deleteContent } = require('./content.queries');
      await deleteContent(req.user.id, req.params.id);
    } else {
      const store = getStore(req.user.id);
      const idx = store.findIndex(i => i.id === req.params.id);
      if (idx !== -1) store.splice(idx, 1);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
}

function getDemoContent(type, tone, prompt) {
  const demos = {
    hook: `**5 Viral Hooks for Your Video**\n\n**Hook 1 — Curiosity Gap:**\n"Nobody talks about this, but it's the reason 99% of creators fail in their first year..."\n\n**Hook 2 — Bold Claim:**\n"I grew from 0 to 50,000 subscribers in 6 months without posting every day. Here's exactly how."\n\n**Hook 3 — Pattern Interrupt:**\n"Stop. Before you film another video, watch the first 10 seconds of this."\n\n**Hook 4 — Relatability:**\n"If you've ever stared at a blank screen for 3 hours trying to come up with a video idea... this is for you."\n\n**Hook 5 — Controversy:**\n"The YouTube algorithm doesn't care about your content quality. It cares about THIS."`,
    script: `**YouTube Script: ${prompt}**\n\n**[HOOK — 0:00-0:07]**\nHere's something nobody in this space wants to admit...\n\n**[INTRO — 0:07-0:45]**\nWhat's up everyone, welcome back. Today we're diving deep into ${prompt}. I've spent the last 3 months testing this, and the results genuinely shocked me.\n\nBy the end of this video, you'll know exactly what to do — and more importantly, what NOT to do.\n\n**[MAIN CONTENT — 0:45-8:00]**\n\n**Point 1: The Foundation**\nMost people skip this step entirely, and it's why they struggle...\n\n**Point 2: The Strategy**\nOnce you have the foundation, here's the exact framework I use...\n\n**Point 3: The Secret Weapon**\nThis is the part nobody talks about. And honestly, it changed everything for me.\n\n**[CTA — 8:00-8:30]**\nIf this helped you, smash that like button. Subscribe if you're new, and I'll see you in the next one. ✌️`,
    caption: `**Platform-Optimized Captions**\n\n**Instagram:**\nThe game changed when I stopped doing this one thing 👇\n\n${prompt}\n\nSave this post — you'll thank yourself later 🔖\n\n#ContentCreator #CreatorTips #YouTubeGrowth #SocialMediaMarketing #DigitalCreator\n\n---\n\n**TikTok:**\n${prompt} 🤯 #fyp #contentcreator #growthhack #viral\n\n---\n\n**Twitter/X:**\nThread: ${prompt} 🧵\n\nHere's everything I learned (so you don't have to make the same mistakes) 👇`,
    idea: `**10 Viral Content Ideas**\n\n1. **"I Tested Every AI Tool So You Don't Have To"** — Comparison, high search volume\n2. **"The ${prompt} Tier List (Brutally Honest)"** — Controversial, high engagement\n3. **"How I'd Start ${prompt} From Scratch in 2025"** — Evergreen tutorial\n4. **"${prompt}: Expectation vs Reality"** — Relatable, shareable\n5. **"I Spent $1,000 on ${prompt} — Was It Worth It?"** — High curiosity\n6. **"Reacting to the Worst ${prompt} Advice on the Internet"** — Reaction format\n7. **"${prompt} in 60 Seconds"** — Short-form, repurposable\n8. **"The Dark Side of ${prompt} Nobody Talks About"** — Controversy\n9. **"${prompt} Beginner to Pro: 30-Day Challenge"** — Series format\n10. **"I Asked 100 People About ${prompt} — Here's What They Said"** — Data-driven`,
  };
  return (demos[type] || demos.script).match(/.{1,4}/g) || [];
}

module.exports = { listContent, generateContent, removeContent, getMetadata };
