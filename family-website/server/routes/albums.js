import express from 'express';
import { getDb } from '../models/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
    const db = getDb();
    const albums = db.prepare(`
        SELECT a.*, u.username, u.full_name,
               (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count
        FROM albums a
        JOIN users u ON a.created_by = u.id
        ORDER BY a.created_at DESC
    `).all();
    
    res.json(albums);
});

router.get('/:id', (req, res) => {
    const db = getDb();
    const album = db.prepare(`
        SELECT a.*, u.username, u.full_name
        FROM albums a
        JOIN users u ON a.created_by = u.id
        WHERE a.id = ?
    `).get(req.params.id);
    
    if (!album) {
        return res.status(404).json({ error: 'Album not found' });
    }
    
    res.json(album);
});

router.post('/', requireAuth, (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Album name is required' });
    }
    
    const db = getDb();
    const result = db.prepare(`
        INSERT INTO albums (name, description, created_by)
        VALUES (?, ?, ?)
    `).run(name, description || null, req.session.userId);
    
    res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/:id', requireAuth, (req, res) => {
    const { name, description } = req.body;
    const db = getDb();
    
    const album = db.prepare('SELECT created_by FROM albums WHERE id = ?').get(req.params.id);
    if (!album) {
        return res.status(404).json({ error: 'Album not found' });
    }
    
    if (album.created_by !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare('UPDATE albums SET name = ?, description = ? WHERE id = ?')
        .run(name, description, req.params.id);
    
    res.json({ success: true });
});

router.delete('/:id', requireAuth, (req, res) => {
    const db = getDb();
    const album = db.prepare('SELECT created_by FROM albums WHERE id = ?').get(req.params.id);
    
    if (!album) {
        return res.status(404).json({ error: 'Album not found' });
    }
    
    if (album.created_by !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare('DELETE FROM albums WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;

