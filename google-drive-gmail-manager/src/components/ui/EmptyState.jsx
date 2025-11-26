import { motion } from 'framer-motion';
import {
  FolderOpen,
  Mail,
  Search,
  FileX,
  Inbox,
  Star,
  Trash2,
  Clock,
  Upload,
} from 'lucide-react';

const illustrations = {
  'no-files': {
    icon: FolderOpen,
    title: 'No files yet',
    description: 'Upload files or create folders to get started',
    action: 'Upload Files',
    color: 'blue',
  },
  'no-emails': {
    icon: Inbox,
    title: 'Your inbox is empty',
    description: "You're all caught up! No emails to show here.",
    color: 'green',
  },
  'no-results': {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters',
    action: 'Clear Search',
    color: 'gray',
  },
  'no-starred': {
    icon: Star,
    title: 'No starred items',
    description: 'Star items to find them quickly later',
    color: 'yellow',
  },
  'no-recent': {
    icon: Clock,
    title: 'No recent files',
    description: 'Files you open will appear here',
    color: 'purple',
  },
  'empty-trash': {
    icon: Trash2,
    title: 'Trash is empty',
    description: 'Deleted items will appear here',
    color: 'gray',
  },
  'error': {
    icon: FileX,
    title: 'Something went wrong',
    description: 'We had trouble loading your data',
    action: 'Try Again',
    color: 'red',
  },
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-500',
    button: 'bg-green-500 hover:bg-green-600',
  },
  gray: {
    bg: 'bg-gray-100',
    icon: 'text-gray-400',
    button: 'bg-gray-500 hover:bg-gray-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-500',
    button: 'bg-yellow-500 hover:bg-yellow-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-500',
    button: 'bg-purple-500 hover:bg-purple-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-500',
    button: 'bg-red-500 hover:bg-red-600',
  },
};

export default function EmptyState({
  type = 'no-files',
  title,
  description,
  action,
  onAction,
  icon: CustomIcon,
}) {
  const config = illustrations[type] || illustrations['no-files'];
  const Icon = CustomIcon || config.icon;
  const colors = colorClasses[config.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Animated Icon Container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`w-24 h-24 ${colors.bg} rounded-3xl flex items-center justify-center mb-6`}
      >
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon className={`w-12 h-12 ${colors.icon}`} />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 mb-2 text-center"
      >
        {title || config.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 text-center max-w-sm mb-6"
      >
        {description || config.description}
      </motion.p>

      {/* Action Button */}
      {(action || config.action) && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className={`px-6 py-3 ${colors.button} text-white font-medium rounded-xl shadow-lg shadow-${config.color}-500/25 transition-colors flex items-center gap-2`}
        >
          {type === 'no-files' && <Upload className="w-5 h-5" />}
          {action || config.action}
        </motion.button>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute top-1/4 left-1/4 w-32 h-32 ${colors.bg} rounded-full opacity-30 blur-3xl`}
        />
        <motion.div
          animate={{
            x: [0, -10, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute bottom-1/4 right-1/4 w-40 h-40 ${colors.bg} rounded-full opacity-30 blur-3xl`}
        />
      </div>
    </motion.div>
  );
}
