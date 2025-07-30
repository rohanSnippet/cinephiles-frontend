import { SHA1 } from "crypto-js";

export const cloudURL = import.meta.env.VITE_CLOUDINARY_API;

export const uploadImageToCloud = async (image, folder_name) => {
  if ((image, folder_name)) {
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
      //   const cloudinaryData = await res.json();
      //   updatedUser.profile = cloudinaryData.url;
      //   updatedUser.publicId = cloudinaryData.public_id;
      return res;
    } catch (err) {
      console.error("Error uploading image", err);
      return err;
    }
  }
};

