import express from 'express';
import { getDb } from '../models/database.js';

const router = express.Router();

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

router.use(requireAuth);

router.get('/:photoId', (req, res) => {
    const db = getDb();
    const comments = db.prepare(`
        SELECT c.*, u.username, u.full_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.photo_id = ?
        ORDER BY c.created_at ASC
    `).all(req.params.photoId);
    
    res.json(comments);
});

router.post('/', (req, res) => {
    const { photoId, content } = req.body;
    
    if (!photoId || !content) {
        return res.status(400).json({ error: 'Photo ID and content are required' });
    }

    const db = getDb();
    
    // Verify photo exists
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId);
    if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
    }

    const result = db.prepare(`
        INSERT INTO comments (photo_id, user_id, content)
        VALUES (?, ?, ?)
    `).run(photoId, req.session.userId, content);

    const comment = db.prepare(`
        SELECT c.*, u.username, u.full_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json(comment);
});

router.delete('/:id', (req, res) => {
    const db = getDb();
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);

    if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    // Only allow deletion by comment author
    if (comment.user_id !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;

