import express from 'express';
import { getDb } from '../models/database.js';

const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

router.use(requireAuth);

router.get('/', (req, res) => {
    const { albumId } = req.query;
    const db = getDb();
    
    let query = `
        SELECT p.*, u.username as uploaded_by_name, a.name as album_name
        FROM photos p
        LEFT JOIN users u ON p.uploaded_by = u.id
        LEFT JOIN albums a ON p.album_id = a.id
    `;
    
    const params = [];
    if (albumId) {
        query += ' WHERE p.album_id = ?';
        params.push(albumId);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const photos = db.prepare(query).all(...params);
    res.json(photos);
});

router.post('/', (req, res) => {
    const { title, description, albumId, fileName, fileSize, mimeType } = req.body;
    
    if (!fileName) {
        return res.status(400).json({ error: 'File name is required' });
    }

    const db = getDb();
    const result = db.prepare(`
        INSERT INTO photos (title, description, album_id, uploaded_by, file_name, file_size, mime_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        title || null,
        description || null,
        albumId || null,
        req.session.userId,
        fileName,
        fileSize || null,
        mimeType || null
    );

    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(photo);
});

router.get('/:id', (req, res) => {
    const db = getDb();
    const photo = db.prepare(`
        SELECT p.*, u.username as uploaded_by_name, a.name as album_name
        FROM photos p
        LEFT JOIN users u ON p.uploaded_by = u.id
        LEFT JOIN albums a ON p.album_id = a.id
        WHERE p.id = ?
    `).get(req.params.id);

    if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
    }

    res.json(photo);
});

router.delete('/:id', (req, res) => {
    const db = getDb();
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);

    if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
    }

    // Only allow deletion by uploader
    if (photo.uploaded_by !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this photo' });
    }

    db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;

