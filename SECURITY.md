# Security Policy

## Security Features

This application implements multiple layers of security to protect your Google Drive and Gmail data.

### Implemented Security Measures

#### 1. **Environment Variable Protection**
- API keys and Client IDs are stored in environment variables (`.env` file)
- Credentials are never hardcoded in source code
- `.env` files are excluded from version control via `.gitignore`

#### 2. **OAuth 2.0 with CSRF Protection**
- Implements Google OAuth 2.0 for secure authentication
- Uses cryptographically secure state parameters to prevent CSRF attacks
- State parameters are validated on every auth callback
- Tokens are properly revoked on sign-out

#### 3. **Input Validation & Sanitization**
- **Email Validation**: RFC 5322 compliant email validation with typo detection
- **Query Sanitization**: All search queries are sanitized before API calls
- **Filename Sanitization**: Downloaded filenames are sanitized to prevent XSS
- **Length Limits**: All user inputs have maximum length restrictions

#### 4. **Rate Limiting**
- Drive API: 10 requests per second
- Gmail API: 5 requests per second
- Bulk Operations: 3 operations per minute
- Automatic retry with delays when limits are reached

#### 5. **Secure Logging**
- Debug logs only in development mode
- Production logs contain no sensitive information
- Stack traces never exposed to users
- Error details logged generically

#### 6. **Content Security Policy (CSP)**
- Restricts script sources to trusted domains only
- Prevents inline script execution (except necessary Google APIs)
- Blocks framing to prevent clickjacking
- Enforces HTTPS for all API calls

#### 7. **Security Headers**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer leakage
- `Permissions-Policy` - Disables unnecessary browser features

#### 8. **Error Handling**
- User-friendly error messages that don't expose system details
- HTTP status codes mapped to actionable messages
- API errors sanitized before display
- Network errors handled gracefully

#### 9. **Operation Safety**
- Confirmation dialogs for all destructive actions
- Maximum item limits for bulk operations (1000 items)
- Batch processing to prevent API overload
- Automatic cleanup of sensitive data on unmount

#### 10. **Build Security**
- Source maps disabled in production builds
- Console statements removed from production
- Code minification and obfuscation
- Dependency scanning with `npm audit`

---

## Security Best Practices for Users

### Setup Security

1. **API Key Configuration**:
   ```bash
   # Copy environment template
   cp .env.example .env

   # Add your credentials
   # Edit .env with your actual API keys
   ```

2. **Google Cloud Console Restrictions**:
   - **API Key Restrictions**:
     - Restrict to: Drive API, Gmail API only
     - Application restrictions: HTTP referrers
     - Add only your production domains

   - **OAuth Client ID Restrictions**:
     - Authorized JavaScript origins: Add only your domains
     - Authorized redirect URIs: Whitelist specific URLs only

   - **OAuth Consent Screen**:
     - Set to "External" unless you have Google Workspace
     - Add only necessary scopes
     - List all required APIs

3. **Domain Restrictions**:
   ```
   # For development
   http://localhost:5173

   # For production
   https://yourdomain.com
   https://www.yourdomain.com
   ```

### Usage Security

1. **Sign Out**:
   - Always sign out when finished
   - Sign out revokes access tokens
   - Refresh page after sign-out for clean state

2. **Email Sharing**:
   - Double-check email addresses before sharing
   - Review selected files before confirmation
   - Files are shared with read-only access

3. **Bulk Operations**:
   - Review item counts in confirmation dialogs
   - Start with small batches for testing
   - Old emails go to trash (recoverable for 30 days)
   - Drive files are permanently deleted

4. **Browser Security**:
   - Keep browser updated
   - Use private/incognito mode for sensitive operations
   - Clear browser cache after use
   - Disable browser extensions that could access data

### Deployment Security

#### Environment Variables

Create `.env` file with:
```bash
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
```

**Never commit `.env` to version control!**

#### Production Build

```bash
# Build for production
npm run build

# Verify build security
ls -la dist/assets/*.map  # Should be empty (no source maps)

# Deploy only dist/ folder
```

#### Server-Side Headers

If deploying with a backend or using platforms like Netlify/Vercel, add additional security headers:

**Netlify `_headers` file**:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Vercel `vercel.json`**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

---

## Security Checklist

Use this checklist before production deployment:

### Google Cloud Console
- [ ] OAuth consent screen configured
- [ ] APIs enabled (Drive API, Gmail API)
- [ ] API Key created and restricted
- [ ] Client ID created and restricted
- [ ] Authorized domains whitelisted
- [ ] Test users removed (for public apps)
- [ ] OAuth scopes minimized

### Application Security
- [ ] `.env` file created with real credentials
- [ ] `.env` added to `.gitignore`
- [ ] No credentials in git history
- [ ] Environment variables tested
- [ ] Email validation tested
- [ ] Rate limiting tested
- [ ] Error messages user-friendly

### Build & Deployment
- [ ] Production build created (`npm run build`)
- [ ] No source maps in `dist/` folder
- [ ] Console logs removed from build
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] CSP headers tested

### Testing
- [ ] Sign-in/sign-out flow tested
- [ ] Email validation with invalid emails tested
- [ ] Search with special characters tested
- [ ] Bulk operations tested
- [ ] Rate limiting triggers tested
- [ ] Error scenarios tested
- [ ] Mobile/desktop responsive
- [ ] Multiple browsers tested

---

## Reported Security Issues

### How to Report

If you discover a security vulnerability, please:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours**: Acknowledgment of report
- **7 days**: Initial assessment and response
- **30 days**: Fix implementation and deployment
- **Public disclosure**: After fix is deployed

---

## Security Limitations

### Known Limitations

1. **Client-Side API Keys**:
   - API keys are embedded in JavaScript bundle
   - Visible to anyone who inspects network traffic
   - **Mitigation**: Use API key restrictions in Google Cloud Console
   - **Best Practice**: Implement backend proxy for production

2. **Browser Storage**:
   - OAuth tokens stored in browser memory
   - Accessible to browser extensions
   - **Mitigation**: Use private browsing for sensitive operations
   - **Best Practice**: Sign out when finished

3. **Rate Limits**:
   - Client-side rate limiting can be bypassed
   - Real protection comes from Google API quotas
   - **Mitigation**: Monitor API usage in Google Cloud Console

4. **XSS Protection**:
   - React provides inherent XSS protection
   - File names and emails are sanitized
   - **Limitation**: Complex Unicode in filenames may render oddly

5. **CSRF Protection**:
   - OAuth state parameter protects auth flow
   - No CSRF tokens for API calls (not needed for OAuth 2.0)
   - **Mitigation**: Google APIs validate OAuth tokens

### Recommendations for Production

1. **Implement Backend API Proxy**:
   - Move API key to server-side
   - Proxy all Google API requests through your backend
   - Add server-side rate limiting
   - Implement request logging and monitoring

2. **Add Authentication Layer**:
   - Implement user accounts with JWT
   - Store Google tokens server-side
   - Add session management
   - Implement refresh token rotation

3. **Enable Monitoring**:
   - Integrate error tracking (Sentry, LogRocket)
   - Monitor API usage and quotas
   - Set up alerts for unusual activity
   - Log security events

4. **Add Audit Trail**:
   - Log all destructive operations
   - Track file sharing events
   - Monitor bulk delete operations
   - Implement user activity logs

---

## Security Updates

### Staying Secure

1. **Dependencies**:
   ```bash
   # Check for vulnerabilities
   npm audit

   # Update dependencies
   npm update

   # Fix vulnerabilities
   npm audit fix
   ```

2. **Security Patches**:
   - Monitor React security advisories
   - Update Google API client libraries
   - Check for Vite security updates
   - Subscribe to security mailing lists

3. **Review Logs**:
   - Check browser console for security warnings
   - Review Google Cloud Console audit logs
   - Monitor API quota usage
   - Check for failed auth attempts

---

## Compliance

### Data Privacy

This application:
- ✅ Does NOT store user data persistently
- ✅ Does NOT send data to third-party servers
- ✅ Does NOT collect analytics without consent
- ✅ Processes all data client-side
- ✅ Clears data on sign-out

### GDPR Compliance

- Right to Access: Users can export their Google data directly
- Right to Deletion: Users control file/email deletion
- Data Portability: All operations use standard Google APIs
- Consent: OAuth consent screen explains data usage

### Scope Permissions

The application requests:
- `https://www.googleapis.com/auth/drive` - Full Drive access for organization and deletion
- `https://www.googleapis.com/auth/gmail.modify` - Gmail access for labeling and deletion

**Note**: These are broad scopes required for the app's functionality. Users should carefully review and approve these permissions.

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Security](https://developers.google.com/drive/api/guides/security)
- [Gmail API Security](https://developers.google.com/gmail/api/auth/about-auth)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)

---

## Version History

| Version | Date | Security Changes |
|---------|------|------------------|
| 1.0.0 | 2025-01-24 | Initial implementation with all security features |

---

**Last Updated**: January 24, 2025
**Security Contact**: [your-email@example.com]
