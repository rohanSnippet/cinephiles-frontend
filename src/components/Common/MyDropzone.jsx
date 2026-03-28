import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadImageToCloud } from "../Services/cloudinaryConfig";

const baseStyle = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '30px', borderWidth: 2, borderRadius: 12, borderStyle: 'dashed',
  borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.02)',
  color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease-in-out', cursor: 'pointer',
};
const focusedStyle = { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.05)' };
const acceptStyle = { borderColor: '#4ade80' };
const rejectStyle = { borderColor: '#f87171' };

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
          
          if (cloudinaryData.secure_url) {
            onImageChange(cloudinaryData.secure_url, name);
            console.log("Uploaded secure_url:", cloudinaryData.secure_url);
            
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
     <div className="w-full mt-2">
       <div {...getRootProps({ style })} className="hover:bg-white/5">
         <input {...getInputProps()} />
         {loading ? (
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3"></div>
             <p className="text-white/80 poppins-light text-sm">Uploading to Cloud...</p>
           </div>
         ) : currentImage ? (
           <div className="flex flex-col items-center">
             <img src={currentImage} alt="Preview" className="max-w-[200px] max-h-40 object-cover rounded-lg mb-3 shadow-lg" />
             <p className="text-xs text-white/50 poppins-light">Click or drag to replace</p>
           </div>
         ) : (
           <p className="text-white/50 poppins-light text-sm text-center">Drag & drop an image here,<br/>or click to browse</p>
         )}
       </div>

       {currentImage && onRemoveImage && !loading && (
         <div className="text-center mt-4">
           <button type="button" className="text-red-400 hover:text-red-300 text-xs poppins-medium hover:underline" onClick={(e) => { e.stopPropagation(); onRemoveImage(name); }}>
             Remove Image
           </button>
         </div>
       )}
     </div>
   );
};

export default MyDropzone;