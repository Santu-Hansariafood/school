import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folder = 'assignments') => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;
