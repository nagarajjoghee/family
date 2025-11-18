# Quick Public Access - Using ngrok

The fastest way to get a public URL for testing:

## Steps:

1. **Make sure your server is running**:
   ```powershell
   cd "C:\Users\naguj\Automation Metrics\family-website\server"
   npm start
   ```

2. **Download ngrok**:
   - Go to: https://ngrok.com/download
   - Download for Windows
   - Extract ngrok.exe to a folder (e.g., `C:\ngrok\`)

3. **Run ngrok** (in a new terminal):
   ```powershell
   C:\ngrok\ngrok.exe http 3000
   ```

4. **Copy the public URL**:
   - You'll see something like: `https://abc123.ngrok.io`
   - This is your public URL!
   - Share this with family members

5. **Note**: 
   - Free ngrok URLs expire after 2 hours
   - URL changes each time you restart ngrok
   - For permanent hosting, use Railway or Render (see DEPLOYMENT.md)

## For Permanent Hosting:

See `DEPLOYMENT.md` for instructions on:
- Railway (easiest, free tier)
- Render (free tier available)
- Heroku (paid)
- Custom domain setup

