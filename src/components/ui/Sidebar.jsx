import { motion } from 'framer-motion';
import {
  HardDrive,
  Mail,
  Settings,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Star,
  Clock,
  Trash2,
  Send,
  Inbox,
  Archive,
  Tag,
} from 'lucide-react';

const driveNavItems = [
  { id: 'all', label: 'All Files', icon: FolderOpen },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const gmailNavItems = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'labels', label: 'Labels', icon: Tag },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeSection,
  setActiveSection,
  collapsed,
  setCollapsed,
  darkMode,
  setDarkMode,
  onSignOut,
  userEmail,
  storageUsed,
  storageTotal,
}) {
  const navItems = activeTab === 'drive' ? driveNavItems : gmailNavItems;
  const storagePercent = storageTotal ? Math.round((storageUsed / storageTotal) * 100) : 0;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 shadow-sm"
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="font-semibold text-gray-900 whitespace-nowrap">Google Manager</span>
        </motion.div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Tabs */}
      <div className="p-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'drive'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            {!collapsed && <span>Drive</span>}
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'gmail'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            {!collapsed && <span>Gmail</span>}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-500' : ''}`} />
                {!collapsed && (
                  <motion.span
                    initial={false}
                    animate={{ opacity: collapsed ? 0 : 1 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Storage Usage (Drive only) */}
      {activeTab === 'drive' && !collapsed && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Storage</div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${storagePercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                storagePercent > 90
                  ? 'bg-red-500'
                  : storagePercent > 70
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {storagePercent}% used
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Settings */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <Settings className="w-5 h-5" />
          {!collapsed && <span>Settings</span>}
        </button>

        {/* User & Sign Out */}
        <div className="pt-2 border-t border-gray-100 mt-2">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          {!collapsed && userEmail && (
            <p className="px-3 py-2 text-xs text-gray-400 truncate">{userEmail}</p>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
