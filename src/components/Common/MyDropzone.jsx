import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadImageToCloud } from "../Services/cloudinaryConfig";

const MyDropzone = ({ setImage, closeDialog /* name */ /* saveImage */ }) => {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setLoading(true); // Start loading when file is dropped
        try {
          const res = await uploadImageToCloud(file, "cinephiles-movie-poster");
          const cloudinaryData = await res.json(); // Parse the response
          setImage(cloudinaryData.url);
         // saveImage(cloudinaryData.url, name);
          closeDialog(); // Close dialog after saving
        } catch (error) {
          console.error("Error uploading the image:", error);
        } finally {
          setLoading(false); // Stop loading after completion
        }
      }
    },
    [setImage, closeDialog]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="py-20 px-12 border-neutral-100 bg-gray-900 underline border-[1px] rounded-xl cursor-pointer hover:bg-slate-800"
    >
      <input {...getInputProps()} />
      {loading ? (
        <p>Loading...</p>
      ) : isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
};

export default MyDropzone;
