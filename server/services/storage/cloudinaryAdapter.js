import { v2 as cloudinary } from 'cloudinary';
import { StorageInterface } from './storageInterface.js';

/**
 * Cloudinary Storage Adapter
 * Implements the StorageInterface for Cloudinary file storage.
 */
export class CloudinaryAdapter extends StorageInterface {
  constructor() {
    super();
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload a file to Cloudinary
   */
  async upload(file, folder = 'learnnest', options = {}) {
    try {
      const uploadOptions = {
        folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        ...options,
      };

      // Support both file path and buffer uploads
      let result;
      if (file.path) {
        result = await cloudinary.uploader.upload(file.path, uploadOptions);
      } else if (file.buffer) {
        result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
      } else {
        throw new Error('File must have either a path or buffer');
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Upload a video to Cloudinary
   */
  async uploadVideo(file, folder = 'learnnest/videos', options = {}) {
    try {
      const uploadOptions = {
        folder,
        resource_type: 'video',
        use_filename: true,
        unique_filename: true,
        eager: [
          { streaming_profile: 'sd', format: 'mp4' },
        ],
        ...options,
      };

      let result;
      if (file.path) {
        result = await cloudinary.uploader.upload(file.path, uploadOptions);
      } else if (file.buffer) {
        result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
      } else {
        throw new Error('File must have either a path or buffer');
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
        size: result.bytes,
        duration: result.duration ? Math.round(result.duration) : null,
        format: result.format,
      };
    } catch (error) {
      console.error('Cloudinary video upload error:', error);
      throw new Error(`Failed to upload video to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  async delete(publicId, options = {}) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: options.resourceType || 'image',
        ...options,
      });
      return { success: result.result === 'ok' };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
    }
  }

  /**
   * Delete a video from Cloudinary
   */
  async deleteVideo(publicId) {
    return this.delete(publicId, { resourceType: 'video' });
  }

  /**
   * Get the public URL of a Cloudinary resource
   */
  getUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  }
}
