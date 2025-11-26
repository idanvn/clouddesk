import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initGoogleApi, initTokenClient, requestAccessToken, revokeAccessToken } from './utils/googleApi';
import { logger } from './utils/security';
import SignIn from './components/SignIn';
import GoogleDrive from './components/GoogleDrive';
import Gmail from './components/Gmail';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import Sidebar from './components/ui/Sidebar';
import { ToastProvider } from './components/ui/Toast';
import { CONFIG } from './config';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('drive');
  const [activeSection, setActiveSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 });
  const timeoutRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Start timer to track loading time
    timerRef.current = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    // Set timeout for initialization (30 seconds)
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setError({
          type: 'timeout',
          message: 'Initialization timed out after 30 seconds',
          details: 'The application took too long to initialize. This could be due to slow internet connection or Google API service issues.'
        });
        setLoading(false);
      }
    }, 30000);

    loadGoogleApi();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const validateCredentials = () => {
    logger.debug('[App] Validating credentials...');

    const clientId = CONFIG.CLIENT_ID;
    const apiKey = CONFIG.API_KEY;

    logger.debug('[App] Client ID exists:', !!clientId);
    logger.debug('[App] API Key exists:', !!apiKey);

    if (!clientId || clientId.includes('YOUR_CLIENT_ID')) {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
    }

    if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
      throw new Error('Google API Key not configured. Please set VITE_GOOGLE_API_KEY in your .env file.');
    }

    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      throw new Error('Invalid Client ID format. It should end with .apps.googleusercontent.com');
    }

    logger.debug('[App] ✓ Credentials validated successfully');
  };

  const loadGoogleApi = async () => {
    try {
      logger.debug('[App] Starting Google API initialization...');

      // Step 1: Validate credentials
      setLoadingStatus('Validating credentials...');
      logger.debug('[App] Step 1: Validating credentials');
      validateCredentials();
      await delay(500);

      // Step 2: Wait for gapi to load
      setLoadingStatus('Loading Google API script...');
      logger.debug('[App] Step 2: Waiting for gapi script to load');
      await waitForGapi();
      logger.debug('[App] ✓ gapi script loaded');
      await delay(500);

      // Step 3: Initialize Google API client
      setLoadingStatus('Initializing Google API client...');
      logger.debug('[App] Step 3: Initializing Google API client');
      await initGoogleApi();
      logger.debug('[App] ✓ Google API client initialized');
      await delay(500);

      // Step 4: Load Google Identity Services
      setLoadingStatus('Loading Google Identity Services...');
      logger.debug('[App] Step 4: Loading Google Identity Services');
      await loadGoogleIdentityServices();
      logger.debug('[App] ✓ Google Identity Services loaded');
      await delay(500);

      // Step 5: Initialize token client
      setLoadingStatus('Setting up authentication...');
      logger.debug('[App] Step 5: Initializing token client');
      initTokenClient((response) => {
        logger.debug('[App] Auth callback received:', response.error ? 'Error' : 'Success');
        if (response.error) {
          logger.error('[App] Auth error', response.error);
          setError({
            type: 'auth',
            message: 'Authentication error',
            details: 'Failed to authenticate with Google. Please try again.'
          });
          setIsSignedIn(false);
          return;
        }
        logger.debug('[App] ✓ User authenticated successfully');
        setIsSignedIn(true);
        getUserEmail();
        getStorageInfo();
      });
      logger.debug('[App] ✓ Token client initialized');
      await delay(500);

      // Step 6: Complete
      setLoadingStatus('Ready!');
      logger.debug('[App] ✓ Initialization complete!');

      // Clear timeout and timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);

      setLoading(false);

    } catch (err) {
      logger.error('[App] Initialization failed', err);

      if (timerRef.current) clearInterval(timerRef.current);

      // Sanitize error message for production
      const safeMessage = err.message || 'Failed to initialize Google API';
      const safeDetails = import.meta.env.DEV
        ? (err.stack || err.toString())
        : 'An error occurred during initialization. Please try again.';

      setError({
        type: 'initialization',
        message: safeMessage,
        details: safeDetails
      });
      setLoading(false);
    }
  };

  const waitForGapi = () => {
    return new Promise((resolve, reject) => {
      logger.debug('[App] Checking if gapi is available...');

      if (window.gapi) {
        logger.debug('[App] gapi already available');
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 100; // 10 seconds

      const checkGapi = setInterval(() => {
        attempts++;
        if (attempts % 20 === 0) {
          logger.debug(`[App] Waiting for gapi... (attempt ${attempts}/${maxAttempts})`);
        }

        if (window.gapi) {
          logger.debug('[App] gapi is now available!');
          clearInterval(checkGapi);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGapi);
          reject(new Error('Google API script (gapi) failed to load. Please check your internet connection and ensure the script is not blocked by browser extensions or firewall.'));
        }
      }, 100);
    });
  };

  const loadGoogleIdentityServices = () => {
    return new Promise((resolve, reject) => {
      logger.debug('[App] Checking if Google Identity Services is available...');

      if (window.google?.accounts?.oauth2) {
        logger.debug('[App] Google Identity Services already loaded');
        resolve();
        return;
      }

      logger.debug('[App] Loading Google Identity Services script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        logger.debug('[App] Google Identity Services script loaded successfully');

        // Wait a bit for the library to initialize
        let attempts = 0;
        const checkGoogle = setInterval(() => {
          attempts++;
          if (window.google?.accounts?.oauth2) {
            clearInterval(checkGoogle);
            resolve();
          } else if (attempts >= 50) { // 5 seconds
            clearInterval(checkGoogle);
            reject(new Error('Google Identity Services loaded but failed to initialize'));
          }
        }, 100);
      };

      script.onerror = () => {
        logger.error('[App] Failed to load Google Identity Services script');
        reject(new Error('Failed to load Google Identity Services. Please check your internet connection.'));
      };

      document.head.appendChild(script);
    });
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getUserEmail = async () => {
    try {
      logger.debug('[App] Fetching user email...');
      const response = await window.gapi.client.gmail.users.getProfile({
        userId: 'me'
      });
      const email = response.result.emailAddress;
      logger.debug('[App] User email retrieved');
      setUserEmail(email);
    } catch (error) {
      logger.error('[App] Error getting user email', error);
    }
  };

  const getStorageInfo = async () => {
    try {
      const response = await window.gapi.client.drive.about.get({
        fields: 'storageQuota'
      });
      const quota = response.result.storageQuota;
      setStorageInfo({
        used: parseInt(quota.usage) || 0,
        total: parseInt(quota.limit) || 15 * 1024 * 1024 * 1024 // 15GB default
      });
    } catch (error) {
      logger.error('[App] Error getting storage info', error);
    }
  };

  const handleSignIn = () => {
    logger.debug('[App] User clicked Sign In');
    requestAccessToken();
  };

  const handleSignOut = () => {
    logger.debug('[App] User signing out');
    revokeAccessToken();
    setIsSignedIn(false);
    setUserEmail('');
  };

  const handleRetry = () => {
    logger.debug('[App] User requested retry');
    setLoading(true);
    setError(null);
    setLoadingStatus('Initializing...');
    setLoadingTime(0);

    // Restart timer
    timerRef.current = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setError({
          type: 'timeout',
          message: 'Initialization timed out after 30 seconds',
          details: 'The application took too long to initialize.'
        });
        setLoading(false);
      }
    }, 30000);

    loadGoogleApi();
  };

  // Loading screen
  if (loading) {
    return (
      <LoadingScreen
        status={loadingStatus}
        elapsedTime={loadingTime}
      />
    );
  }

  // Error screen
  if (error) {
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }

  // Sign in screen
  if (!isSignedIn) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  // Main app with new layout
  return (
    <ToastProvider>
      <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSignOut={handleSignOut}
          userEmail={userEmail}
          storageUsed={storageInfo.used}
          storageTotal={storageInfo.total}
        />

        {/* Main Content */}
        <main
          className="transition-all duration-300 ease-in-out"
          style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-screen"
            >
              {activeTab === 'drive' ? (
                <GoogleDrive
                  activeSection={activeSection}
                  storageInfo={storageInfo}
                />
              ) : (
                <Gmail
                  activeSection={activeSection}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
