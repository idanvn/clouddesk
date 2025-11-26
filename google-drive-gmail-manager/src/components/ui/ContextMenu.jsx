import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContextMenu({
  x,
  y,
  items,
  onClose,
  isOpen,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current && isOpen) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menu.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menu.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-50 min-w-[200px] bg-white rounded-xl border border-gray-200 shadow-xl py-1.5 overflow-hidden"
          style={{ left: x, top: y }}
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={index} className="h-px bg-gray-100 my-1.5" />;
            }

            if (item.type === 'label') {
              return (
                <div key={index} className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon;

            return (
              <button
                key={index}
                onClick={() => {
                  item.action?.();
                  onClose();
                }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  item.disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
