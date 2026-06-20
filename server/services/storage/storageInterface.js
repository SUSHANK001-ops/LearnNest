/**
 * Storage Service Interface
 * Abstract class that all storage adapters must implement.
 * This allows switching between Cloudinary, AWS S3, and GCP Storage
 * without changing application logic.
 */
export class StorageInterface {
  /**
   * Upload a file to the storage provider
   * @param {Object} file - The file object (from multer)
   * @param {string} file.path - Local file path (or buffer)
   * @param {Buffer} file.buffer - File buffer
   * @param {string} file.originalname - Original file name
   * @param {string} file.mimetype - MIME type
   * @param {string} folder - Destination folder/path in storage
   * @param {Object} options - Provider-specific options
   * @returns {Promise<{url: string, publicId: string, provider: string, size: number}>}
   */
  async upload(file, folder = '', options = {}) {
    throw new Error('upload() must be implemented by storage adapter');
  }

  /**
   * Upload a video file to the storage provider
   * @param {Object} file - The file object (from multer)
   * @param {string} folder - Destination folder/path in storage
   * @param {Object} options - Provider-specific options
   * @returns {Promise<{url: string, publicId: string, provider: string, size: number, duration: number}>}
   */
  async uploadVideo(file, folder = '', options = {}) {
    throw new Error('uploadVideo() must be implemented by storage adapter');
  }

  /**
   * Delete a file from the storage provider
   * @param {string} publicId - The public ID of the file to delete
   * @param {Object} options - Provider-specific options
   * @returns {Promise<{success: boolean}>}
   */
  async delete(publicId, options = {}) {
    throw new Error('delete() must be implemented by storage adapter');
  }

  /**
   * Delete a video from the storage provider
   * @param {string} publicId - The public ID of the video to delete
   * @returns {Promise<{success: boolean}>}
   */
  async deleteVideo(publicId) {
    throw new Error('deleteVideo() must be implemented by storage adapter');
  }

  /**
   * Get the public URL of a stored file
   * @param {string} publicId - The public ID of the file
   * @param {Object} options - Provider-specific transform options
   * @returns {string}
   */
  getUrl(publicId, options = {}) {
    throw new Error('getUrl() must be implemented by storage adapter');
  }
}
