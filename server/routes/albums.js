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

router.get('/', (req, res) => {
    const db = getDb();
    const albums = db.prepare(`
        SELECT a.*, u.username as created_by_name,
               COUNT(p.id) as photo_count
        FROM albums a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN photos p ON a.id = p.album_id
        GROUP BY a.id
        ORDER BY a.created_at DESC
    `).all();
    
    res.json(albums);
});

router.post('/', (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Album name is required' });
    }

    const db = getDb();
    const result = db.prepare(`
        INSERT INTO albums (name, description, created_by)
        VALUES (?, ?, ?)
    `).run(name, description || null, req.session.userId);

    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(album);
});

router.get('/:id', (req, res) => {
    const db = getDb();
    const album = db.prepare(`
        SELECT a.*, u.username as created_by_name
        FROM albums a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.id = ?
    `).get(req.params.id);

    if (!album) {
        return res.status(404).json({ error: 'Album not found' });
    }

    res.json(album);
});

router.put('/:id', (req, res) => {
    const { name, description } = req.body;
    const db = getDb();
    
    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id);
    if (!album) {
        return res.status(404).json({ error: 'Album not found' });
    }

    if (album.created_by !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized to edit this album' });
    }

    db.prepare(`
        UPDATE albums
        SET name = ?, description = ?
        WHERE id = ?
    `).run(name || album.name, description !== undefined ? description : album.description, req.params.id);

    const updated = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id);
    res.json(updated);
});

router.delete('/:id', (req, res) => {
    const db = getDb();
    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id);

    if (!album) {
        return res.status(404).json({ error: 'Album not found' });
    }

    if (album.created_by !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this album' });
    }

    db.prepare('DELETE FROM albums WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;

