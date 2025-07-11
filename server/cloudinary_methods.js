// imports/api/cloudinary_methods.js
import { Meteor } from 'meteor/meteor';
import cloudinary from 'cloudinary';

const cloudinaryConfig = Meteor.settings?.private?.cloudinary;

console.log("Loaded Meteor.settings:", Meteor.settings);


if (cloudinaryConfig) {
  cloudinary.v2.config({
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key,
    api_secret: cloudinaryConfig.api_secret,
    secure: true,
  });
  console.log("✅ Cloudinary SDK configured");
} else {
  console.warn("⚠️ Cloudinary settings not found in Meteor.settings.");
}
if (Meteor.isServer) {
  Meteor.methods({
    async uploadToCloudinary(fileData, fileName) {
      const userId = this.userId;

      if (Meteor.isClient) {
        throw new Meteor.Error('client-forbidden', 'This method can only be called on the server.');
      }

      if (!fileData) {
        throw new Meteor.Error('no-file-data', 'No file data provided for upload.');
      }

      if (!cloudinaryConfig) {
        throw new Meteor.Error('cloudinary-not-configured', 'Cloudinary is not configured.');
      }

      if (!fileData.startsWith('data:image') && !fileData.startsWith('data:video')) {
        throw new Meteor.Error('invalid-file-type', 'Invalid base64 data. Only images/videos are allowed.');
      }

      try {
        const result = await cloudinary.v2.uploader.upload(fileData, {
          folder: 'meteor_posts_images',
          public_id: fileName.split('.')[0],
          resource_type: 'auto',
          tags: ['meteor', 'post-media', userId || 'guest'],
        });
        console.log("✅ Uploaded to Cloudinary:", result.secure_url);
        return result.secure_url;
      } catch (e) {
        console.error("❌ Cloudinary upload error:", e);
        throw new Meteor.Error('cloudinary-upload-failed', e.message);
      }
    },
  });
}
