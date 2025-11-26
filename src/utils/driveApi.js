import {
  sanitizeDriveQuery,
  sanitizeFilename,
  logger,
  getUserFriendlyError,
  driveRateLimiter
} from './security';

const MIME_TYPES = {
  documents: [
    'application/vnd.google-apps.document',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  spreadsheets: [
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  videos: [
    'video/mp4',
    'video/x-msvideo'
  ]
};

/**
 * Search files in Google Drive
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of files
 */
export const searchFiles = async (query = '') => {
  // Rate limiting
  if (!driveRateLimiter.isAllowed('search')) {
    throw new Error('Too many search requests. Please wait a moment.');
  }

  try {
    // Sanitize query to prevent injection
    const sanitizedQuery = sanitizeDriveQuery(query);

    logger.debug('Searching files with query:', sanitizedQuery);

    const response = await window.gapi.client.drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, starred, owners, thumbnailLink)',
      q: sanitizedQuery || undefined
    });

    const files = response.result.files || [];
    logger.debug(`Found ${files.length} files`);

    return files;
  } catch (error) {
    logger.error('Error searching files', error);
    throw new Error(getUserFriendlyError(error, 'File search'));
  }
};

/**
 * Create a folder in Google Drive
 * @param {string} folderName - Name of folder to create
 * @returns {Promise<Object>} - Created folder object
 */
export const createFolder = async (folderName) => {
  // Rate limiting
  if (!driveRateLimiter.isAllowed('createFolder')) {
    throw new Error('Too many folder creation requests. Please wait.');
  }

  try {
    // Sanitize folder name
    const sanitizedName = sanitizeFilename(folderName);

    if (!sanitizedName) {
      throw new Error('Invalid folder name');
    }

    logger.debug('Creating folder:', sanitizedName);

    const response = await window.gapi.client.drive.files.create({
      resource: {
        name: sanitizedName,
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });

    return response.result;
  } catch (error) {
    logger.error('Error creating folder', error);
    throw new Error(getUserFriendlyError(error, 'Folder creation'));
  }
};

/**
 * Move file to a folder
 * @param {string} fileId - ID of file to move
 * @param {string} folderId - ID of destination folder
 * @returns {Promise<void>}
 */
export const moveFileToFolder = async (fileId, folderId) => {
  // Rate limiting
  if (!driveRateLimiter.isAllowed('moveFile')) {
    throw new Error('Too many move operations. Please wait.');
  }

  try {
    logger.debug(`Moving file ${fileId} to folder ${folderId}`);

    const file = await window.gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'parents'
    });

    const previousParents = file.result.parents ? file.result.parents.join(',') : '';

    await window.gapi.client.drive.files.update({
      fileId: fileId,
      addParents: folderId,
      removeParents: previousParents,
      fields: 'id, parents'
    });

    logger.debug('File moved successfully');
  } catch (error) {
    logger.error('Error moving file', error);
    throw new Error(getUserFriendlyError(error, 'File move'));
  }
};

/**
 * Organize files by type into folders
 * @param {number} maxFiles - Maximum number of files to process
 * @returns {Promise<Object>} - Results object with moved and error counts
 */
export const organizeFilesByType = async (maxFiles = 1000) => {
  try {
    const files = await searchFiles();

    // Safety check: Don't process too many files at once
    if (files.length > maxFiles) {
      throw new Error(`Too many files (${files.length}). Maximum is ${maxFiles} per operation. Please organize in smaller batches.`);
    }

    logger.debug(`Organizing ${files.length} files by type`);

    const folders = {};
    const results = { moved: 0, errors: 0 };

    // Process files in batches to avoid overwhelming the API
    const batchSize = 10;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      await Promise.all(batch.map(async (file) => {
        for (const [type, mimeTypes] of Object.entries(MIME_TYPES)) {
          if (mimeTypes.includes(file.mimeType)) {
            try {
              // Create folder if doesn't exist
              if (!folders[type]) {
                const folderName = type.charAt(0).toUpperCase() + type.slice(1);
                const folder = await createFolder(folderName);
                folders[type] = folder.id;
              }

              // Move file to folder
              await moveFileToFolder(file.id, folders[type]);
              results.moved++;
            } catch (error) {
              logger.error(`Failed to organize file: ${file.name}`, error);
              results.errors++;
            }
            break; // File organized, move to next
          }
        }
      }));
    }

    logger.debug(`Organization complete: ${results.moved} moved, ${results.errors} errors`);
    return results;
  } catch (error) {
    logger.error('Error organizing files', error);
    throw new Error(getUserFriendlyError(error, 'File organization'));
  }
};

/**
 * Delete files older than specified days
 * @param {number} daysOld - Age threshold in days
 * @returns {Promise<Object>} - Results with deleted count
 */
export const deleteOldFiles = async (daysOld = 365) => {
  try {
    // Validate input
    if (daysOld < 1 || daysOld > 3650) {
      throw new Error('Invalid age threshold. Must be between 1 and 3650 days.');
    }

    logger.debug(`Deleting files older than ${daysOld} days`);

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysOld);
    const isoDate = dateThreshold.toISOString();

    // Sanitize the date query (even though we control it)
    const query = sanitizeDriveQuery(`modifiedTime < '${isoDate}' and trashed = false`);

    const response = await window.gapi.client.drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, modifiedTime)',
      q: query
    });

    const files = response.result.files || [];
    logger.debug(`Found ${files.length} old files to delete`);

    // Safety check
    if (files.length > 1000) {
      throw new Error(`Too many files to delete (${files.length}). Please delete in smaller batches.`);
    }

    let deleted = 0;
    let errors = 0;

    // Delete files with rate limiting
    for (const file of files) {
      // Wait if rate limit reached
      while (!driveRateLimiter.isAllowed('delete')) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        await window.gapi.client.drive.files.delete({
          fileId: file.id
        });
        deleted++;
        logger.debug(`Deleted file: ${file.name}`);
      } catch (error) {
        logger.error(`Failed to delete file: ${file.name}`, error);
        errors++;
      }
    }

    logger.debug(`Deletion complete: ${deleted} deleted, ${errors} errors`);
    return { deleted, errors, total: files.length };
  } catch (error) {
    logger.error('Error deleting old files', error);
    throw new Error(getUserFriendlyError(error, 'File deletion'));
  }
};

/**
 * Share file with a user via email
 * @param {string} fileId - ID of file to share
 * @param {string} email - Email address to share with
 * @returns {Promise<void>}
 */
export const shareFile = async (fileId, email) => {
  // Rate limiting
  if (!driveRateLimiter.isAllowed('share')) {
    throw new Error('Too many share operations. Please wait.');
  }

  try {
    // Email should already be validated and sanitized by caller
    logger.debug(`Sharing file ${fileId} with ${email}`);

    await window.gapi.client.drive.permissions.create({
      fileId: fileId,
      resource: {
        type: 'user',
        role: 'reader',
        emailAddress: email
      }
    });

    logger.debug('File shared successfully');
  } catch (error) {
    logger.error('Error sharing file', error);
    throw new Error(getUserFriendlyError(error, 'File sharing'));
  }
};

/**
 * Download a file from Google Drive
 * @param {string} fileId - ID of file to download
 * @param {string} fileName - Name for downloaded file
 * @returns {Promise<void>}
 */
export const downloadFile = async (fileId, fileName) => {
  // Rate limiting
  if (!driveRateLimiter.isAllowed('download')) {
    throw new Error('Too many download requests. Please wait.');
  }

  try {
    // Sanitize filename to prevent XSS
    const safeFileName = sanitizeFilename(fileName);

    logger.debug(`Downloading file: ${safeFileName}`);

    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    // Create blob and download
    const blob = new Blob([response.body], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeFileName;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    logger.debug('File downloaded successfully');
  } catch (error) {
    logger.error('Error downloading file', error);
    throw new Error(getUserFriendlyError(error, 'File download'));
  }
};

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return 'N/A';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  if (i === 0) return `${bytes} ${sizes[i]}`;

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Delete multiple files
 * @param {Array<string>} fileIds - Array of file IDs to delete
 * @returns {Promise<Object>} - Results with deleted count
 */
export const deleteFiles = async (fileIds) => {
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new Error('No files specified for deletion');
  }

  // Safety check
  if (fileIds.length > 100) {
    throw new Error('Too many files to delete at once. Maximum is 100.');
  }

  logger.debug(`Deleting ${fileIds.length} files`);

  let deleted = 0;
  let errors = 0;

  for (const fileId of fileIds) {
    // Wait if rate limit reached
    while (!driveRateLimiter.isAllowed('delete')) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      await window.gapi.client.drive.files.delete({
        fileId: fileId
      });
      deleted++;
    } catch (error) {
      logger.error(`Failed to delete file: ${fileId}`, error);
      errors++;
    }
  }

  logger.debug(`Deletion complete: ${deleted} deleted, ${errors} errors`);
  return { deleted, errors, total: fileIds.length };
};
