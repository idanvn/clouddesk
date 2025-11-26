import { LogOut, HardDrive, Mail } from 'lucide-react';

export default function Header({ isSignedIn, onSignOut, userEmail }) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-blue-600" />
            <Mail className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Google Drive & Gmail Manager
            </h1>
          </div>
          {isSignedIn && (
            <div className="flex items-center gap-4">
              {userEmail && (
                <span className="text-sm text-gray-600 hidden sm:block">{userEmail}</span>
              )}
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
