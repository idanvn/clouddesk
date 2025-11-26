import { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Settings,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Key,
  Shield,
  Wifi,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function ErrorScreen({ error, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const isCredentialError = error?.message?.toLowerCase().includes('client id') ||
                           error?.message?.toLowerCase().includes('api key') ||
                           error?.message?.toLowerCase().includes('configured');

  const isTimeoutError = error?.type === 'timeout';

  const getErrorIcon = () => {
    if (isCredentialError) return <Key className="w-8 h-8" />;
    if (isTimeoutError) return <Wifi className="w-8 h-8" />;
    return <AlertTriangle className="w-8 h-8" />;
  };

  const getErrorTitle = () => {
    if (isCredentialError) return 'Setup Required';
    if (isTimeoutError) return 'Connection Timeout';
    return 'Initialization Failed';
  };

  const getErrorSubtitle = () => {
    if (isCredentialError) return "Let's get your Google API credentials configured";
    if (isTimeoutError) return "The connection took too long to establish";
    return "Something went wrong during initialization";
  };

  const setupSteps = [
    {
      title: 'Create Google Cloud Project',
      description: 'Go to Google Cloud Console and create a new project',
      link: 'https://console.cloud.google.com/projectcreate',
      linkText: 'Open Cloud Console'
    },
    {
      title: 'Enable APIs',
      description: 'Enable Google Drive API and Gmail API for your project',
      link: 'https://console.cloud.google.com/apis/library',
      linkText: 'Go to API Library'
    },
    {
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 Client ID (Web application type)',
      link: 'https://console.cloud.google.com/apis/credentials',
      linkText: 'Create Credentials',
      note: 'Add http://localhost:5173 to Authorized JavaScript origins'
    },
    {
      title: 'Create API Key',
      description: 'Create an API key and restrict it to Drive & Gmail APIs',
      link: 'https://console.cloud.google.com/apis/credentials',
      linkText: 'Create API Key'
    },
    {
      title: 'Configure .env File',
      description: 'Add your credentials to the .env file',
      code: `VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSy...`
    },
    {
      title: 'Restart Server',
      description: 'Stop and restart the development server',
      code: 'npm run dev'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 px-8 py-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl text-white">
                {getErrorIcon()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {getErrorTitle()}
                </h1>
                <p className="text-white/70 mt-1">
                  {getErrorSubtitle()}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="px-8 py-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 font-medium">{error?.message}</p>
                  {error?.details && (
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center gap-1 text-red-300/70 text-sm mt-2 hover:text-red-300 transition-colors"
                    >
                      {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {showDetails ? 'Hide' : 'Show'} technical details
                    </button>
                  )}
                  {showDetails && error?.details && (
                    <pre className="mt-3 text-xs text-red-300/60 bg-black/20 rounded-lg p-3 overflow-x-auto">
                      {error.details}
                    </pre>
                  )}
                </div>
              </div>
            </div>

            {/* Setup Guide for Credential Errors */}
            {isCredentialError && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-white">Quick Setup Guide</h2>
                </div>

                <div className="space-y-3">
                  {setupSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border transition-all duration-300 cursor-pointer ${
                        activeStep === index
                          ? 'bg-white/10 border-purple-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => setActiveStep(activeStep === index ? -1 : index)}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          activeStep === index
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/70'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{step.title}</h3>
                        </div>
                        {activeStep === index ? (
                          <ChevronUp className="w-5 h-5 text-white/50" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/50" />
                        )}
                      </div>

                      {activeStep === index && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="pl-11">
                            <p className="text-white/70 text-sm mb-3">{step.description}</p>

                            {step.link && (
                              <a
                                href={step.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {step.linkText}
                              </a>
                            )}

                            {step.note && (
                              <p className="mt-3 text-yellow-400/80 text-xs flex items-start gap-2">
                                <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                {step.note}
                              </p>
                            )}

                            {step.code && (
                              <div className="mt-3 relative">
                                <pre className="bg-black/30 rounded-lg p-3 text-sm text-green-400 overflow-x-auto">
                                  {step.code}
                                </pre>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(step.code, index);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                  {copiedCommand === index ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-white/50" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Troubleshooting for other errors */}
            {!isCredentialError && (
              <div className="bg-white/5 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Troubleshooting</h2>
                </div>
                <ul className="space-y-3">
                  {[
                    'Check your internet connection',
                    'Disable browser extensions that might block Google',
                    'Try using incognito/private browsing mode',
                    'Clear browser cache and cookies',
                    'Check browser console (F12) for detailed errors'
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onRetry}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20"
              >
                Reload Page
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">
                Need help? Check browser console (F12)
              </span>
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Google Cloud Console
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
