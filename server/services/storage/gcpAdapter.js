import { StorageInterface } from './storageInterface.js';

/**
 * Google Cloud Storage Adapter (Stub)
 * Placeholder for future GCP Storage integration.
 */
export class GCPAdapter extends StorageInterface {
  constructor() {
    super();
    console.warn('GCP Storage Adapter is not yet implemented. Using stub.');
  }

  async upload(file, folder = '', options = {}) {
    throw new Error('GCP storage adapter is not yet implemented. Please use Cloudinary.');
  }

  async uploadVideo(file, folder = '', options = {}) {
    throw new Error('GCP storage adapter is not yet implemented. Please use Cloudinary.');
  }

  async delete(publicId, options = {}) {
    throw new Error('GCP storage adapter is not yet implemented. Please use Cloudinary.');
  }

  async deleteVideo(publicId) {
    throw new Error('GCP storage adapter is not yet implemented. Please use Cloudinary.');
  }

  getUrl(publicId, options = {}) {
    throw new Error('GCP storage adapter is not yet implemented. Please use Cloudinary.');
  }
}
