import { CloudinaryAdapter } from './cloudinaryAdapter.js';
import { S3Adapter } from './s3Adapter.js';
import { GCPAdapter } from './gcpAdapter.js';

/**
 * Storage Service Factory
 * Returns the appropriate storage adapter based on the STORAGE_PROVIDER env var.
 * 
 * Usage:
 *   import { getStorageService } from './services/storage/index.js';
 *   const storage = getStorageService();
 *   const result = await storage.upload(file, 'folder');
 */

let storageInstance = null;

export function getStorageService() {
  if (storageInstance) return storageInstance;

  const provider = (process.env.STORAGE_PROVIDER || 'cloudinary').toLowerCase();

  switch (provider) {
    case 'cloudinary':
      storageInstance = new CloudinaryAdapter();
      break;
    case 's3':
    case 'aws':
      storageInstance = new S3Adapter();
      break;
    case 'gcp':
    case 'google':
      storageInstance = new GCPAdapter();
      break;
    default:
      console.warn(`Unknown storage provider "${provider}", defaulting to Cloudinary`);
      storageInstance = new CloudinaryAdapter();
  }

  console.log(`Storage service initialized: ${provider}`);
  return storageInstance;
}
