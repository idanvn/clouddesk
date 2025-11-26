# Detailed Setup Guide

This guide will walk you through setting up the Google Drive & Gmail Manager application step-by-step.

## Step 1: Google Cloud Project Setup

### 1.1 Create a Google Cloud Project

1. Visit the [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the project dropdown at the top of the page
4. Click "New Project"
5. Enter a project name (e.g., "Drive Gmail Manager")
6. Click "Create"
7. Wait for the project to be created and select it

### 1.2 Enable Required APIs

1. In the left sidebar, click "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"
4. Go back to the Library
5. Search for "Gmail API"
6. Click on it and press "Enable"

### 1.3 Configure OAuth Consent Screen

1. In the left sidebar, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Drive & Gmail Manager
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Add these scopes:
   - `.../auth/drive` (Google Drive API)
   - `.../auth/gmail.modify` (Gmail API)
8. Click "Update" then "Save and Continue"
9. On the Test users page (if in testing mode):
   - Click "Add Users"
   - Add your email address and any other test users
   - Click "Save and Continue"
10. Review and click "Back to Dashboard"

### 1.4 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "Drive Gmail Web Client")
5. Under "Authorized JavaScript origins":
   - Click "Add URI"
   - Add `http://localhost:5173` (for development)
   - If deploying, also add your production URL
6. Under "Authorized redirect URIs":
   - Click "Add URI"
   - Add `http://localhost:5173` (for development)
   - If deploying, also add your production URL
7. Click "Create"
8. **IMPORTANT**: Copy the Client ID shown in the popup (you'll need this later)
9. Click "OK"

### 1.5 Create API Key

1. Still in "Credentials", click "Create Credentials" > "API Key"
2. **IMPORTANT**: Copy the API Key shown in the popup (you'll need this later)
3. (Optional but recommended) Click "Restrict Key":
   - Under "API restrictions", select "Restrict key"
   - Check "Google Drive API" and "Gmail API"
   - Click "Save"

## Step 2: Application Installation

### 2.1 Download and Install Dependencies

1. Download or clone this project
2. Open a terminal/command prompt
3. Navigate to the project directory:
   ```bash
   cd google-drive-gmail-manager
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

### 2.2 Configure API Credentials

1. Open the file `src/config.js` in your code editor
2. Replace the placeholders with your actual credentials:
   ```javascript
   export const CONFIG = {
     CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',  // Replace with your Client ID
     API_KEY: 'YOUR_API_KEY_HERE',  // Replace with your API Key
     // Don't change the lines below
     DISCOVERY_DOCS: [
       'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
       'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'
     ],
     SCOPES: [
       'https://www.googleapis.com/auth/drive',
       'https://www.googleapis.com/auth/gmail.modify'
     ].join(' ')
   };
   ```
3. Save the file

## Step 3: Running the Application

### 3.1 Start Development Server

1. In your terminal, make sure you're in the project directory
2. Run:
   ```bash
   npm run dev
   ```
3. You should see output like:
   ```
   VITE v5.x.x  ready in XXX ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```
4. Open your browser and go to `http://localhost:5173`

### 3.2 First Sign-In

1. You should see the sign-in page
2. Click "Sign in with Google"
3. Select your Google account
4. Review the permissions requested:
   - View and manage your Drive files
   - Read, compose, send, and permanently delete your email
5. Click "Allow" to grant permissions
6. You'll be redirected to the application

## Step 4: Testing the Application

### 4.1 Test Google Drive Features

1. Click on the "Google Drive" tab (should be active by default)
2. Try searching for files:
   - Leave the search box empty and click "Search" to see all files
   - Or enter a query like `name contains 'test'`
3. Test other features:
   - Select some files using checkboxes
   - Try the various action buttons

### 4.2 Test Gmail Features

1. Click on the "Gmail" tab
2. Try searching for emails:
   - Leave the search box empty and click "Search" to see recent emails
   - Or enter a query like `from:example@gmail.com`
3. Test label management:
   - Click "Create Label" and add a new label
   - Click "Manage Labels" to view all labels

## Common Issues and Solutions

### Issue: "Failed to initialize Google API"

**Solution:**
- Double-check that you copied the API Key correctly in `src/config.js`
- Ensure there are no extra spaces or quotes
- Verify that Google Drive API and Gmail API are enabled in your Google Cloud Console

### Issue: "Invalid OAuth client"

**Solution:**
- Verify your Client ID is correct in `src/config.js`
- Make sure `http://localhost:5173` is added to Authorized JavaScript origins in Google Cloud Console
- Check that you're accessing the app from the exact URL authorized (including port number)

### Issue: "Access denied" or "Permission denied"

**Solution:**
- In Google Cloud Console, check the OAuth consent screen configuration
- Make sure your email is added as a test user (if the app is in testing mode)
- Try signing out and signing in again
- Revoke access in [Google Account Security](https://myaccount.google.com/permissions) and try again

### Issue: "This app isn't verified"

**Solution:**
- This is normal for apps in development/testing mode
- Click "Advanced" then "Go to [App Name] (unsafe)" to proceed
- For production use, you would need to submit your app for verification

### Issue: Blank page or JavaScript errors

**Solution:**
- Open browser DevTools (F12) and check the Console for errors
- Make sure all dependencies installed correctly: `npm install`
- Try clearing browser cache and reloading
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## Security Best Practices

### For Development:
- Never commit your `src/config.js` file with real credentials to public repositories
- Add `src/config.js` to `.gitignore` if sharing code

### For Production:
- Consider implementing a backend to secure your API keys
- Use environment variables instead of hardcoding credentials
- Implement rate limiting and monitoring
- Consider publishing your OAuth consent screen for public use

## Next Steps

Once everything is working:

1. Explore all features in both tabs
2. Test with your actual Google Drive and Gmail data
3. Customize the application as needed
4. Consider adding more features or modifying existing ones

## Getting Help

If you encounter issues not covered here:

1. Check the main README.md file
2. Review Google's API documentation:
   - [Google Drive API](https://developers.google.com/drive/api/v3/reference)
   - [Gmail API](https://developers.google.com/gmail/api/reference/rest)
3. Check the browser console for error messages
4. Verify all setup steps were completed correctly

## Deployment

To deploy this application:

1. Build the production version:
   ```bash
   npm run build
   ```
2. The built files will be in the `dist/` directory
3. Deploy to your hosting service (Netlify, Vercel, GitHub Pages, etc.)
4. Update the Authorized JavaScript origins and redirect URIs in Google Cloud Console to include your production URL
5. Consider implementing proper credential management for production

Enjoy using your Google Drive & Gmail Manager!
