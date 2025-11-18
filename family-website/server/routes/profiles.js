import express from 'express';
import { getDb } from '../models/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
    const db = getDb();
    const users = db.prepare(`
        SELECT id, username, email, full_name, bio, profile_photo, relationship, created_at
        FROM users
        ORDER BY full_name, username
    `).all();
    
    res.json(users);
});

router.get('/:id', (req, res) => {
    const db = getDb();
    const user = db.prepare(`
        SELECT id, username, email, full_name, bio, profile_photo, relationship, created_at
        FROM users
        WHERE id = ?
    `).get(req.params.id);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's activity counts
    const photoCount = db.prepare('SELECT COUNT(*) as count FROM photos WHERE uploaded_by = ?').get(user.id).count;
    const postCount = db.prepare('SELECT COUNT(*) as count FROM blog_posts WHERE author_id = ?').get(user.id).count;
    const eventCount = db.prepare('SELECT COUNT(*) as count FROM events WHERE creator_id = ?').get(user.id).count;
    
    user.stats = {
        photos: photoCount,
        posts: postCount,
        events: eventCount
    };
    
    res.json(user);
});

router.put('/:id', requireAuth, (req, res) => {
    const { fullName, bio, relationship, profilePhoto } = req.body;
    const db = getDb();
    
    // Users can only update their own profile
    if (parseInt(req.params.id) !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare(`
        UPDATE users 
        SET full_name = ?, bio = ?, relationship = ?, profile_photo = ?
        WHERE id = ?
    `).run(fullName, bio, relationship, profilePhoto, req.params.id);
    
    res.json({ success: true });
});

export default router;

