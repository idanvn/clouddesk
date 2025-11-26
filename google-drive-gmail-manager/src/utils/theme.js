// Design System Constants
export const colors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// File type colors and icons
export const fileTypeConfig = {
  // Documents
  'application/pdf': { color: '#EF4444', bg: '#FEE2E2', label: 'PDF' },
  'application/vnd.google-apps.document': { color: '#3B82F6', bg: '#DBEAFE', label: 'Doc' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { color: '#3B82F6', bg: '#DBEAFE', label: 'Doc' },
  'application/msword': { color: '#3B82F6', bg: '#DBEAFE', label: 'Doc' },

  // Spreadsheets
  'application/vnd.google-apps.spreadsheet': { color: '#10B981', bg: '#D1FAE5', label: 'Sheet' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { color: '#10B981', bg: '#D1FAE5', label: 'Excel' },
  'application/vnd.ms-excel': { color: '#10B981', bg: '#D1FAE5', label: 'Excel' },

  // Presentations
  'application/vnd.google-apps.presentation': { color: '#F59E0B', bg: '#FEF3C7', label: 'Slides' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { color: '#F59E0B', bg: '#FEF3C7', label: 'PPT' },

  // Images
  'image/jpeg': { color: '#8B5CF6', bg: '#EDE9FE', label: 'Image' },
  'image/png': { color: '#8B5CF6', bg: '#EDE9FE', label: 'Image' },
  'image/gif': { color: '#8B5CF6', bg: '#EDE9FE', label: 'GIF' },
  'image/svg+xml': { color: '#8B5CF6', bg: '#EDE9FE', label: 'SVG' },

  // Video
  'video/mp4': { color: '#EC4899', bg: '#FCE7F3', label: 'Video' },
  'video/quicktime': { color: '#EC4899', bg: '#FCE7F3', label: 'Video' },

  // Audio
  'audio/mpeg': { color: '#06B6D4', bg: '#CFFAFE', label: 'Audio' },
  'audio/wav': { color: '#06B6D4', bg: '#CFFAFE', label: 'Audio' },

  // Archives
  'application/zip': { color: '#78716C', bg: '#F5F5F4', label: 'ZIP' },
  'application/x-rar-compressed': { color: '#78716C', bg: '#F5F5F4', label: 'RAR' },

  // Code
  'application/json': { color: '#F59E0B', bg: '#FEF3C7', label: 'JSON' },
  'text/javascript': { color: '#FBBF24', bg: '#FEF3C7', label: 'JS' },
  'text/html': { color: '#F97316', bg: '#FFEDD5', label: 'HTML' },
  'text/css': { color: '#3B82F6', bg: '#DBEAFE', label: 'CSS' },

  // Folders
  'application/vnd.google-apps.folder': { color: '#6B7280', bg: '#F3F4F6', label: 'Folder' },

  // Default
  default: { color: '#6B7280', bg: '#F3F4F6', label: 'File' },
};

export const getFileTypeConfig = (mimeType) => {
  return fileTypeConfig[mimeType] || fileTypeConfig.default;
};

// Animation variants for Framer Motion
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  listItem: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: { duration: 0.2 },
  },
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
    }
    return hours === 1 ? '1h ago' : `${hours}h ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

// Get initials from name/email
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(/[\s@]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Generate avatar color from string
export const getAvatarColor = (str) => {
  if (!str) return colors.primary[500];
  const avatarColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

// Keyboard shortcuts
export const shortcuts = {
  search: { key: 'k', ctrl: true, label: '⌘K' },
  selectAll: { key: 'a', ctrl: true, label: '⌘A' },
  delete: { key: 'Delete', label: 'Del' },
  refresh: { key: 'r', ctrl: true, label: '⌘R' },
  newFolder: { key: 'n', ctrl: true, shift: true, label: '⌘⇧N' },
};
