const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { env } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ── Core routes ───────────────────────────────────────────────
const { healthRouter }    = require('./routes/health');
const { authRouter }      = require('./routes/auth');
const { userRouter }      = require('./routes/users');

// ── Feature routes ────────────────────────────────────────────
const { logoRouter }      = require('./features/logo-generator/logo.routes');
const { bannerRouter }    = require('./features/youtube-banner/banner.routes');
const { thumbnailRouter } = require('./features/thumbnail-maker/thumbnail.routes');
const { imageRouter }     = require('./features/image-editor/image.routes');
const { videoRouter }     = require('./features/video-editor/video.routes');
const { aiVideoRouter }   = require('./features/ai-videos/ai-video.routes');
const { audioRouter }     = require('./features/ai-audio/audio.routes');
const { musicRouter }     = require('./features/music-library/music.routes');
const { contentRouter }   = require('./features/ai-content/content.routes');
const { calendarRouter }  = require('./features/content-calendar/calendar.routes');
const { memeRouter }      = require('./features/meme-library/meme.routes');
// image proxy handlers (registered at app level so they remain public)
const { proxyImage, generateTemplateImage } = require('./features/meme-library/meme.controller');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// Allow local dev ports (4200 and 4300) during development
const devOrigins = ['http://localhost:4200', 'http://localhost:4300'];
app.use(cors({ origin: env.NODE_ENV === 'production' ? false : (origin, cb) => cb(null, devOrigins.includes(origin)), credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Simple request logger for debugging auth/CORS issues
app.use((req, res, next) => {
	try {
		console.log('REQ', req.method, req.path, 'auth=', !!req.headers.authorization, 'origin=', req.headers.origin);
	} catch (err) {
		/* ignore logging errors */
	}
	next();
});

app.get('/api', (_req, res) => res.json({ success: true, message: 'GenZ Studio API' }));

// ── Core ──────────────────────────────────────────────────────
app.use('/api/health',   healthRouter);
app.use('/api/auth',     authRouter);
app.use('/api/users',    userRouter);

// ── Features ──────────────────────────────────────────────────
app.use('/api/logos',      logoRouter);
app.use('/api/banners',    bannerRouter);
app.use('/api/thumbnails', thumbnailRouter);
app.use('/api/images',     imageRouter);
app.use('/api/videos',     videoRouter);
app.use('/api/ai-videos',  aiVideoRouter);
app.use('/api/audio',      audioRouter);
app.use('/api/music',      musicRouter);
app.use('/api/content',    contentRouter);
app.use('/api/calendar',   calendarRouter);
// Public proxy endpoints (ensure these remain public regardless of router auth)
app.get('/api/memes/proxy', proxyImage);
app.get('/api/memes/generated', generateTemplateImage);

app.use('/api/memes',      memeRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
