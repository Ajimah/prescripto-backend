import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });

   (file, folder) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file,
        {
          resource_type: 'auto',
          folder: folder,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve({
            url: result.secure_url,
            id: result.public_id,
          });
        }
      );
    });
  };



}


export default connectCloudinary