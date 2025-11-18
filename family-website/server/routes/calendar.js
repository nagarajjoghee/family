import express from 'express';
import { getDb } from '../models/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
    const db = getDb();
    const { startDate, endDate } = req.query;
    
    let query = `
        SELECT e.*, u.username, u.full_name,
               (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id) as rsvp_count
        FROM events e
        JOIN users u ON e.creator_id = u.id
        WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
        query += ' AND e.event_date >= ?';
        params.push(startDate);
    }
    
    if (endDate) {
        query += ' AND e.event_date <= ?';
        params.push(endDate);
    }
    
    query += ' ORDER BY e.event_date ASC, e.event_time ASC';
    
    const events = db.prepare(query).all(...params);
    res.json(events);
});

router.get('/:id', (req, res) => {
    const db = getDb();
    const event = db.prepare(`
        SELECT e.*, u.username, u.full_name
        FROM events e
        JOIN users u ON e.creator_id = u.id
        WHERE e.id = ?
    `).get(req.params.id);
    
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get RSVPs
    const rsvps = db.prepare(`
        SELECT er.*, u.username, u.full_name
        FROM event_rsvps er
        JOIN users u ON er.user_id = u.id
        WHERE er.event_id = ?
    `).all(req.params.id);
    
    event.rsvps = rsvps;
    res.json(event);
});

router.post('/', requireAuth, (req, res) => {
    const { title, description, eventDate, eventTime, location } = req.body;
    
    if (!title || !eventDate) {
        return res.status(400).json({ error: 'Title and event date are required' });
    }
    
    const db = getDb();
    const result = db.prepare(`
        INSERT INTO events (creator_id, title, description, event_date, event_time, location)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        req.session.userId,
        title,
        description || null,
        eventDate,
        eventTime || null,
        location || null
    );
    
    res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/:id', requireAuth, (req, res) => {
    const { title, description, eventDate, eventTime, location } = req.body;
    const db = getDb();
    
    const event = db.prepare('SELECT creator_id FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.creator_id !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare(`
        UPDATE events 
        SET title = ?, description = ?, event_date = ?, event_time = ?, location = ?
        WHERE id = ?
    `).run(title, description, eventDate, eventTime, location, req.params.id);
    
    res.json({ success: true });
});

router.delete('/:id', requireAuth, (req, res) => {
    const db = getDb();
    const event = db.prepare('SELECT creator_id FROM events WHERE id = ?').get(req.params.id);
    
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.creator_id !== req.session.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

router.post('/:id/rsvp', requireAuth, (req, res) => {
    const { status } = req.body;
    const db = getDb();
    
    const event = db.prepare('SELECT id FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    
    const existingRsvp = db.prepare('SELECT id FROM event_rsvps WHERE event_id = ? AND user_id = ?')
        .get(req.params.id, req.session.userId);
    
    if (existingRsvp) {
        db.prepare('UPDATE event_rsvps SET status = ? WHERE id = ?')
            .run(status || 'attending', existingRsvp.id);
    } else {
        db.prepare('INSERT INTO event_rsvps (event_id, user_id, status) VALUES (?, ?, ?)')
            .run(req.params.id, req.session.userId, status || 'attending');
    }
    
    res.json({ success: true });
});

export default router;

