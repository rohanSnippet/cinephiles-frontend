import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadImageToCloud } from "../Services/cloudinaryConfig";

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 8,
  borderColor: '#cbd5e0', // Tailwind's gray-300
  borderStyle: 'dashed',
  backgroundColor: '#1f2937', // Tailwind's gray-800
  color: '#cbd5e0',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
};

const focusedStyle = {
  borderColor: '#3b82f6', // Tailwind's blue-500
};

const acceptStyle = {
  borderColor: '#10b981', // Tailwind's emerald-500
};

const rejectStyle = {
  borderColor: '#ef4444', // Tailwind's red-500
};

const MyDropzone = ({onImageChange,currentImage, name, onRemoveImage, closeDialog}) => {

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        try {
          const res = await uploadImageToCloud(file, "cinephiles-movie-poster");
          const cloudinaryData = await res.json(); // Parse the response
          onImageChange(cloudinaryData.url, name);
          console.log(cloudinaryData.url, name)
          //setImage(cloudinaryData.url);
         // saveImage(cloudinaryData.url, name);
          closeDialog(); // Close dialog after saving
        } catch (error) {
          console.error("Error uploading the image:", error);
        } finally {
          setLoading(false); // Stop loading after completion
        }
      }
    },
    [onImageChange, closeDialog, name]
  );

  
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif'],
    },
    multiple: false, // Ensure only one file can be dropped
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  }), [isFocused, isDragAccept, isDragReject]);
  return (
    <div className="container p-4">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {currentImage ? (
          <div className="flex flex-col items-center">
            <img src={currentImage} alt="Preview" className="max-w-xs max-h-48 object-contain mb-2 rounded-md" />
            <p className="text-sm text-gray-400">Drag 'n' drop another image here, or click to select a new one</p>
          </div>
        ) : (
          <p className="text-gray-400">Drag 'n' drop an image here, or click to select one</p>
        )}
      </div>
      {currentImage && onRemoveImage && (
        <div className="text-center mt-3">
          <button
            className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            onClick={() => onRemoveImage(name)}
          >
            Remove Current Image
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDropzone;