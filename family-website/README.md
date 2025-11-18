# Family Website

A comprehensive family website for personal use, built with HTML, CSS, and JavaScript. Features include photo galleries, family blog, event calendar, member profiles, and private messaging.

## Features

- **Photo Galleries & Albums**: Upload, organize, and share family photos in albums
- **Family Blog**: Create and share blog posts with categories and tags
- **Event Calendar**: Create family events with RSVP functionality
- **Family Member Profiles**: View and manage family member profiles with stats
- **Private Messaging**: Send private messages between family members
- **Comments System**: Comment on photos and blog posts
- **Authentication**: Secure login and registration system

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js with Express
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Session-based with bcrypt password hashing

## Project Structure

```
family-website/
├── client/                 # Frontend files
│   ├── index.html          # Main HTML file
│   ├── styles/             # CSS stylesheets
│   │   ├── main.css
│   │   ├── auth.css
│   │   ├── photos.css
│   │   ├── blog.css
│   │   ├── calendar.css
│   │   ├── profiles.css
│   │   └── messages.css
│   └── js/                 # JavaScript files
│       ├── api.js          # API client
│       ├── auth.js          # Authentication
│       ├── navigation.js    # Page navigation
│       ├── photos.js        # Photo gallery
│       ├── blog.js          # Blog functionality
│       ├── calendar.js      # Calendar and events
│       ├── profiles.js      # User profiles
│       ├── messages.js      # Private messaging
│       └── main.js          # Main app logic
├── server/                 # Backend server
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── photos.js
│   │   ├── albums.js
│   │   ├── blog.js
│   │   ├── calendar.js
│   │   ├── profiles.js
│   │   ├── messages.js
│   │   └── comments.js
│   ├── models/            # Database models
│   │   └── database.js
│   ├── middleware/        # Middleware
│   │   └── auth.js
│   ├── server.js          # Express server
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the server directory:
   ```bash
   cd family-website/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file for custom configuration:
   ```env
   PORT=3000
   SESSION_SECRET=your-secret-key-here-change-in-production
   ```

### Running the Application

1. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Default Account

A default admin account is created automatically:
- **Username**: admin
- **Password**: family123

**Important**: Change the default password after first login!

## Usage

### Registration

1. Click "Register" in the navigation
2. Fill in your information:
   - Username (required)
   - Email (required)
   - Password (required)
   - Full Name (optional)
   - Bio (optional)
   - Relationship (optional, e.g., "Mother", "Father", "Son", "Daughter")

### Photo Galleries

- **Create Album**: Click "Create Album" button (requires login)
- **Upload Photos**: Select an album and upload photos with titles and descriptions
- **View Photos**: Click on any photo to view in full size with comments
- **Add Comments**: Login and add comments to photos

### Blog

- **Create Post**: Click "New Post" button (requires login)
- **View Posts**: Browse all blog posts on the blog page
- **Featured Posts**: Mark posts as featured for highlighting
- **Categories & Tags**: Organize posts with categories and tags

### Event Calendar

- **Create Event**: Click "Create Event" button (requires login)
- **View Calendar**: See monthly calendar view with events marked
- **RSVP**: Click on events to RSVP (Yes/Maybe/No)
- **Event Details**: View event details including location, time, and RSVPs

### Profiles

- **View Profiles**: Browse all family member profiles
- **Edit Profile**: Click "Edit Profile" on your own profile
- **Profile Stats**: See photo, post, and event counts for each member

### Messages

- **Compose**: Click "Compose" to send a private message
- **Inbox**: View received messages
- **Sent**: View sent messages
- **Reply**: Reply to messages directly from the message view

## Database

The application uses SQLite for data storage. The database file is automatically created in `server/data/family.db` on first run.

### Database Schema

- `users` - Family member accounts
- `albums` - Photo albums
- `photos` - Photo metadata and binary data
- `blog_posts` - Blog entries
- `events` - Calendar events
- `event_rsvps` - Event RSVPs
- `messages` - Private messages
- `comments` - Comments on photos and posts

## Security Notes

- Passwords are hashed using bcrypt
- Sessions are used for authentication
- Users can only edit/delete their own content
- Private messages are only visible to sender and recipient

## Development

### Adding New Features

1. Add routes in `server/routes/`
2. Add API methods in `client/js/api.js`
3. Add UI components in `client/js/`
4. Add styles in `client/styles/`

### Database Migrations

The database schema is automatically created on first run. To modify the schema, edit `server/models/database.js` and restart the server.

## Troubleshooting

### Server won't start
- Check that port 3000 (or your configured port) is not in use
- Ensure all dependencies are installed (`npm install`)

### Database errors
- Delete `server/data/family.db` to reset the database
- Check file permissions for the data directory

### Photos not uploading
- Check file size limits (default: 10MB)
- Ensure proper MIME types are being sent

## License

This is a personal use project. Feel free to modify and use as needed.

## Support

For issues or questions, please check the code comments or modify as needed for your family's requirements.

