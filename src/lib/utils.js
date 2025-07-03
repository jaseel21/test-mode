// src/lib/utils.js
// Add these utility functions to your project

/**
 * Extracts the filename from a Supabase URL
 * @param {string} url - The Supabase storage URL
 * @returns {string|null} - The extracted filename or null if not found
 */
export function getFilenameFromUrl(url) {
    if (!url) return null;
    
    try {
      // For Supabase URLs, the pattern is typically:
      // https://[project-ref].supabase.co/storage/v1/object/public/[bucket-name]/[path]/[filename]
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Get the last part of the path which should be the filename
      return pathParts[pathParts.length - 1];
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return null;
    }
  }
  
  /**
   * Extracts the file extension from a filename or path
   * @param {string} filename - The filename or path
   * @returns {string} - The file extension (without the dot)
   */
  export function getFileExtension(filename) {
    if (!filename) return '';
    return filename.split('.').pop();
  }
  
  /**
   * Gets the folder path from a Supabase URL
   * @param {string} url - The Supabase storage URL
   * @returns {string|null} - The folder path or null if not found
   */
  export function getFolderPathFromUrl(url) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Remove the filename (last part)
      pathParts.pop();
      
      // Find the index of 'public' in the path
      const publicIndex = pathParts.findIndex(part => part === 'public');
      
      if (publicIndex !== -1 && publicIndex + 2 < pathParts.length) {
        // +2 to skip 'public' and the bucket name
        return pathParts.slice(publicIndex + 2).join('/');
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting folder path from URL:', error);
      return null;
    }
  }
  
  /**
   * Gets the bucket name from a Supabase URL
   * @param {string} url - The Supabase storage URL
   * @returns {string|null} - The bucket name or null if not found
   */
  export function getBucketFromUrl(url) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Find the index of 'public' in the path
      const publicIndex = pathParts.findIndex(part => part === 'public');
      
      if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
        // The part after 'public' is the bucket name
        return pathParts[publicIndex + 1];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting bucket from URL:', error);
      return null;
    }
  }
  
  /**
   * Creates a URL for a placeholder image
   * @param {number} width - The width of the placeholder
   * @param {number} height - The height of the placeholder
   * @returns {string} - The placeholder URL
   */
  export function getPlaceholderImageUrl(width = 800, height = 400) {
    return `/api/placeholder/${width}/${height}`;
  }