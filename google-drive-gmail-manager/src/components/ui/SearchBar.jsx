import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Filter,
  Calendar,
  FileType,
  User,
  ChevronDown,
  Command,
} from 'lucide-react';

const fileTypeFilters = [
  { value: '', label: 'All Types' },
  { value: 'application/pdf', label: 'PDF' },
  { value: 'application/vnd.google-apps.document', label: 'Google Docs' },
  { value: 'application/vnd.google-apps.spreadsheet', label: 'Google Sheets' },
  { value: 'application/vnd.google-apps.presentation', label: 'Google Slides' },
  { value: 'image/', label: 'Images' },
  { value: 'video/', label: 'Videos' },
  { value: 'application/vnd.google-apps.folder', label: 'Folders' },
];

const dateFilters = [
  { value: '', label: 'Any Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  filters = {},
  onFilterChange,
  showFilters = true,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const filterRef = useRef(null);

  // Keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-2xl">
      <div
        className={`relative flex items-center bg-white border rounded-xl transition-all duration-200 ${
          isFocused
            ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg'
            : 'border-gray-200 hover:border-gray-300 shadow-sm'
        }`}
      >
        <Search className="w-5 h-5 text-gray-400 ml-4" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-3 py-3 bg-transparent outline-none text-gray-900 placeholder-gray-400"
        />

        {/* Keyboard shortcut hint */}
        {!isFocused && !value && (
          <div className="hidden sm:flex items-center gap-1 mr-3 text-gray-400">
            <Command className="w-3.5 h-3.5" />
            <span className="text-xs">K</span>
          </div>
        )}

        {/* Clear button */}
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 mr-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}

        {/* Filter button */}
        {showFilters && (
          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 mr-2 rounded-lg text-sm font-medium transition-colors ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-4"
                >
                  <div className="space-y-4">
                    {/* File Type Filter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileType className="w-4 h-4" />
                        File Type
                      </label>
                      <select
                        value={filters.type || ''}
                        onChange={(e) => onFilterChange?.({ ...filters, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        {fileTypeFilters.map((filter) => (
                          <option key={filter.value} value={filter.value}>
                            {filter.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        Modified Date
                      </label>
                      <select
                        value={filters.date || ''}
                        onChange={(e) => onFilterChange?.({ ...filters, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        {dateFilters.map((filter) => (
                          <option key={filter.value} value={filter.value}>
                            {filter.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Owner Filter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Owner
                      </label>
                      <select
                        value={filters.owner || ''}
                        onChange={(e) => onFilterChange?.({ ...filters, owner: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="">Anyone</option>
                        <option value="me">Owned by me</option>
                        <option value="others">Not owned by me</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onFilterChange?.({})}
                        className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </form>
  );
}
