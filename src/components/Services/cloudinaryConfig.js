import { SHA1 } from "crypto-js";

export const cloudURL = import.meta.env.VITE_CLOUDINARY_API;

export const uploadImageToCloud = async (image, folder_name) => {
  // FIXED: Changed comma to && for proper validation
  if (image && folder_name) {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "Cinephiles");
    data.append("cloud_name", "cinephiles-app");
    data.append("folder", folder_name);

    try {
      const res = await fetch(`${cloudURL}/upload`, {
        method: "POST",
        body: data,
      });
      
      // Check if the response is actually okay before returning
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }
      
      return res;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw err; // Throw the error so the component catch block can handle it
    }
  }
};