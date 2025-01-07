import { SHA1 } from "crypto-js";

const cloudURL = `https://api.cloudinary.com/v1_1/cinephiles-app/image`;

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

