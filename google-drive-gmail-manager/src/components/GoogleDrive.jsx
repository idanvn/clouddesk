import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Upload,
  FolderPlus,
  Grid3X3,
  List,
  RefreshCw,
  Download,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { searchFiles, deleteFiles, shareFile, downloadFile } from '../utils/driveApi';
import { validateEmail, sanitizeEmail, isValidGoogleUrl } from '../utils/security';
import { useToast } from './ui/Toast';
import SearchBar from './ui/SearchBar';
import StatsCards from './ui/StatsCards';
import FileCard from './ui/FileCard';
import ContextMenu from './ui/ContextMenu';
import EmptyState from './ui/EmptyState';
import { FileGridSkeleton, FileListSkeletonGroup } from './ui/Skeleton';
import ConfirmDialog from './ConfirmDialog';

export default function GoogleDrive({ activeSection, storageInfo }) {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, file: null });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('reader');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    folders: 0,
    storageUsed: 0,
    storageTotal: 0,
    recent: 0,
  });

  // Fetch files
  const fetchFiles = useCallback(async (query = '') => {
    setLoading(true);
    try {
      let searchQ = query;

      // Apply section filter
      if (activeSection === 'starred') {
        searchQ = searchQ ? `${searchQ} and starred = true` : 'starred = true';
      } else if (activeSection === 'trash') {
        searchQ = 'trashed = true';
      }

      // Apply type filter
      if (filters.type) {
        searchQ = searchQ
          ? `${searchQ} and mimeType contains '${filters.type}'`
          : `mimeType contains '${filters.type}'`;
      }

      const result = await searchFiles(searchQ);
      setFiles(result);

      // Calculate stats
      const folders = result.filter(f => f.mimeType === 'application/vnd.google-apps.folder').length;
      const totalSize = result.reduce((acc, f) => acc + (parseInt(f.size) || 0), 0);
      const recentFiles = result.filter(f => {
        const modified = new Date(f.modifiedTime);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return modified > weekAgo;
      }).length;

      setStats({
        totalFiles: result.length,
        folders,
        storageUsed: storageInfo?.used || totalSize,
        storageTotal: storageInfo?.total || 15 * 1024 * 1024 * 1024,
        recent: recentFiles,
      });

    } catch (error) {
      toast.error('Error', 'Failed to load files');
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [activeSection, filters, storageInfo, toast]);

  useEffect(() => {
    fetchFiles(searchQuery);
  }, [fetchFiles, searchQuery]);

  // Refresh files
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFiles(searchQuery);
    setIsRefreshing(false);
    toast.success('Refreshed', 'Files updated successfully');
  };

  // Search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Select file
  const handleSelectFile = (file, multiSelect) => {
    if (multiSelect) {
      setSelectedFiles(prev => {
        const isSelected = prev.some(f => f.id === file.id);
        if (isSelected) {
          return prev.filter(f => f.id !== file.id);
        }
        return [...prev, file];
      });
    } else {
      setSelectedFiles([file]);
    }
  };

  // Open file (with URL validation for security)
  const handleOpenFile = (file) => {
    if (file.webViewLink && isValidGoogleUrl(file.webViewLink)) {
      window.open(file.webViewLink, '_blank', 'noopener,noreferrer');
    } else if (file.webViewLink) {
      toast.error('Security Warning', 'Invalid file URL detected');
    }
  };

  // Download file
  const handleDownloadFile = async (file) => {
    try {
      await downloadFile(file.id, file.name);
      toast.success('Downloaded', `${file.name} downloaded successfully`);
    } catch (error) {
      toast.error('Error', 'Failed to download file');
    }
  };

  // Share file
  const handleShareFile = (file) => {
    setSelectedFiles([file]);
    setShowShareDialog(true);
  };

  const confirmShare = async () => {
    if (!shareEmail) {
      toast.warning('Warning', 'Please enter an email address');
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(shareEmail);
    if (emailValidation === false) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (typeof emailValidation === 'object' && emailValidation.suggestion) {
      toast.warning('Did you mean?', `Did you mean ${emailValidation.suggestion}?`);
      return;
    }

    const sanitizedEmail = sanitizeEmail(shareEmail);

    try {
      for (const file of selectedFiles) {
        await shareFile(file.id, sanitizedEmail, shareRole);
      }
      toast.success('Shared', `Successfully shared with ${sanitizedEmail}`);
      setShowShareDialog(false);
      setShareEmail('');
    } catch (error) {
      toast.error('Error', 'Failed to share file');
    }
  };

  // Delete files
  const handleDeleteFile = (file) => {
    setSelectedFiles([file]);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const fileIds = selectedFiles.map(f => f.id);
      await deleteFiles(fileIds);
      toast.success('Deleted', `${selectedFiles.length} item(s) deleted`);
      setShowDeleteDialog(false);
      setSelectedFiles([]);
      fetchFiles(searchQuery);
    } catch (error) {
      toast.error('Error', 'Failed to delete files');
    }
  };

  // Toggle star
  const handleToggleStar = async (file) => {
    try {
      await window.gapi.client.drive.files.update({
        fileId: file.id,
        resource: { starred: !file.starred }
      });
      toast.success(file.starred ? 'Unstarred' : 'Starred', file.name);
      fetchFiles(searchQuery);
    } catch (error) {
      toast.error('Error', 'Failed to update file');
    }
  };

  // Context menu
  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      file,
    });
  };

  const contextMenuItems = contextMenu.file ? [
    { icon: Share2, label: 'Share', action: () => handleShareFile(contextMenu.file) },
    { icon: Download, label: 'Download', action: () => handleDownloadFile(contextMenu.file) },
    { type: 'divider' },
    { icon: Trash2, label: 'Delete', action: () => handleDeleteFile(contextMenu.file), danger: true },
  ] : [];

  // Select all
  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...files]);
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedFiles.length > 0) {
      setShowDeleteDialog(true);
    }
  };

  const handleBulkShare = () => {
    if (selectedFiles.length > 0) {
      setShowShareDialog(true);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {activeSection === 'all' && 'My Drive'}
          {activeSection === 'recent' && 'Recent Files'}
          {activeSection === 'starred' && 'Starred'}
          {activeSection === 'trash' && 'Trash'}
        </motion.h1>
        <p className="text-gray-500">
          {activeSection === 'all' && 'All your files and folders'}
          {activeSection === 'recent' && 'Files you recently opened'}
          {activeSection === 'starred' && 'Your important files'}
          {activeSection === 'trash' && 'Deleted files'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCards stats={stats} type="drive" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Search files..."
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* New Button */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-colors">
              <Plus className="w-5 h-5" />
              <span>New</span>
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFiles([])}
                className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-blue-700 font-medium">
                {selectedFiles.length} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedFiles.length === files.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkShare}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files Grid/List */}
      {loading ? (
        viewMode === 'grid' ? (
          <FileGridSkeleton count={12} />
        ) : (
          <FileListSkeletonGroup count={8} />
        )
      ) : files.length === 0 ? (
        <EmptyState
          type={searchQuery ? 'no-results' : 'no-files'}
          onAction={() => searchQuery ? setSearchQuery('') : null}
        />
      ) : viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
        >
          <AnimatePresence>
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                selected={selectedFiles.some(f => f.id === file.id)}
                onSelect={handleSelectFile}
                onOpen={handleOpenFile}
                onDownload={handleDownloadFile}
                onShare={handleShareFile}
                onDelete={handleDeleteFile}
                onToggleStar={handleToggleStar}
                onContextMenu={handleContextMenu}
                viewMode="grid"
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <AnimatePresence>
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                selected={selectedFiles.some(f => f.id === file.id)}
                onSelect={handleSelectFile}
                onOpen={handleOpenFile}
                onDownload={handleDownloadFile}
                onShare={handleShareFile}
                onDelete={handleDeleteFile}
                onToggleStar={handleToggleStar}
                onContextMenu={handleContextMenu}
                viewMode="list"
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Files"
        message={`Are you sure you want to delete ${selectedFiles.length} item(s)? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {/* Share Dialog */}
      <AnimatePresence>
        {showShareDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share Files</h3>
              <p className="text-gray-500 mb-6">
                Share {selectedFiles.length} item(s) with others
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permission
                  </label>
                  <select
                    value={shareRole}
                    onChange={(e) => setShareRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="reader">Viewer</option>
                    <option value="commenter">Commenter</option>
                    <option value="writer">Editor</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmShare}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                >
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
