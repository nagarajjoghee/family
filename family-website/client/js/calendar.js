let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

async function loadCalendarPage() {
    renderCalendar();
    await loadEvents();
}

function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = `
        <div class="calendar-header">
            <div class="calendar-nav">
                <button onclick="previousMonth()">← Previous</button>
                <h2>${monthNames[currentMonth]} ${currentYear}</h2>
                <button onclick="nextMonth()">Next →</button>
            </div>
        </div>
        <div class="calendar-grid">
            ${dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
    `;
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += `<div class="calendar-day other-month"></div>`;
    }
    
    // Days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getDate() === day && 
                       today.getMonth() === currentMonth && 
                       today.getFullYear() === currentYear;
        
        html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}" onclick="viewDayEvents('${dateStr}')">
            ${day}
        </div>`;
    }
    
    // Fill remaining cells
    const totalCells = startingDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let i = 0; i < remainingCells && totalCells < 42; i++) {
        html += `<div class="calendar-day other-month"></div>`;
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Load events and mark days
    loadEventsForCalendar();
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

async function loadEventsForCalendar() {
    try {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];
        
        const events = await API.getEvents(startDate, endDate);
        
        // Mark days with events
        events.forEach(event => {
            const eventDate = event.event_date.split('T')[0];
            const dayElement = document.querySelector(`[data-date="${eventDate}"]`);
            if (dayElement) {
                dayElement.classList.add('has-events');
            }
        });
    } catch (error) {
        console.error('Error loading events for calendar:', error);
    }
}

async function loadEvents() {
    try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        
        const events = await API.getEvents(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );
        
        const container = document.getElementById('calendarContainer');
        const existingCalendar = container.innerHTML;
        
        if (events.length === 0) {
            container.innerHTML = existingCalendar + `
                <div class="events-list">
                    <h3>Upcoming Events</h3>
                    <div class="empty-state">
                        <p>No upcoming events</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = existingCalendar + `
            <div class="events-list">
                <h3>Upcoming Events</h3>
                ${events.map(event => `
                    <div class="event-item" onclick="viewEvent(${event.id})">
                        <h3>${event.title}</h3>
                        <div class="event-meta">
                            <span>📅 ${new Date(event.event_date).toLocaleDateString()}</span>
                            ${event.event_time ? `<span>🕐 ${event.event_time}</span>` : ''}
                            ${event.location ? `<span>📍 ${event.location}</span>` : ''}
                        </div>
                        ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                        <div class="event-rsvps">
                            <small>${event.rsvp_count || 0} RSVPs</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Failed to load events', 'error');
    }
}

async function viewEvent(eventId) {
    try {
        const event = await API.getEvent(eventId);
        const currentUser = getCurrentUser();
        
        showModal(`
            <div class="event-detail">
                <h2>${event.title}</h2>
                <div class="event-meta">
                    <span>📅 ${new Date(event.event_date).toLocaleDateString()}</span>
                    ${event.event_time ? `<span>🕐 ${event.event_time}</span>` : ''}
                    ${event.location ? `<span>📍 ${event.location}</span>` : ''}
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                <div class="event-rsvps">
                    <h3>RSVPs (${event.rsvps ? event.rsvps.length : 0})</h3>
                    ${event.rsvps && event.rsvps.length > 0 ? `
                        <ul>
                            ${event.rsvps.map(rsvp => `
                                <li>${rsvp.full_name || rsvp.username} - ${rsvp.status}</li>
                            `).join('')}
                        </ul>
                    ` : '<p>No RSVPs yet</p>'}
                    ${currentUser ? `
                        <div class="rsvp-buttons">
                            <button class="rsvp-yes" onclick="rsvpToEvent(${eventId}, 'attending')">Yes</button>
                            <button class="rsvp-maybe" onclick="rsvpToEvent(${eventId}, 'maybe')">Maybe</button>
                            <button class="rsvp-no" onclick="rsvpToEvent(${eventId}, 'not attending')">No</button>
                        </div>
                    ` : '<p>Login to RSVP</p>'}
                </div>
                ${currentUser && currentUser.id === event.creator_id ? `
                    <div class="event-actions" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                        <button class="btn btn-secondary" onclick="editEvent(${eventId})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteEvent(${eventId})">Delete</button>
                    </div>
                ` : ''}
            </div>
        `);
    } catch (error) {
        console.error('Error loading event:', error);
        showNotification('Failed to load event', 'error');
    }
}

async function rsvpToEvent(eventId, status) {
    try {
        await API.rsvpToEvent(eventId, status);
        viewEvent(eventId);
        showNotification('RSVP updated!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to RSVP', 'error');
    }
}

function showCreateEventModal() {
    showModal(`
        <h2>Create Event</h2>
        <form id="createEventForm" onsubmit="createEvent(event)">
            <div class="form-group">
                <label>Event Title</label>
                <input type="text" name="title" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="eventDate" required>
            </div>
            <div class="form-group">
                <label>Time</label>
                <input type="time" name="eventTime">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="location">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="5"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create Event</button>
        </form>
    `);
}

async function createEvent(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        await API.createEvent({
            title: formData.get('title'),
            eventDate: formData.get('eventDate'),
            eventTime: formData.get('eventTime') || null,
            location: formData.get('location') || null,
            description: formData.get('description') || null
        });
        closeModal();
        loadCalendarPage();
        showNotification('Event created!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to create event', 'error');
    }
}

async function editEvent(eventId) {
    try {
        const event = await API.getEvent(eventId);
        const eventDate = event.event_date.split('T')[0];
        
        showModal(`
            <h2>Edit Event</h2>
            <form id="editEventForm" onsubmit="updateEvent(event, ${eventId})">
                <div class="form-group">
                    <label>Event Title</label>
                    <input type="text" name="title" value="${event.title}" required>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" name="eventDate" value="${eventDate}" required>
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <input type="time" name="eventTime" value="${event.event_time || ''}">
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value="${event.location || ''}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="5">${event.description || ''}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Update Event</button>
            </form>
        `);
    } catch (error) {
        showNotification('Failed to load event for editing', 'error');
    }
}

async function updateEvent(event, eventId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        await API.updateEvent(eventId, {
            title: formData.get('title'),
            eventDate: formData.get('eventDate'),
            eventTime: formData.get('eventTime') || null,
            location: formData.get('location') || null,
            description: formData.get('description') || null
        });
        closeModal();
        loadCalendarPage();
        showNotification('Event updated!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to update event', 'error');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        await API.deleteEvent(eventId);
        closeModal();
        loadCalendarPage();
        showNotification('Event deleted', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to delete event', 'error');
    }
}

function viewDayEvents(dateStr) {
    // This could show a modal with events for that specific day
    // For now, just scroll to events list
    const eventsList = document.querySelector('.events-list');
    if (eventsList) {
        eventsList.scrollIntoView({ behavior: 'smooth' });
    }
}

// Make functions globally available
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.viewDayEvents = viewDayEvents;
window.viewEvent = viewEvent;
window.rsvpToEvent = rsvpToEvent;
window.createEvent = createEvent;
window.editEvent = editEvent;
window.updateEvent = updateEvent;
window.deleteEvent = deleteEvent;
window.showCreateEventModal = showCreateEventModal;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', showCreateEventModal);
    }
});

