import { Mail, HardDrive, Loader2, CheckCircle2, Circle } from 'lucide-react';

export default function LoadingScreen({ status = 'Loading...', elapsedTime = 0 }) {
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getProgressSteps = () => {
    const steps = [
      { name: 'Validating credentials', key: 'validating', icon: '🔑' },
      { name: 'Loading Google API', key: 'loading', icon: '📦' },
      { name: 'Initializing client', key: 'initializing', icon: '⚙️' },
      { name: 'Identity services', key: 'identity', icon: '🔐' },
      { name: 'Setting up auth', key: 'auth', icon: '✨' },
      { name: 'Ready!', key: 'ready', icon: '🚀' }
    ];

    const statusLower = status.toLowerCase();
    let currentIndex = steps.findIndex(step => statusLower.includes(step.key));
    if (currentIndex === -1) currentIndex = 0;

    return steps.map((step, index) => ({
      ...step,
      status: index < currentIndex ? 'complete' :
              index === currentIndex ? 'current' :
              'pending'
    }));
  };

  const steps = getProgressSteps();
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progress = (completedCount / steps.length) * 100;
  const showWarning = elapsedTime > 20;
  const showDanger = elapsedTime > 25;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-40"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Logo/Icon Area */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center">
              {/* Rotating ring */}
              <div className="absolute w-28 h-28 border-4 border-transparent border-t-white/30 rounded-full animate-spin"></div>
              <div className="absolute w-24 h-24 border-4 border-transparent border-b-purple-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

              {/* Center icons */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-6 h-6 text-white" />
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mt-6 mb-2">
              Google Manager
            </h1>
            <p className="text-white/60">
              Drive & Gmail Management
            </p>
          </div>

          {/* Status Display */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
                <span className="text-white font-medium">{status}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-mono ${
                showDanger ? 'bg-red-500/20 text-red-300' :
                showWarning ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-white/10 text-white/70'
              }`}>
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-2 mb-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  step.status === 'current' ? 'bg-white/10' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                  step.status === 'current' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-white/5 text-white/30'
                }`}>
                  {step.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : step.status === 'current' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-sm transition-colors ${
                  step.status === 'complete' ? 'text-green-400' :
                  step.status === 'current' ? 'text-white font-medium' :
                  'text-white/40'
                }`}>
                  {step.name}
                </span>
                {step.status === 'current' && (
                  <div className="ml-auto flex gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  showDanger ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                  showWarning ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                }`}
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/50">
              <span>{completedCount} of {steps.length} steps</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Warning Messages */}
          {showWarning && (
            <div className={`rounded-xl p-4 border ${
              showDanger
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              <p className={`text-sm ${showDanger ? 'text-red-300' : 'text-yellow-300'}`}>
                {showDanger ? (
                  <>
                    <strong>Taking longer than expected...</strong><br />
                    Check your credentials and internet connection.
                  </>
                ) : (
                  <>
                    <strong>Almost there...</strong><br />
                    This is taking a bit longer than usual.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Tips - only show when not warning */}
          {!showWarning && (
            <div className="text-center">
              <p className="text-white/40 text-xs">
                Tip: Make sure your .env file has valid Google credentials
              </p>
            </div>
          )}
        </div>

        {/* Decorative bottom glow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-purple-500/20 rounded-full filter blur-2xl"></div>
      </div>
    </div>
  );
}
