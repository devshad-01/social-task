import { Meteor } from 'meteor/meteor';

/**
 * Utility function to check if a user with the given email exists
 * This uses a direct database query for more reliability
 * @param {string} email - Email to check
 * @returns {Promise<Object|null>} User object if found, null otherwise
 */
export const findUserByEmail = async (email) => {
  if (!email) return null;
  
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();
  
  console.log('[utils.findUserByEmail] Checking database for email:', normalizedEmail);
  
  // Direct database query
  const user = await Meteor.users.findOneAsync({
    'emails.address': normalizedEmail
  });
  
  console.log('[utils.findUserByEmail] Result:', user ? 'User found' : 'No user found');
  
  return user;
};

/**
 * Utility function to normalize an email address
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email
 */
export const normalizeEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};
