import { StorageInterface } from './storageInterface.js';

/**
 * AWS S3 Storage Adapter (Stub)
 * Placeholder for future AWS S3 integration.
 */
export class S3Adapter extends StorageInterface {
  constructor() {
    super();
    console.warn('AWS S3 Adapter is not yet implemented. Using stub.');
  }

  async upload(file, folder = '', options = {}) {
    throw new Error('AWS S3 storage adapter is not yet implemented. Please use Cloudinary.');
  }

  async uploadVideo(file, folder = '', options = {}) {
    throw new Error('AWS S3 storage adapter is not yet implemented. Please use Cloudinary.');
  }

  async delete(publicId, options = {}) {
    throw new Error('AWS S3 storage adapter is not yet implemented. Please use Cloudinary.');
  }

  async deleteVideo(publicId) {
    throw new Error('AWS S3 storage adapter is not yet implemented. Please use Cloudinary.');
  }

  getUrl(publicId, options = {}) {
    throw new Error('AWS S3 storage adapter is not yet implemented. Please use Cloudinary.');
  }
}
