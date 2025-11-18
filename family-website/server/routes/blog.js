import express from 'express';
import { getDb } from '../models/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
    const db = getDb();
    const { category, featured } = req.query;
    
    let query = `
        SELECT b.*, u.username, u.full_name
        FROM blog_posts b
        JOIN users u ON b.author_id = u.id
        WHERE 1=1
    `;
    const params = [];
    
    if (category) {
        query += ' AND b.category = ?';
        params.push(category);
    }
    
    if (featured === 'true') {
        query += ' AND b.featured = 1';
    }
    
    query += ' ORDER BY b.published_date DESC';
    
    const posts = db.prepare(query).all(...params);
    res.json(posts);
});

router.get('/:id', (req, res) => {
    const db = getDb();
    const post = db.prepare(`
        SELECT b.*, u.username, u.full_name
        FROM blog_posts b
        JOIN users u ON b.author_id = u.id
        WHERE b.id = ?
    `).get(req.params.id);
    
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
});

router.post('/', requireAuth, (req, res) => {
    const { title, content, category, tags, featured } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const db = getDb();
    const result = db.prepare(`
        INSERT INTO blog_posts (author_id, title, content, category, tags, featured)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        req.session.userId,
        title,
        content,
        category || null,
        tags || null,
        featured ? 1 : 0
    );
    
    res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/:id', requireAuth, (req, res) => {
    const { title, content, category, tags, featured } = req.body;
    const db = getDb();
    
    const post = db.prepare('SELECT author_id FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.author_id !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare(`
        UPDATE blog_posts 
        SET title = ?, content = ?, category = ?, tags = ?, featured = ?
        WHERE id = ?
    `).run(title, content, category, tags, featured ? 1 : 0, req.params.id);
    
    res.json({ success: true });
});

router.delete('/:id', requireAuth, (req, res) => {
    const db = getDb();
    const post = db.prepare('SELECT author_id FROM blog_posts WHERE id = ?').get(req.params.id);
    
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.author_id !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;

