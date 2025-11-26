import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  StarOff,
  Archive,
  Trash2,
  MoreVertical,
  Paperclip,
  Reply,
  Forward,
  Tag,
  MailOpen,
  Mail,
} from 'lucide-react';
import { getInitials, getAvatarColor, formatDate } from '../../utils/theme';

export default function EmailCard({
  email,
  selected,
  onSelect,
  onOpen,
  onArchive,
  onDelete,
  onToggleStar,
  onToggleRead,
  onLabel,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const isUnread = email.labelIds?.includes('UNREAD');
  const isStarred = email.labelIds?.includes('STARRED');
  const hasAttachment = email.payload?.parts?.some(part => part.filename && part.filename.length > 0);

  // Extract email header info
  const headers = email.payload?.headers || [];
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = getHeader('From');
  const subject = getHeader('Subject') || '(No Subject)';
  const date = getHeader('Date');

  // Parse sender name and email
  const senderMatch = from.match(/^(?:"?([^"<]+)"?\s*)?<?([^>]+)>?$/);
  const senderName = senderMatch?.[1]?.trim() || senderMatch?.[2]?.split('@')[0] || from;
  const senderEmail = senderMatch?.[2] || from;

  // Get snippet (preview text)
  const snippet = email.snippet || '';

  const handleClick = (e) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      onSelect?.(email, true);
    } else {
      onSelect?.(email, false);
    }
  };

  const handleDoubleClick = () => {
    onOpen?.(email);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{ backgroundColor: isUnread ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)' }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-start gap-4 px-4 py-4 cursor-pointer transition-all border-b border-gray-100 last:border-b-0 ${
        selected
          ? 'bg-blue-50'
          : isUnread
          ? 'bg-blue-50/50'
          : 'bg-white'
      }`}
    >
      {/* Checkbox */}
      <div className="flex items-center gap-3 flex-shrink-0 pt-1">
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onClick={(e) => { e.stopPropagation(); onSelect?.(email, true); }}
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
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar?.(email); }}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isStarred ? (
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ) : (
            <Star className={`w-5 h-5 ${isHovered ? 'text-gray-400' : 'text-gray-300'}`} />
          )}
        </button>
      </div>

      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
        style={{ backgroundColor: getAvatarColor(senderEmail) }}
      >
        {getInitials(senderName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
            {senderName}
          </span>
          {hasAttachment && (
            <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </div>
        <p className={`truncate mb-1 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
          {subject}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {snippet}
        </p>

        {/* Labels */}
        {email.labelIds && email.labelIds.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {email.labelIds
              .filter(id => !['INBOX', 'UNREAD', 'STARRED', 'IMPORTANT', 'SENT', 'DRAFT'].includes(id))
              .slice(0, 3)
              .map((labelId) => (
                <span
                  key={labelId}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                >
                  {labelId.replace('Label_', '').replace(/_/g, ' ')}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Right Side - Date & Actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className={`text-sm ${isUnread ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
          {formatDate(date)}
        </span>

        {/* Hover Actions */}
        <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onArchive?.(email); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(email); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleRead?.(email); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title={isUnread ? 'Mark as read' : 'Mark as unread'}
          >
            {isUnread ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onLabel?.(email); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Labels"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}
    </motion.div>
  );
}
