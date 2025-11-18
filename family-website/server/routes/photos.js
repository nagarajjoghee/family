import express from 'express';
import { getDb } from '../models/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
    const db = getDb();
    const { albumId } = req.query;
    
    let photos;
    if (albumId) {
        photos = db.prepare(`
            SELECT p.*, u.username, u.full_name
            FROM photos p
            JOIN users u ON p.uploaded_by = u.id
            WHERE p.album_id = ?
            ORDER BY p.created_at DESC
        `).all(albumId);
    } else {
        photos = db.prepare(`
            SELECT p.*, u.username, u.full_name
            FROM photos p
            JOIN users u ON p.uploaded_by = u.id
            ORDER BY p.created_at DESC
        `).all();
    }
    
    res.json(photos);
});

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    res.json({ message: 'Photos route is working', timestamp: new Date().toISOString() });
});

// IMPORTANT: This route must come before /:id to avoid route conflicts
router.get('/:id/image', (req, res) => {
    try {
        const db = getDb();
        const photoId = req.params.id;
        console.log(`[IMAGE REQUEST] Photo ID: ${photoId}`);
        
        const photo = db.prepare('SELECT file_data, mime_type, file_size FROM photos WHERE id = ?').get(photoId);
        
        if (!photo) {
            console.log(`[IMAGE ERROR] Photo ${photoId} not found in database`);
            return res.status(404).json({ error: 'Photo not found' });
        }
        
        if (!photo.file_data) {
            console.log(`[IMAGE ERROR] Photo ${photoId} has no file_data`);
            return res.status(404).json({ error: 'Photo data not found' });
        }
        
        // better-sqlite3 returns BLOB as Buffer when retrieved
        let imageData = photo.file_data;
        
        // Ensure it's a Buffer
        if (!Buffer.isBuffer(imageData)) {
            if (imageData instanceof Uint8Array) {
                imageData = Buffer.from(imageData);
            } else {
                imageData = Buffer.from(imageData);
            }
        }
        
        if (!imageData || imageData.length === 0) {
            console.error(`[IMAGE ERROR] Photo ${photoId} has empty image data`);
            return res.status(500).json({ error: 'Empty image data' });
        }
        
        console.log(`[IMAGE SUCCESS] Serving photo ${photoId}: type=${photo.mime_type}, size=${imageData.length} bytes`);
        
        // Set response headers
        res.set({
            'Content-Type': photo.mime_type || 'image/jpeg',
            'Content-Length': imageData.length.toString(),
            'Cache-Control': 'public, max-age=31536000',
            'Accept-Ranges': 'bytes'
        });
        
        // Send the buffer - Express handles Buffer objects correctly
        res.send(imageData);
    } catch (error) {
        console.error('[IMAGE ERROR] Error serving image:', error);
        res.status(500).json({ error: 'Failed to serve image: ' + error.message });
    }
});

router.get('/:id', (req, res) => {
    const db = getDb();
    const photo = db.prepare(`
        SELECT p.*, u.username, u.full_name
        FROM photos p
        JOIN users u ON p.uploaded_by = u.id
        WHERE p.id = ?
    `).get(req.params.id);
    
    if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.json(photo);
});

router.post('/', requireAuth, express.raw({ type: 'image/*', limit: '10mb' }), (req, res) => {
    try {
        const photoDataHeader = req.headers['x-photo-data'];
        const { title, description, albumId, location, tags } = photoDataHeader 
            ? JSON.parse(photoDataHeader) 
            : {};
        const db = getDb();
        
        // Ensure fileData is a Buffer - express.raw() should give us a Buffer
        let fileData;
        if (Buffer.isBuffer(req.body)) {
            fileData = req.body;
        } else if (req.body instanceof Uint8Array) {
            fileData = Buffer.from(req.body);
        } else {
            // Convert to buffer
            fileData = Buffer.from(req.body);
        }
        
        console.log(`Uploading photo: size=${fileData.length} bytes, type=${req.headers['content-type']}`);
        
        const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const mimeType = req.headers['content-type'] || 'image/jpeg';
        
        const result = db.prepare(`
            INSERT INTO photos (title, description, album_id, uploaded_by, file_name, file_data, file_size, mime_type, location, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            title || null,
            description || null,
            albumId ? parseInt(albumId) : null,
            req.session.userId,
            fileName,
            fileData,  // better-sqlite3 handles Buffer for BLOB
            fileData.length,
            mimeType,
            location || null,
            tags || null
        );
        
        console.log(`Photo uploaded successfully with ID: ${result.lastInsertRowid}`);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ error: 'Failed to upload photo: ' + error.message });
    }
});

router.delete('/:id', requireAuth, (req, res) => {
    const db = getDb();
    const photo = db.prepare('SELECT uploaded_by FROM photos WHERE id = ?').get(req.params.id);
    
    if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
    }
    
    if (photo.uploaded_by !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;

