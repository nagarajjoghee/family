import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { bootstrapDatabase, setDb } from './models/database.js';
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/photos.js';
import albumRoutes from './routes/albums.js';
import blogRoutes from './routes/blog.js';
import calendarRoutes from './routes/calendar.js';
import profileRoutes from './routes/profiles.js';
import messageRoutes from './routes/messages.js';
import commentRoutes from './routes/comments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration - allow all origins for public hosting
// For production, you may want to restrict this to your domain
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGIN || '*',
        credentials: true
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'family-website-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Use PORT from environment variable (set by hosting service) or default to 3000
const PORT = Number(process.env.PORT || 3000);

// Initialize database and start server
bootstrapDatabase().then(db => {
    setDb(db);
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
        console.log(`Family Website Server listening on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});

