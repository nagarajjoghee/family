# Deploying Family Website to Public Hosting

This guide will help you deploy your family website to make it accessible publicly on the internet.

## Quick Options

### Option 1: Railway (Recommended - Easiest)
Railway is free for small projects and very easy to use.

1. **Sign up**: Go to https://railway.app and sign up with GitHub
2. **Install Railway CLI** (optional, or use web interface):
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. **Deploy**:
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or upload the `family-website` folder)
   - Set root directory to `family-website/server`
   - Railway will auto-detect Node.js and deploy
   - Add environment variable: `PORT` (Railway sets this automatically)
   - Your site will be live at a `*.railway.app` URL

### Option 2: Render (Free Tier Available)
1. **Sign up**: Go to https://render.com
2. **Create New Web Service**:
   - Connect your GitHub repo or upload files
   - Set root directory to `family-website/server`
   - Build command: (leave empty)
   - Start command: `node server.js`
   - Add environment variable: `PORT` (Render sets this automatically)
3. **Deploy**: Click "Create Web Service"

### Option 3: Heroku (Free Tier Discontinued, Paid)
1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli
2. **Login**: `heroku login`
3. **Create app**: `heroku create your-family-website`
4. **Deploy**: 
   ```bash
   cd family-website/server
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-family-website
   git push heroku main
   ```

### Option 4: Using ngrok (Temporary - For Testing)
Great for quick testing before permanent deployment.

1. **Download ngrok**: https://ngrok.com/download
2. **Start your server**: 
   ```bash
   cd family-website/server
   npm start
   ```
3. **In another terminal, run ngrok**:
   ```bash
   ngrok http 3000
   ```
4. **Copy the public URL** (e.g., `https://abc123.ngrok.io`)
5. **Share this URL** with family members
6. **Note**: Free ngrok URLs change each time you restart

## Environment Variables

For production, set these environment variables:

- `PORT`: Port number (usually set automatically by hosting service)
- `SESSION_SECRET`: A strong random string for session security
- `ALLOWED_ORIGIN`: Your domain (optional, for CORS)

## Important Security Notes

1. **Change Default Password**: The default admin password is `family123` - change this immediately!
2. **Session Secret**: Generate a strong random string for `SESSION_SECRET`
3. **HTTPS**: Most hosting services provide HTTPS automatically
4. **Database**: SQLite file will be stored on the server - make sure it's backed up

## Custom Domain (Optional)

After deployment, you can add a custom domain:
1. Purchase a domain (e.g., from Namecheap, GoDaddy)
2. In your hosting service, add the domain
3. Update DNS records as instructed by your hosting provider

## Testing Your Deployment

1. Visit your public URL
2. Test login with admin credentials
3. Upload a test photo
4. Create a test blog post
5. Verify all features work

## Troubleshooting

- **Port Issues**: Most hosting services set PORT automatically via environment variable
- **Database Issues**: Ensure the `data` directory is writable
- **CORS Errors**: Update `ALLOWED_ORIGIN` environment variable with your domain

