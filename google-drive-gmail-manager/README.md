# Google Drive & Gmail Manager

A comprehensive React application for managing Google Drive files and Gmail messages with advanced features like auto-organization, bulk operations, and label management.

## Features

### Google Drive Management
- **Advanced File Search**: Search files using Google Drive query syntax
- **Auto-Organization**: Automatically organize files into folders by type:
  - Documents (Google Docs, PDFs, Word files)
  - Spreadsheets (Google Sheets, Excel files)
  - Images (JPEG, PNG, GIF)
  - Videos (MP4, AVI)
- **Bulk Delete Old Files**: Delete files older than a specified number of days
- **File Sharing**: Share multiple files with users via email
- **File Download**: Download files directly from the interface
- **Multi-Select**: Checkbox selection for bulk operations

### Gmail Management
- **Advanced Email Search**: Search emails using Gmail query syntax
- **Label Management**:
  - Create new labels
  - Delete custom labels
  - View all labels
  - Apply labels to individual emails
- **Spam Deletion**: Delete all spam emails at once
- **Delete Old Emails**: Move emails older than specified days to trash
- **Email List Display**: View emails with sender, subject, and date information

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Google APIs**:
  - Drive API v3
  - Gmail API v1

## Prerequisites

Before you begin, you need to set up Google Cloud credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Drive API
   - Gmail API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" in the sidebar
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain (if deploying)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain (if deploying)
   - Copy the Client ID
5. Create an API Key:
   - Go to "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API Key

## Installation

1. Clone or download this project

2. Navigate to the project directory:
```bash
cd google-drive-gmail-manager
```

3. Install dependencies:
```bash
npm install
```

4. Configure your Google API credentials:
   - Copy the environment template: `cp .env.example .env`
   - Edit `.env` and add your credentials:

```bash
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-actual-api-key
```

   **⚠️ IMPORTANT**: Never commit the `.env` file to version control!

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Usage

### Initial Setup

1. Click "Sign in with Google" on the landing page
2. Grant permissions for:
   - Google Drive access
   - Gmail modify access
3. You'll be redirected to the main application

### Google Drive Tab

1. **Search Files**:
   - Enter a search query in the search box
   - Use Google Drive query syntax (e.g., `name contains 'report'`)
   - Click "Search" or press Enter

2. **Auto-Organize Files**:
   - Click "Organize Files" button
   - Confirm the action
   - Files will be organized into folders by type

3. **Delete Old Files**:
   - Click "Delete Old Files"
   - Specify the number of days (default: 365)
   - Confirm deletion

4. **Share Files**:
   - Select files using checkboxes
   - Click "Share Files"
   - Enter the recipient's email address
   - Confirm sharing

5. **Download Files**:
   - Click the download icon next to any file in the list

### Gmail Tab

1. **Search Emails**:
   - Enter a Gmail query (e.g., `from:someone@example.com`)
   - Click "Search" or press Enter

2. **Create Label**:
   - Click "Create Label"
   - Enter a label name
   - Click "Create"

3. **Manage Labels**:
   - Click "Manage Labels"
   - View all custom labels
   - Delete labels by clicking the X icon

4. **Delete Spam**:
   - Click "Delete Spam"
   - Confirm to permanently delete all spam emails

5. **Delete Old Emails**:
   - Click "Delete Old Emails"
   - Specify the number of days (default: 365)
   - Confirm to move old emails to trash

6. **Apply Labels to Emails**:
   - Search for emails first
   - Use the dropdown in each row to apply a label

## File Structure

```
google-drive-gmail-manager/
├── public/
├── src/
│   ├── components/
│   │   ├── Alert.jsx           # Success/error alert component
│   │   ├── ConfirmDialog.jsx   # Confirmation dialog component
│   │   ├── Gmail.jsx            # Gmail management interface
│   │   ├── GoogleDrive.jsx      # Drive management interface
│   │   ├── Header.jsx           # App header with sign out
│   │   ├── Loading.jsx          # Loading spinner component
│   │   └── SignIn.jsx           # Sign-in landing page
│   ├── utils/
│   │   ├── driveApi.js          # Google Drive API functions
│   │   ├── gmailApi.js          # Gmail API functions
│   │   └── googleApi.js         # Google OAuth initialization
│   ├── App.jsx                  # Main app component
│   ├── config.js                # API credentials configuration
│   ├── index.css                # Tailwind CSS imports
│   └── main.jsx                 # App entry point
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## API Scopes

The application requests the following OAuth scopes:

- `https://www.googleapis.com/auth/drive` - Full access to Google Drive
- `https://www.googleapis.com/auth/gmail.modify` - Read, compose, send, and permanently delete emails

## Security

This application implements comprehensive security measures. See [SECURITY.md](SECURITY.md) for full details.

### Key Security Features

✅ **Environment Variables**: API keys stored in `.env` files, not in source code
✅ **OAuth 2.0 with CSRF Protection**: Secure authentication with state parameter verification
✅ **Input Validation**: Email addresses, search queries, and all user inputs are validated
✅ **Rate Limiting**: Prevents API abuse with configurable rate limits
✅ **Content Security Policy**: Restricts script execution to trusted sources
✅ **Sanitization**: All outputs are sanitized to prevent XSS attacks
✅ **Secure Logging**: No sensitive data logged in production
✅ **Error Handling**: User-friendly errors without exposing system details

### Security Best Practices

**Before Production Deployment:**

1. **Restrict API Keys in Google Cloud Console**:
   - Limit to Drive API and Gmail API only
   - Add HTTP referrer restrictions
   - Whitelist only your production domains

2. **Configure OAuth Client ID**:
   - Add only authorized domains
   - Whitelist specific redirect URIs
   - Remove test users for public apps

3. **Environment Security**:
   - Never commit `.env` files to version control
   - Use different API keys for development and production
   - Rotate API keys periodically

4. **Testing**:
   - Complete the [SECURITY_TESTING.md](SECURITY_TESTING.md) checklist
   - Test email validation with invalid inputs
   - Verify rate limiting triggers correctly
   - Test error scenarios and confirmations

### Security Limitations

⚠️ **Client-Side API Keys**: While API keys are in environment variables, they're still embedded in the JavaScript bundle and visible to anyone who inspects the code. This is a limitation of client-side applications.

**Mitigation**:
- Use API key restrictions in Google Cloud Console
- For production apps with sensitive data, implement a backend API proxy

### Reporting Security Issues

Found a security vulnerability? Please see [SECURITY.md](SECURITY.md) for reporting instructions. **Do not** open public issues for security concerns.

## Troubleshooting

### "Google API not loaded" error
- Check your internet connection
- Ensure the Google API script is loading correctly in `index.html`

### "Failed to initialize Google API" error
- Verify your API Key in `src/config.js`
- Ensure Drive API and Gmail API are enabled in Google Cloud Console

### OAuth consent screen errors
- Make sure authorized JavaScript origins include your development URL
- Check that the OAuth consent screen is configured properly
- For development, you may need to add test users in Google Cloud Console

### "Permission denied" errors
- Ensure you've granted all requested permissions during sign-in
- Try signing out and signing in again
- Check that the required APIs are enabled in your Google Cloud project

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory. You can deploy these to any static hosting service.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available for educational and personal use.

## Support

For issues related to:
- Google APIs: Check [Google API documentation](https://developers.google.com/apis-explorer)
- React/Vite: Check respective documentation
- This application: Review the code or create an issue

## Development

To contribute or modify:

1. Make your changes
2. Test thoroughly with your Google account
3. Ensure all features work as expected
4. Build and deploy

## Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Icons from Lucide React
- Google APIs for Drive and Gmail integration
