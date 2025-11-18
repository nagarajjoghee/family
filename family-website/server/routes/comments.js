import express from 'express';
import { getDb } from '../models/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
    const { contentType, contentId } = req.query;
    
    if (!contentType || !contentId) {
        return res.status(400).json({ error: 'Content type and content ID are required' });
    }
    
    const db = getDb();
    const comments = db.prepare(`
        SELECT c.*, u.username, u.full_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.content_type = ? AND c.content_id = ?
        ORDER BY c.created_at ASC
    `).all(contentType, contentId);
    
    res.json(comments);
});

router.post('/', requireAuth, (req, res) => {
    const { contentType, contentId, content } = req.body;
    
    if (!contentType || !contentId || !content) {
        return res.status(400).json({ error: 'Content type, content ID, and content are required' });
    }
    
    const db = getDb();
    const result = db.prepare(`
        INSERT INTO comments (content_type, content_id, user_id, content)
        VALUES (?, ?, ?, ?)
    `).run(contentType, contentId, req.session.userId, content);
    
    res.json({ success: true, id: result.lastInsertRowid });
});

router.delete('/:id', requireAuth, (req, res) => {
    const db = getDb();
    const comment = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(req.params.id);
    
    if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (comment.user_id !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;

