/**
 * Slug generator utility
 * Generates unique URL-friendly slugs for surveys
 */

import db from '../config/database';

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a random string
 */
function generateRandomString(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if slug exists in database
 */
async function slugExists(slug: string): Promise<boolean> {
  const result = await db.query(
    'SELECT id FROM surveys WHERE unique_slug = $1',
    [slug]
  );
  return result.rows.length > 0;
}

/**
 * Generate a unique slug for a survey
 * If the base slug exists, append a random string until unique
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = generateSlug(title);

  // Limit slug length to 40 characters to leave room for random suffix
  if (baseSlug.length > 40) {
    baseSlug = baseSlug.substring(0, 40);
  }

  // If base slug is empty, use a default
  if (!baseSlug) {
    baseSlug = 'survey';
  }

  let slug = baseSlug;
  let attempts = 0;
  const maxAttempts = 10;

  // Try to find a unique slug
  while (await slugExists(slug) && attempts < maxAttempts) {
    const randomSuffix = generateRandomString(6);
    slug = `${baseSlug}-${randomSuffix}`;
    attempts++;
  }

  // If still not unique after max attempts, use timestamp
  if (await slugExists(slug)) {
    const timestamp = Date.now().toString(36);
    slug = `${baseSlug}-${timestamp}`;
  }

  return slug;
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with a hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
}

export default {
  generateSlug,
  generateUniqueSlug,
  isValidSlug,
};
