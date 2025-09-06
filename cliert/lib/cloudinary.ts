// Cloudinary configuration for client-side uploads
export const CLOUDINARY_CONFIG = {
  cloudName: "demo", // Thay bằng cloud name thực tế
  uploadPreset: "ml_default", // Sử dụng preset mặc định của demo
  folder: "chat-app"
};

export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;
};
