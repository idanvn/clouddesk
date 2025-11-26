# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites
- Node.js installed (v18 or higher)
- Google account
- Google Cloud Console access

## Step 1: Get Google Credentials (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Google Drive API
   - Gmail API
4. Create OAuth 2.0 credentials (Web application type)
   - Add `http://localhost:5173` to authorized origins
5. Create an API Key
6. Copy both the Client ID and API Key

## Step 2: Install & Configure (2 minutes)

```bash
# Navigate to project folder
cd google-drive-gmail-manager

# Install dependencies
npm install

# Edit src/config.js and add your credentials
# Replace YOUR_CLIENT_ID_HERE with your Client ID
# Replace YOUR_API_KEY_HERE with your API Key
```

## Step 3: Run the App (1 minute)

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# Click "Sign in with Google"
# Grant permissions
# Start using the app!
```

## Quick Feature Overview

### Google Drive Tab
- **Search**: Find files with queries
- **Organize**: Auto-sort files into folders by type
- **Delete Old**: Remove files older than X days
- **Share**: Share files with others via email
- **Download**: Get files to your computer

### Gmail Tab
- **Search**: Find emails with queries
- **Labels**: Create, delete, and apply labels
- **Delete Spam**: Clear spam folder
- **Delete Old**: Move old emails to trash

## Troubleshooting

**Can't sign in?**
- Check Client ID in `src/config.js`
- Verify `http://localhost:5173` is in authorized origins

**API errors?**
- Check API Key in `src/config.js`
- Ensure Drive API and Gmail API are enabled

**Still having issues?**
- See `SETUP_GUIDE.md` for detailed instructions
- Check browser console for error messages

## Next Steps

- Read `README.md` for full documentation
- See `SETUP_GUIDE.md` for detailed setup
- Check `PROJECT_SUMMARY.md` for technical details

## Build for Production

```bash
npm run build
# Files will be in dist/ folder
# Deploy to any static hosting service
```

That's it! Enjoy managing your Google Drive and Gmail!
