import express from 'express';
import { getDb } from '../models/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/inbox', requireAuth, (req, res) => {
    const db = getDb();
    const messages = db.prepare(`
        SELECT m.*, u.username, u.full_name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.recipient_id = ?
        ORDER BY m.created_at DESC
    `).all(req.session.userId);
    
    res.json(messages);
});

router.get('/sent', requireAuth, (req, res) => {
    const db = getDb();
    const messages = db.prepare(`
        SELECT m.*, u.username, u.full_name as recipient_name
        FROM messages m
        JOIN users u ON m.recipient_id = u.id
        WHERE m.sender_id = ?
        ORDER BY m.created_at DESC
    `).all(req.session.userId);
    
    res.json(messages);
});

router.get('/:id', requireAuth, (req, res) => {
    const db = getDb();
    const message = db.prepare(`
        SELECT m.*, 
               sender.username as sender_username, sender.full_name as sender_name,
               recipient.username as recipient_username, recipient.full_name as recipient_name
        FROM messages m
        JOIN users sender ON m.sender_id = sender.id
        JOIN users recipient ON m.recipient_id = recipient.id
        WHERE m.id = ?
    `).get(req.params.id);
    
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check authorization
    if (message.sender_id !== req.session.userId && message.recipient_id !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Mark as read if recipient is viewing
    if (message.recipient_id === req.session.userId && !message.read_status) {
        db.prepare('UPDATE messages SET read_status = 1 WHERE id = ?').run(req.params.id);
        message.read_status = 1;
    }
    
    res.json(message);
});

router.post('/', requireAuth, (req, res) => {
    const { recipientId, subject, content } = req.body;
    
    if (!recipientId || !content) {
        return res.status(400).json({ error: 'Recipient and content are required' });
    }
    
    const db = getDb();
    const recipient = db.prepare('SELECT id FROM users WHERE id = ?').get(recipientId);
    if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
    }
    
    const result = db.prepare(`
        INSERT INTO messages (sender_id, recipient_id, subject, content)
        VALUES (?, ?, ?, ?)
    `).run(req.session.userId, recipientId, subject || null, content);
    
    res.json({ success: true, id: result.lastInsertRowid });
});

router.get('/unread/count', requireAuth, (req, res) => {
    const db = getDb();
    const count = db.prepare(`
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE recipient_id = ? AND read_status = 0
    `).get(req.session.userId).count;
    
    res.json({ count });
});

router.delete('/:id', requireAuth, (req, res) => {
    const db = getDb();
    const message = db.prepare('SELECT sender_id, recipient_id FROM messages WHERE id = ?').get(req.params.id);
    
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    // Only sender or recipient can delete
    if (message.sender_id !== req.session.userId && message.recipient_id !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;

