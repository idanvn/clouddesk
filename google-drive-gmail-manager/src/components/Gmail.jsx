import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Archive,
  Trash2,
  Tag,
  Plus,
  X,
  Star,
  Mail,
  MailOpen,
  Search,
} from 'lucide-react';
import {
  searchEmails,
  listLabels,
  createLabel,
  deleteLabel,
  deleteSpamEmails,
  deleteOldEmails,
} from '../utils/gmailApi';
import { sanitizeEmailId } from '../utils/security';
import { useToast } from './ui/Toast';
import SearchBar from './ui/SearchBar';
import StatsCards from './ui/StatsCards';
import EmailCard from './ui/EmailCard';
import EmptyState from './ui/EmptyState';
import { EmailListSkeleton } from './ui/Skeleton';
import ConfirmDialog from './ConfirmDialog';

export default function Gmail({ activeSection }) {
  const toast = useToast();
  const [emails, setEmails] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [stats, setStats] = useState({
    totalEmails: 0,
    unread: 0,
    starred: 0,
    labels: 0,
  });

  // Fetch emails
  const fetchEmails = useCallback(async (query = '') => {
    setLoading(true);
    try {
      let searchQ = query;

      // Apply section filter
      if (activeSection === 'inbox') {
        searchQ = searchQ ? `${searchQ} in:inbox` : 'in:inbox';
      } else if (activeSection === 'sent') {
        searchQ = searchQ ? `${searchQ} in:sent` : 'in:sent';
      } else if (activeSection === 'starred') {
        searchQ = searchQ ? `${searchQ} is:starred` : 'is:starred';
      } else if (activeSection === 'archive') {
        searchQ = searchQ ? `${searchQ} -in:inbox -in:trash` : '-in:inbox -in:trash';
      } else if (activeSection === 'trash') {
        searchQ = searchQ ? `${searchQ} in:trash` : 'in:trash';
      }

      const result = await searchEmails(searchQ || 'in:inbox');
      setEmails(result);

      // Calculate stats
      const unreadCount = result.filter(e => e.labelIds?.includes('UNREAD')).length;
      const starredCount = result.filter(e => e.labelIds?.includes('STARRED')).length;

      setStats(prev => ({
        ...prev,
        totalEmails: result.length,
        unread: unreadCount,
        starred: starredCount,
      }));

    } catch (error) {
      toast.error('Error', 'Failed to load emails');
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  }, [activeSection, toast]);

  // Fetch labels
  const fetchLabels = useCallback(async () => {
    try {
      const result = await listLabels();
      setLabels(result);
      setStats(prev => ({
        ...prev,
        labels: result.filter(l => l.type === 'user').length,
      }));
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  }, []);

  useEffect(() => {
    fetchEmails(searchQuery);
    fetchLabels();
  }, [fetchEmails, fetchLabels, searchQuery]);

  // Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEmails(searchQuery);
    setIsRefreshing(false);
    toast.success('Refreshed', 'Emails updated successfully');
  };

  // Search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Select email
  const handleSelectEmail = (email, multiSelect) => {
    if (multiSelect) {
      setSelectedEmails(prev => {
        const isSelected = prev.some(e => e.id === email.id);
        if (isSelected) {
          return prev.filter(e => e.id !== email.id);
        }
        return [...prev, email];
      });
    } else {
      setSelectedEmails([email]);
    }
  };

  // Open email (with ID validation for security)
  const handleOpenEmail = (email) => {
    const sanitizedId = sanitizeEmailId(email.id);
    if (sanitizedId) {
      window.open(`https://mail.google.com/mail/u/0/#inbox/${sanitizedId}`, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Error', 'Invalid email ID');
    }
  };

  // Archive email
  const handleArchiveEmail = async (email) => {
    try {
      await window.gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id: email.id,
        resource: {
          removeLabelIds: ['INBOX']
        }
      });
      toast.success('Archived', 'Email archived successfully');
      fetchEmails(searchQuery);
    } catch (error) {
      toast.error('Error', 'Failed to archive email');
    }
  };

  // Delete email
  const handleDeleteEmail = (email) => {
    setSelectedEmails([email]);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      for (const email of selectedEmails) {
        await window.gapi.client.gmail.users.messages.trash({
          userId: 'me',
          id: email.id
        });
      }
      toast.success('Deleted', `${selectedEmails.length} email(s) deleted`);
      setShowDeleteDialog(false);
      setSelectedEmails([]);
      fetchEmails(searchQuery);
    } catch (error) {
      toast.error('Error', 'Failed to delete emails');
    }
  };

  // Toggle star
  const handleToggleStar = async (email) => {
    try {
      const isStarred = email.labelIds?.includes('STARRED');
      await window.gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id: email.id,
        resource: isStarred
          ? { removeLabelIds: ['STARRED'] }
          : { addLabelIds: ['STARRED'] }
      });
      toast.success(isStarred ? 'Unstarred' : 'Starred', 'Email updated');
      fetchEmails(searchQuery);
    } catch (error) {
      toast.error('Error', 'Failed to update email');
    }
  };

  // Toggle read
  const handleToggleRead = async (email) => {
    try {
      const isUnread = email.labelIds?.includes('UNREAD');
      await window.gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id: email.id,
        resource: isUnread
          ? { removeLabelIds: ['UNREAD'] }
          : { addLabelIds: ['UNREAD'] }
      });
      toast.success(isUnread ? 'Marked as read' : 'Marked as unread', '');
      fetchEmails(searchQuery);
    } catch (error) {
      toast.error('Error', 'Failed to update email');
    }
  };

  // Create label
  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      toast.warning('Warning', 'Please enter a label name');
      return;
    }

    try {
      await createLabel(newLabelName.trim());
      toast.success('Created', `Label "${newLabelName}" created`);
      setNewLabelName('');
      setShowLabelDialog(false);
      fetchLabels();
    } catch (error) {
      toast.error('Error', 'Failed to create label');
    }
  };

  // Delete spam
  const handleDeleteSpam = async () => {
    try {
      const result = await deleteSpamEmails();
      toast.success('Deleted', `${result.deleted} spam emails deleted`);
      fetchEmails(searchQuery);
    } catch (error) {
      toast.error('Error', 'Failed to delete spam');
    }
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails([...emails]);
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedEmails.length > 0) {
      setShowDeleteDialog(true);
    }
  };

  // Bulk archive
  const handleBulkArchive = async () => {
    if (selectedEmails.length === 0) return;

    try {
      for (const email of selectedEmails) {
        await window.gapi.client.gmail.users.messages.modify({
          userId: 'me',
          id: email.id,
          resource: { removeLabelIds: ['INBOX'] }
        });
      }
      toast.success('Archived', `${selectedEmails.length} email(s) archived`);
      setSelectedEmails([]);
      fetchEmails(searchQuery);
    } catch (error) {
      toast.error('Error', 'Failed to archive emails');
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
          {activeSection === 'inbox' && 'Inbox'}
          {activeSection === 'sent' && 'Sent'}
          {activeSection === 'starred' && 'Starred'}
          {activeSection === 'archive' && 'Archive'}
          {activeSection === 'labels' && 'Labels'}
          {activeSection === 'trash' && 'Trash'}
        </motion.h1>
        <p className="text-gray-500">
          {activeSection === 'inbox' && 'Your incoming emails'}
          {activeSection === 'sent' && 'Emails you sent'}
          {activeSection === 'starred' && 'Your important emails'}
          {activeSection === 'archive' && 'Archived emails'}
          {activeSection === 'labels' && 'Manage your labels'}
          {activeSection === 'trash' && 'Deleted emails'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCards stats={stats} type="gmail" />
      </div>

      {/* Labels Section (when on labels tab) */}
      {activeSection === 'labels' ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Labels</h2>
            <button
              onClick={() => setShowLabelDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Label
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {labels
              .filter(l => l.type === 'user')
              .map((label) => (
                <motion.div
                  key={label.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{label.name}</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await deleteLabel(label.id);
                        toast.success('Deleted', `Label "${label.name}" deleted`);
                        fetchLabels();
                      } catch (e) {
                        toast.error('Error', 'Failed to delete label');
                      }
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
          </div>

          {labels.filter(l => l.type === 'user').length === 0 && (
            <EmptyState
              type="no-results"
              title="No labels yet"
              description="Create labels to organize your emails"
              action="Create Label"
              onAction={() => setShowLabelDialog(true)}
            />
          )}
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search emails..."
              showFilters={false}
            />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Delete Spam */}
              <button
                onClick={handleDeleteSpam}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Spam</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedEmails.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedEmails([])}
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="text-blue-700 font-medium">
                    {selectedEmails.length} selected
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedEmails.length === emails.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkArchive}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
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

          {/* Email List */}
          {loading ? (
            <EmailListSkeleton count={8} />
          ) : emails.length === 0 ? (
            <EmptyState
              type={searchQuery ? 'no-results' : 'no-emails'}
              onAction={() => searchQuery ? setSearchQuery('') : null}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <AnimatePresence>
                {emails.map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    selected={selectedEmails.some(e => e.id === email.id)}
                    onSelect={handleSelectEmail}
                    onOpen={handleOpenEmail}
                    onArchive={handleArchiveEmail}
                    onDelete={handleDeleteEmail}
                    onToggleStar={handleToggleStar}
                    onToggleRead={handleToggleRead}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Emails"
        message={`Are you sure you want to delete ${selectedEmails.length} email(s)? They will be moved to trash.`}
        confirmText="Delete"
        type="danger"
      />

      {/* Create Label Dialog */}
      <AnimatePresence>
        {showLabelDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLabelDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create Label</h3>
              <p className="text-gray-500 mb-6">
                Create a new label to organize your emails
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label name
                </label>
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Enter label name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLabelDialog(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLabel}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
