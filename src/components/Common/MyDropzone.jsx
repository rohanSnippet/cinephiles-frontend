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
  borderColor: '#cbd5e0',
  borderStyle: 'dashed',
  backgroundColor: '#1f2937',
  color: '#cbd5e0',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
};

const focusedStyle = { borderColor: '#3b82f6' };
const acceptStyle = { borderColor: '#10b981' };
const rejectStyle = { borderColor: '#ef4444' };

const MyDropzone = ({ onImageChange, currentImage, name, onRemoveImage, closeDialog }) => {
  // FIXED: Added missing loading state
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setLoading(true); // Start loading
        try {
          const res = await uploadImageToCloud(file, "cinephiles-movie-poster");
          const cloudinaryData = await res.json();
          
          if (cloudinaryData.url) {
            onImageChange(cloudinaryData.url, name);
            console.log("Uploaded URL:", cloudinaryData.url);
            
            // FIXED: Optional chaining to prevent crash if prop is missing
            closeDialog?.(); 
          }
        } catch (error) {
          console.error("Error uploading the image:", error);
        } finally {
          setLoading(false); // FIXED: setLoading is now defined
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
    multiple: false,
    disabled: loading // Disable during upload
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
    ...(loading ? { opacity: 0.5, cursor: 'not-allowed' } : {})
  }), [isFocused, isDragAccept, isDragReject, loading]);

  return (
    <div className="container p-4">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex flex-col items-center">
            <span className="loading loading-spinner loading-lg text-blue-500 mb-2"></span>
            <p className="text-blue-400 font-semibold animate-pulse">Uploading to Cloudinary...</p>
          </div>
        ) : currentImage ? (
          <div className="flex flex-col items-center">
            <img src={currentImage} alt="Preview" className="max-w-xs max-h-48 object-contain mb-2 rounded-md" />
            <p className="text-sm text-gray-400 text-center">Drag 'n' drop another image here, or click to select a new one</p>
          </div>
        ) : (
          <p className="text-gray-400 text-center">Drag 'n' drop an image here, or click to select one</p>
        )}
      </div>
      
      {currentImage && onRemoveImage && !loading && (
        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-error btn-sm text-white"
            onClick={(e) => {
              e.stopPropagation(); // Prevent dropzone click
              onRemoveImage(name);
            }}
          >
            Remove Current Image
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDropzone;