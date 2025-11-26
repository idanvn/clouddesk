// Google API Configuration
// Credentials are loaded from environment variables for security
// Copy .env.example to .env and add your credentials

// SECURITY: Never commit real credentials to version control
// Use environment variables to keep API keys secure

export const CONFIG = {
  // OAuth 2.0 Client ID from Google Cloud Console
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',

  // API Key from Google Cloud Console
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY_HERE',

  // Google API Discovery Documents
  DISCOVERY_DOCS: [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'
  ],

  // OAuth Scopes
  // Note: These are broad scopes. Review if your use case can work with more restrictive scopes:
  // - 'drive.readonly' for read-only access
  // - 'drive.file' for files created by this app only
  SCOPES: [
    'https://www.googleapis.com/auth/drive',           // Full Drive access
    'https://www.googleapis.com/auth/gmail.modify'     // Gmail read/modify/delete
  ].join(' ')
};

// Validation: Warn if credentials are not configured
if (typeof window !== 'undefined') {
  if (!CONFIG.CLIENT_ID || CONFIG.CLIENT_ID.includes('YOUR_CLIENT_ID')) {
    console.warn('⚠️ Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file');
  }
  if (!CONFIG.API_KEY || CONFIG.API_KEY.includes('YOUR_API_KEY')) {
    console.warn('⚠️ Google API Key not configured. Please set VITE_GOOGLE_API_KEY in .env file');
  }
}
