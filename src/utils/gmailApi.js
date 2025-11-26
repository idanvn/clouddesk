import {
  sanitizeGmailQuery,
  validateLength,
  logger,
  getUserFriendlyError,
  gmailRateLimiter
} from './security';

/**
 * Search emails in Gmail
 * @param {string} query - Gmail search query
 * @returns {Promise<Array>} - Array of email objects
 */
export const searchEmails = async (query = '') => {
  // Rate limiting
  if (!gmailRateLimiter.isAllowed('search')) {
    throw new Error('Too many search requests. Please wait a moment.');
  }

  try {
    // Sanitize query
    const sanitizedQuery = sanitizeGmailQuery(query);

    logger.debug('Searching emails with query:', sanitizedQuery);

    const response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 100,
      q: sanitizedQuery || undefined
    });

    const messages = response.result.messages || [];
    logger.debug(`Found ${messages.length} emails`);

    // Fetch email details with rate limiting
    const emailDetails = await Promise.all(
      messages.map(async (message) => {
        // Wait if rate limit reached
        while (!gmailRateLimiter.isAllowed('getEmail')) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const detail = await window.gapi.client.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        });

        const headers = detail.result.payload.headers;
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        return {
          id: message.id,
          from,
          subject,
          date,
          labelIds: detail.result.labelIds || []
        };
      })
    );

    return emailDetails;
  } catch (error) {
    logger.error('Error searching emails', error);
    throw new Error(getUserFriendlyError(error, 'Email search'));
  }
};

/**
 * List all Gmail labels
 * @returns {Promise<Array>} - Array of label objects
 */
export const listLabels = async () => {
  // Rate limiting
  if (!gmailRateLimiter.isAllowed('listLabels')) {
    throw new Error('Too many requests. Please wait.');
  }

  try {
    logger.debug('Listing Gmail labels');

    const response = await window.gapi.client.gmail.users.labels.list({
      userId: 'me'
    });

    const labels = response.result.labels || [];
    logger.debug(`Found ${labels.length} labels`);

    return labels;
  } catch (error) {
    logger.error('Error listing labels', error);
    throw new Error(getUserFriendlyError(error, 'Label list'));
  }
};

/**
 * Create a new Gmail label
 * @param {string} labelName - Name of label to create
 * @returns {Promise<Object>} - Created label object
 */
export const createLabel = async (labelName) => {
  // Rate limiting
  if (!gmailRateLimiter.isAllowed('createLabel')) {
    throw new Error('Too many label creation requests. Please wait.');
  }

  // Validate label name
  const validation = validateLength(labelName, 255, 'Label name');
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  try {
    const trimmedName = labelName.trim();
    logger.debug('Creating label:', trimmedName);

    const response = await window.gapi.client.gmail.users.labels.create({
      userId: 'me',
      resource: {
        name: trimmedName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      }
    });

    logger.debug('Label created successfully');
    return response.result;
  } catch (error) {
    logger.error('Error creating label', error);
    throw new Error(getUserFriendlyError(error, 'Label creation'));
  }
};

/**
 * Delete a Gmail label
 * @param {string} labelId - ID of label to delete
 * @returns {Promise<void>}
 */
export const deleteLabel = async (labelId) => {
  // Rate limiting
  if (!gmailRateLimiter.isAllowed('deleteLabel')) {
    throw new Error('Too many label deletion requests. Please wait.');
  }

  try {
    logger.debug('Deleting label:', labelId);

    await window.gapi.client.gmail.users.labels.delete({
      userId: 'me',
      id: labelId
    });

    logger.debug('Label deleted successfully');
  } catch (error) {
    logger.error('Error deleting label', error);
    throw new Error(getUserFriendlyError(error, 'Label deletion'));
  }
};

/**
 * Add label to an email
 * @param {string} messageId - ID of message
 * @param {string} labelId - ID of label to add
 * @returns {Promise<void>}
 */
export const addLabelToEmail = async (messageId, labelId) => {
  // Rate limiting
  if (!gmailRateLimiter.isAllowed('addLabel')) {
    throw new Error('Too many label operations. Please wait.');
  }

  try {
    logger.debug(`Adding label ${labelId} to message ${messageId}`);

    await window.gapi.client.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      resource: {
        addLabelIds: [labelId]
      }
    });

    logger.debug('Label added successfully');
  } catch (error) {
    logger.error('Error adding label to email', error);
    throw new Error(getUserFriendlyError(error, 'Label assignment'));
  }
};

/**
 * Delete all spam emails
 * @returns {Promise<Object>} - Results with deleted count
 */
export const deleteSpamEmails = async () => {
  try {
    logger.debug('Fetching spam emails');

    const response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      labelIds: ['SPAM']
    });

    const messages = response.result.messages || [];
    logger.debug(`Found ${messages.length} spam emails`);

    // Safety check
    if (messages.length > 1000) {
      throw new Error(`Too many spam emails (${messages.length}). Please delete in smaller batches.`);
    }

    let deleted = 0;
    let errors = 0;

    // Delete with rate limiting
    for (const message of messages) {
      // Wait if rate limit reached
      while (!gmailRateLimiter.isAllowed('delete')) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        await window.gapi.client.gmail.users.messages.delete({
          userId: 'me',
          id: message.id
        });
        deleted++;
        logger.debug(`Deleted spam email: ${message.id}`);
      } catch (error) {
        logger.error(`Failed to delete spam email: ${message.id}`, error);
        errors++;
      }
    }

    logger.debug(`Spam deletion complete: ${deleted} deleted, ${errors} errors`);
    return { deleted, errors, total: messages.length };
  } catch (error) {
    logger.error('Error deleting spam emails', error);
    throw new Error(getUserFriendlyError(error, 'Spam deletion'));
  }
};

/**
 * Move old emails to trash
 * @param {number} daysOld - Age threshold in days
 * @returns {Promise<Object>} - Results with trashed count
 */
export const deleteOldEmails = async (daysOld = 365) => {
  try {
    // Validate input
    if (daysOld < 1 || daysOld > 3650) {
      throw new Error('Invalid age threshold. Must be between 1 and 3650 days.');
    }

    logger.debug(`Moving emails older than ${daysOld} days to trash`);

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysOld);
    const dateString = `${dateThreshold.getFullYear()}/${String(dateThreshold.getMonth() + 1).padStart(2, '0')}/${String(dateThreshold.getDate()).padStart(2, '0')}`;

    // Sanitize query
    const query = sanitizeGmailQuery(`before:${dateString}`);

    const response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      q: query
    });

    const messages = response.result.messages || [];
    logger.debug(`Found ${messages.length} old emails`);

    // Safety check
    if (messages.length > 1000) {
      throw new Error(`Too many emails (${messages.length}). Please trash in smaller batches.`);
    }

    let trashed = 0;
    let errors = 0;

    // Trash with rate limiting
    for (const message of messages) {
      // Wait if rate limit reached
      while (!gmailRateLimiter.isAllowed('trash')) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        await window.gapi.client.gmail.users.messages.trash({
          userId: 'me',
          id: message.id
        });
        trashed++;
        logger.debug(`Trashed email: ${message.id}`);
      } catch (error) {
        logger.error(`Failed to trash email: ${message.id}`, error);
        errors++;
      }
    }

    logger.debug(`Email trashing complete: ${trashed} trashed, ${errors} errors`);
    return { trashed, errors, total: messages.length };
  } catch (error) {
    logger.error('Error deleting old emails', error);
    throw new Error(getUserFriendlyError(error, 'Email deletion'));
  }
};

/**
 * Format date string for display
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    logger.error('Error formatting date', error);
    return dateString;
  }
};
