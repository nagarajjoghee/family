# KSVN Family Photo Sharing Website

A luxurious, grand family photo sharing platform with elegant design, featuring photo uploads, albums, comments, and a beautiful animated interface.

## Features

- **Stylish KSVN Branding**: Animated heart logo with spreading love particles
- **Time-based Marquee**: Dynamic greeting (Good Morning/Afternoon/Evening/Night) based on EST timezone
- **Photo Upload**: Drag-and-drop interface with preview functionality
- **Photo Albums**: Create and organize photos into albums
- **Comments System**: Add and view comments on photos
- **Client-side Storage**: Photos stored in IndexedDB for fast access
- **Grand Design**: Luxurious styling with elegant typography, gold accents, and smooth animations

## Technology Stack

- **Frontend**: React 18 with Vite
- **Backend**: Node.js with Express
- **Database**: SQLite (better-sqlite3) for metadata
- **Storage**: IndexedDB for client-side photo storage
- **Authentication**: Session-based authentication

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API and storage services
│   │   ├── App.jsx         # Main app component
│   │   └── App.css         # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── server.js          # Express server
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file for custom configuration:
   ```env
   PORT=4000
   SESSION_SECRET=your-secret-key-here
   ```

4. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:4000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### Default Login Credentials

- **Username**: `admin`
- **Password**: `family123`

> **Important**: Change the default password in production!

## Usage

1. Start both the backend and frontend servers
2. Open your browser and navigate to `http://localhost:5173`
3. Login with the default credentials
4. Create albums to organize your photos
5. Upload photos using the drag-and-drop interface
6. View photos in the gallery
7. Click on any photo to view it in full size and add comments

## Features in Detail

### Photo Upload
- Drag and drop multiple photos at once
- Preview before uploading
- Automatic organization by album

### Albums
- Create custom albums
- Organize photos into albums
- View all photos or filter by album

### Comments
- Add comments to photos
- View all comments
- Delete your own comments

### Design
- Elegant typography (Playfair Display, Cormorant Garamond)
- Gold accent colors (#ffd700)
- Smooth animations and transitions
- Responsive design for mobile devices

## Development

### Building for Production

Frontend:
```bash
cd client
npm run build
```

The built files will be in `client/dist/`

### Database

The database is automatically created in `server/data/ksvn.db` on first run. The database includes:
- Users table
- Albums table
- Photos table (metadata only)
- Comments table

Photos themselves are stored in the browser's IndexedDB.

## Notes

- Photos are stored client-side in IndexedDB, so they are specific to each browser
- Photo metadata (titles, descriptions, albums, etc.) is stored in the backend database
- The default admin user is created automatically on first run
- For production deployment, ensure to:
  - Change the default password
  - Set a secure SESSION_SECRET
  - Use HTTPS
  - Configure proper CORS settings

## License

This project is for family use.
