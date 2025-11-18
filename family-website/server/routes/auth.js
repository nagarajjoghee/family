import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from '../models/database.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password, fullName, bio, relationship } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const db = getDb();
    
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = db.prepare(`
            INSERT INTO users (username, email, password_hash, full_name, bio, relationship)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(username, email, passwordHash, fullName || null, bio || null, relationship || null);

        res.json({
            success: true,
            user: {
                id: result.lastInsertRowid,
                username,
                email,
                fullName: fullName || null
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            bio: user.bio,
            profilePhoto: user.profile_photo
        }
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
    });
});

router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, username, email, full_name, bio, profile_photo, relationship FROM users WHERE id = ?').get(req.session.userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        bio: user.bio,
        profilePhoto: user.profile_photo,
        relationship: user.relationship
    });
});

export default router;

