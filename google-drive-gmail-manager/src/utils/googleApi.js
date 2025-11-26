import { CONFIG } from '../config';
import { generateStateParameter, storeOAuthState, verifyOAuthState, logger } from './security';

let gapiInited = false;
let tokenClient;

/**
 * Initialize Google API client
 * @returns {Promise<void>}
 */
export const initGoogleApi = () => {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error('Google API not loaded'));
      return;
    }

    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          apiKey: CONFIG.API_KEY,
          discoveryDocs: CONFIG.DISCOVERY_DOCS,
        });
        gapiInited = true;
        logger.debug('Google API initialized successfully');
        resolve();
      } catch (error) {
        logger.error('Failed to initialize Google API', error);
        reject(error);
      }
    });
  });
};

/**
 * Initialize OAuth token client with CSRF protection
 * @param {Function} callback - Callback function for auth response
 * @returns {Object} - Token client instance
 */
export const initTokenClient = (callback) => {
  if (!window.google) {
    throw new Error('Google Identity Services not loaded');
  }

  // Generate and store CSRF state parameter
  const state = generateStateParameter();
  storeOAuthState(state);

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPES,
    state: state, // CSRF protection
    callback: (response) => {
      // Verify state parameter to prevent CSRF attacks
      if (response.state && !verifyOAuthState(response.state)) {
        logger.error('OAuth state verification failed - possible CSRF attack');
        callback({
          error: 'Security verification failed. Please try again.'
        });
        return;
      }

      if (response.error) {
        logger.error('OAuth error', response.error);
        callback(response);
        return;
      }

      logger.debug('OAuth authentication successful');
      callback(response);
    },
  });

  return tokenClient;
};

/**
 * Get current token client instance
 * @returns {Object|null} - Token client or null
 */
export const getTokenClient = () => tokenClient;

/**
 * Check if Google API is initialized
 * @returns {boolean}
 */
export const isGapiInited = () => gapiInited;

/**
 * Request access token from user
 * Generates new state parameter for each auth request
 */
export const requestAccessToken = () => {
  if (tokenClient) {
    // Generate new state parameter for this auth request
    const state = generateStateParameter();
    storeOAuthState(state);

    tokenClient.requestAccessToken({
      prompt: 'consent',
      state: state  // Include state in request
    });
  } else {
    logger.error('Token client not initialized');
  }
};

/**
 * Revoke access token and sign out user
 */
export const revokeAccessToken = () => {
  try {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        logger.debug('Access token revoked');
      });
      window.gapi.client.setToken('');
      logger.debug('User signed out successfully');
    }
  } catch (error) {
    logger.error('Error revoking access token', error);
  }
};
