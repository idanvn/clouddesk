import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Folder,
  FileCode,
  Presentation,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Star,
  StarOff,
  ExternalLink,
  Copy,
  Info,
} from 'lucide-react';
import { getFileTypeConfig, formatFileSize, formatDate } from '../../utils/theme';

const fileIcons = {
  'application/pdf': FileText,
  'application/vnd.google-apps.document': FileText,
  'application/vnd.google-apps.spreadsheet': FileSpreadsheet,
  'application/vnd.google-apps.presentation': Presentation,
  'application/vnd.google-apps.folder': Folder,
  'image/': FileImage,
  'video/': FileVideo,
  'audio/': FileAudio,
  'text/': FileCode,
  'application/json': FileCode,
  default: File,
};

const getFileIcon = (mimeType) => {
  if (!mimeType) return File;
  for (const [key, icon] of Object.entries(fileIcons)) {
    if (mimeType.startsWith(key) || mimeType === key) return icon;
  }
  return File;
};

export default function FileCard({
  file,
  selected,
  onSelect,
  onOpen,
  onDownload,
  onShare,
  onDelete,
  onToggleStar,
  onContextMenu,
  viewMode = 'grid', // 'grid' | 'list'
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = getFileTypeConfig(file.mimeType);
  const FileIcon = getFileIcon(file.mimeType);
  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

  const handleClick = (e) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      onSelect?.(file, true); // Multi-select
    } else {
      onSelect?.(file, false);
    }
  };

  const handleDoubleClick = () => {
    onOpen?.(file);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu?.(e, file);
  };

  const menuItems = [
    { icon: ExternalLink, label: 'Open', action: () => onOpen?.(file) },
    !isFolder && { icon: Download, label: 'Download', action: () => onDownload?.(file) },
    { icon: Share2, label: 'Share', action: () => onShare?.(file) },
    { icon: Copy, label: 'Copy link', action: () => navigator.clipboard.writeText(file.webViewLink) },
    { icon: file.starred ? StarOff : Star, label: file.starred ? 'Remove star' : 'Add star', action: () => onToggleStar?.(file) },
    { icon: Info, label: 'Details', action: () => {} },
    { type: 'divider' },
    { icon: Trash2, label: 'Delete', action: () => onDelete?.(file), danger: true },
  ].filter(Boolean);

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.04)' }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
          selected
            ? 'bg-blue-50 border-blue-200'
            : 'border-transparent hover:border-gray-100'
        }`}
      >
        {/* Checkbox */}
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onClick={(e) => { e.stopPropagation(); onSelect?.(file, true); }}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: typeConfig.bg }}
        >
          <FileIcon className="w-5 h-5" style={{ color: typeConfig.color }} />
        </div>

        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-sm text-gray-500">
            {formatDate(file.modifiedTime)}
            {file.size && ` • ${formatFileSize(file.size)}`}
          </p>
        </div>

        {/* Star */}
        {file.starred && (
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
        )}

        {/* Actions */}
        <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {!isFolder && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload?.(file); }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onShare?.(file); }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
      className={`relative bg-white rounded-2xl border p-4 cursor-pointer transition-all ${
        selected
          ? 'border-blue-400 ring-2 ring-blue-100 shadow-md'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'
      }`}
    >
      {/* Selection Checkbox */}
      <div
        className={`absolute top-3 left-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          selected
            ? 'bg-blue-500 border-blue-500 opacity-100'
            : isHovered
            ? 'border-gray-300 opacity-100'
            : 'opacity-0'
        }`}
        onClick={(e) => { e.stopPropagation(); onSelect?.(file, true); }}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Star */}
      {file.starred && (
        <div className="absolute top-3 right-3">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      )}

      {/* More Menu */}
      <div
        className={`absolute top-3 right-3 transition-opacity ${
          isHovered && !file.starred ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* File Icon */}
      <div className="flex justify-center mb-4 pt-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: typeConfig.bg }}
        >
          <FileIcon className="w-8 h-8" style={{ color: typeConfig.color }} />
        </div>
      </div>

      {/* File Name */}
      <p className="font-medium text-gray-900 text-center truncate mb-1" title={file.name}>
        {file.name}
      </p>

      {/* File Meta */}
      <p className="text-xs text-gray-500 text-center">
        {typeConfig.label}
        {file.size && ` • ${formatFileSize(file.size)}`}
      </p>

      {/* Hover Actions */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white to-transparent rounded-b-2xl"
        >
          <div className="flex justify-center gap-1">
            {!isFolder && (
              <button
                onClick={(e) => { e.stopPropagation(); onDownload?.(file); }}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onShare?.(file); }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(file); }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Dropdown Menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-12 right-3 w-48 bg-white rounded-xl border border-gray-200 shadow-xl z-10 py-1 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, index) =>
            item.type === 'divider' ? (
              <div key={index} className="h-px bg-gray-100 my-1" />
            ) : (
              <button
                key={index}
                onClick={() => { item.action(); setShowMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
