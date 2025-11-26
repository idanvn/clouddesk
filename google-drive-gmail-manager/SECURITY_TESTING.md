# Security Testing Checklist

Complete this checklist before deploying to production.

## Pre-Deployment Security Tests

### 1. Credentials & Configuration

#### Environment Variables
- [ ] `.env` file exists with real credentials
- [ ] `VITE_GOOGLE_CLIENT_ID` is set correctly
- [ ] `VITE_GOOGLE_API_KEY` is set correctly
- [ ] `.env` is listed in `.gitignore`
- [ ] `.env` is NOT committed to git
- [ ] `.env.example` has placeholder values only

#### Git Security
- [ ] Run: `git log --all --full-history -- "**/src/config.js"` - No real credentials in history
- [ ] Run: `git log --all --full-history -- "**/.env"` - No .env files in history
- [ ] `.gitignore` includes `.env` and `.env.*`

### 2. Google Cloud Console Configuration

#### API Key Restrictions
- [ ] API key restricted to: Drive API, Gmail API only
- [ ] Application restrictions set to: HTTP referrers
- [ ] Authorized referrers include only your domains
- [ ] Test: Try using API key from unauthorized domain (should fail)

#### OAuth Client ID
- [ ] Authorized JavaScript origins include only production URLs
- [ ] Authorized redirect URIs include only production URLs
- [ ] Test: Try auth from unauthorized origin (should fail)

#### OAuth Consent Screen
- [ ] App name is descriptive and professional
- [ ] App logo uploaded (optional)
- [ ] Support email is valid
- [ ] Scopes listed: `drive`, `gmail.modify`
- [ ] Test users removed (for public apps)
- [ ] Publishing status set correctly

### 3. Input Validation Testing

#### Email Validation
Test with these inputs:

- [ ] Valid: `user@example.com` → Should succeed
- [ ] Invalid: `userexample.com` → Should show error
- [ ] Invalid: `user@` → Should show error
- [ ] Invalid: `@example.com` → Should show error
- [ ] Typo: `user@gmail.con` → Should suggest `gmail.com`
- [ ] Typo: `user@gmial.com` → Should suggest `gmail.com`
- [ ] Long: 255+ character email → Should show error
- [ ] Empty: ` ` (spaces) → Should show error
- [ ] Special chars: `user+tag@example.com` → Should succeed
- [ ] Unicode: `user@üñíçödé.com` → Should handle gracefully

#### Search Query Validation
Test Drive search with:

- [ ] Normal: `name contains 'test'` → Should work
- [ ] Empty: `` → Should return all files
- [ ] Long: 1000+ character query → Should be truncated
- [ ] Special: `file's name` → Should escape properly
- [ ] SQL-like: `'; DROP TABLE--` → Should be sanitized
- [ ] Quotes: `"quoted text"` → Should work

Test Gmail search with:

- [ ] Normal: `from:test@example.com` → Should work
- [ ] Empty: `` → Should return recent emails
- [ ] Long: 1000+ character query → Should be truncated
- [ ] Special: `subject:"test's email"` → Should work

#### Numeric Input Validation
Test delete old files/emails:

- [ ] Valid: `365` → Should accept
- [ ] Minimum: `1` → Should accept
- [ ] Maximum: `3650` → Should accept
- [ ] Below min: `0` → Should reject or set to minimum
- [ ] Above max: `10000` → Should reject or set to maximum
- [ ] Invalid: `abc` → Should reject
- [ ] Negative: `-100` → Should reject
- [ ] Decimal: `365.5` → Should round or reject

### 4. Rate Limiting Tests

#### Drive API Rate Limiting
- [ ] Perform 11 searches rapidly → Should show rate limit error on 11th
- [ ] Wait 1 second → Should allow search again
- [ ] Perform 3 bulk operations rapidly → Should block 4th for 60 seconds

#### Gmail API Rate Limiting
- [ ] Perform 6 searches rapidly → Should show rate limit error on 6th
- [ ] Wait 1 second → Should allow search again

#### Bulk Operation Limiting
- [ ] Attempt to organize 1001+ files → Should show error
- [ ] Attempt to delete 1001+ files → Should show error
- [ ] Attempt to delete 1001+ emails → Should show error

### 5. OAuth & Authentication Tests

#### Sign-In Flow
- [ ] Click "Sign in with Google" → OAuth window opens
- [ ] Select Google account → Consent screen shows
- [ ] Grant permissions → Redirects to app successfully
- [ ] Check sessionStorage → `oauth_state` is stored then removed
- [ ] Inspect network → State parameter included in auth request
- [ ] User email displays in header → Correct email shown

#### CSRF Protection
- [ ] Inspect OAuth callback URL → Contains `state` parameter
- [ ] Try to replay OAuth callback with old state → Should fail
- [ ] Try OAuth with tampered state → Should fail and show security error

#### Sign-Out Flow
- [ ] Click "Sign Out" → Returns to sign-in page
- [ ] Check sessionStorage → `oauth_state` removed
- [ ] Try to access APIs after sign-out → Should fail (401)
- [ ] Sign in again → Fresh auth flow works

### 6. Error Handling Tests

#### Network Errors
- [ ] Disable internet → Operations show "Network error" message
- [ ] Slow connection → Operations show loading state properly
- [ ] Timeout → Shows "Request timed out" message

#### API Errors
- [ ] 401 Unauthorized → "Session expired. Please sign in again"
- [ ] 403 Forbidden → "You don't have permission"
- [ ] 404 Not Found → "Item was not found"
- [ ] 429 Too Many Requests → "Too many requests. Please wait"
- [ ] 500 Server Error → "Google services experiencing issues"

#### User Errors
- [ ] Share without email → "Please enter an email"
- [ ] Share without selecting files → "Please select files"
- [ ] Delete with invalid days → Shows validation error
- [ ] Create label with empty name → "Label name is required"
- [ ] Create label with 256+ chars → "Label name is too long"

### 7. Security Headers Tests

Use browser DevTools or online tools to verify:

#### Content Security Policy
- [ ] Open DevTools Console → No CSP violations
- [ ] Check `Content-Security-Policy` header → Present and correct
- [ ] Try inline script → Should be blocked (check console)
- [ ] External scripts → Only Google APIs allowed

#### Other Headers
- [ ] `X-Frame-Options: DENY` → Page cannot be framed
- [ ] `X-Content-Type-Options: nosniff` → MIME type enforced
- [ ] `Referrer-Policy` → Set to strict-origin-when-cross-origin

Test with: https://securityheaders.com/

### 8. XSS Protection Tests

#### Filename XSS
- [ ] Create file in Drive with name: `<script>alert('XSS')</script>`
- [ ] Search for the file → Displays safely (no alert)
- [ ] Download the file → Filename sanitized
- [ ] View in file list → Name displayed safely

#### Email XSS
- [ ] Send email with subject: `<img src=x onerror=alert('XSS')>`
- [ ] Search for email → Displays safely (no alert)
- [ ] View in email list → Subject displayed safely

#### Label XSS
- [ ] Create label: `<svg onload=alert('XSS')>`
- [ ] Label created → Name sanitized (no alert)
- [ ] View in label list → Displays safely

### 9. Production Build Tests

#### Build Configuration
- [ ] Run: `npm run build`
- [ ] Check `dist/` folder created
- [ ] Run: `ls dist/assets/*.map` → Should be empty (no source maps)
- [ ] Check `dist/assets/*.js` → Code is minified
- [ ] Search build files for "console.log" → Should not appear
- [ ] Search build files for "debugger" → Should not appear

#### Bundle Analysis
- [ ] Build size reasonable (< 500KB for main bundle)
- [ ] No .env file in dist folder
- [ ] No development dependencies in bundle
- [ ] API keys from environment variables only

### 10. Browser Security Tests

#### Storage Inspection
- [ ] Open Application tab in DevTools
- [ ] Check LocalStorage → No sensitive data stored
- [ ] Check SessionStorage → Only `oauth_state` (temporarily)
- [ ] Check Cookies → Only Google OAuth cookies
- [ ] Sign out → SessionStorage cleared

#### Memory Inspection
- [ ] Load app and sign in
- [ ] Search for files/emails
- [ ] Open DevTools Memory tab
- [ ] Take heap snapshot → Check for sensitive data
- [ ] Sign out → Take another snapshot
- [ ] Compare → Sensitive data should be cleared

### 11. Mobile & Cross-Browser Tests

Test on multiple platforms:

#### Desktop Browsers
- [ ] Chrome (latest) → All features work
- [ ] Firefox (latest) → All features work
- [ ] Safari (latest) → All features work
- [ ] Edge (latest) → All features work

#### Mobile Browsers
- [ ] iOS Safari → OAuth flow works
- [ ] Android Chrome → OAuth flow works
- [ ] Responsive design → UI adapts correctly

### 12. Destructive Action Tests

#### Confirmation Dialogs
- [ ] Delete old files → Confirmation shows file count
- [ ] Delete old emails → Confirmation shows email count
- [ ] Organize files → Confirmation warns "cannot be undone"
- [ ] Delete spam → Confirmation appears
- [ ] Delete label → Confirmation shows label name

#### Operation Safety
- [ ] Cancel confirmation → Operation not performed
- [ ] Confirm operation → Operation proceeds
- [ ] Error during operation → Partial completion reported
- [ ] Multiple rapid clicks → Only one operation triggered

### 13. API Scope Tests

#### Permission Requests
- [ ] First sign-in → Consent screen lists all scopes
- [ ] Drive scope: "See, edit, create, and delete all of your Google Drive files"
- [ ] Gmail scope: "Read, compose, send, and permanently delete all your email"
- [ ] User understands implications → Clear explanation in app

#### Scope Minimization Check
- [ ] Review if app truly needs full `drive` scope → Document why
- [ ] Review if app truly needs `gmail.modify` scope → Document why
- [ ] Consider if more restrictive scopes possible → Document decision

### 14. Logging & Monitoring

#### Development Logs
- [ ] Set `MODE=development` → Console shows debug logs
- [ ] Check logs contain helpful debug info
- [ ] No passwords/tokens in logs

#### Production Logs
- [ ] Set `MODE=production` → Build the app
- [ ] Run production build → No debug logs in console
- [ ] Errors logged → Generic messages only
- [ ] No stack traces exposed to users
- [ ] No API response details in console

### 15. Dependency Security

#### npm audit
```bash
npm audit
```
- [ ] Run: `npm audit` → 0 vulnerabilities
- [ ] If vulnerabilities found → Run `npm audit fix`
- [ ] Review breaking changes → Test after updates
- [ ] Document any unfixable vulnerabilities

#### Dependency Review
- [ ] All dependencies are actively maintained
- [ ] No deprecated packages
- [ ] No packages with known security issues
- [ ] Check last update dates → Recently maintained

### 16. Performance & DoS Protection

#### Large Dataset Tests
- [ ] Search with 100+ results → Loads reasonably fast
- [ ] Select all files → UI remains responsive
- [ ] Bulk operation on 100 items → Completes without freezing
- [ ] 1000+ item warning → Shows before processing

#### Concurrent Operations
- [ ] Try to trigger multiple bulk operations → Only one allowed
- [ ] Rapid clicking → No duplicate operations
- [ ] Background operations → UI remains usable

---

## Post-Deployment Verification

### Immediately After Deploy

- [ ] Test production URL → Site loads correctly
- [ ] OAuth flow → Works with production URL
- [ ] API calls → Use production API key/Client ID
- [ ] Error tracking → Errors reported to monitoring service
- [ ] HTTPS enforced → HTTP redirects to HTTPS

### 24 Hours After Deploy

- [ ] Check Google Cloud Console API usage → Within expected limits
- [ ] Review error logs → No unexpected errors
- [ ] Check user reports → No security issues reported
- [ ] Monitor quota usage → No unusual spikes

### Weekly Monitoring

- [ ] Run `npm audit` → Check for new vulnerabilities
- [ ] Review API quota usage → Check for abuse
- [ ] Check error tracking → Review patterns
- [ ] Update dependencies → Security patches applied

---

## Emergency Response

If a security issue is discovered:

1. **Immediate Actions**:
   - [ ] Disable the application if critical
   - [ ] Revoke API keys in Google Cloud Console
   - [ ] Reset OAuth client secret
   - [ ] Notify users if data was compromised

2. **Investigation**:
   - [ ] Document the issue
   - [ ] Identify affected users
   - [ ] Determine data exposure
   - [ ] Review access logs

3. **Remediation**:
   - [ ] Fix the vulnerability
   - [ ] Test the fix thoroughly
   - [ ] Deploy the fix
   - [ ] Verify the fix in production

4. **Post-Incident**:
   - [ ] Document lessons learned
   - [ ] Update security procedures
   - [ ] Add tests to prevent recurrence
   - [ ] Notify stakeholders

---

## Sign-Off

### Pre-Production Checklist Complete

**Tested By**: ______________________
**Date**: ______________________
**Version**: ______________________

**Critical Issues Found**: [ ] Yes [ ] No
**All Issues Resolved**: [ ] Yes [ ] No

**Ready for Production**: [ ] Yes [ ] No

**Notes**:
```
[Add any notes about security testing results]
```

---

**Last Updated**: January 24, 2025
