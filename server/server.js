import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { bootstrapDatabase, setDb } from './models/database.js';
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/photos.js';
import albumRoutes from './routes/albums.js';
import commentRoutes from './routes/comments.js';

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'ksvn-family-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = Number(process.env.PORT ?? 4000);

// Initialize database and start server
bootstrapDatabase().then(db => {
    setDb(db);
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
        console.log(`KSVN Family Photo Server listening on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
