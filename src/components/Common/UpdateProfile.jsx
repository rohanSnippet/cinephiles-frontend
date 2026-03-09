import React, { useEffect, useState, useContext } from "react";
import useAxiosSecure from "../Hooks/AxiosSecure";
import MyDropzone from "./MyDropzone";
import states from "../../assets/states.json";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { uploadImageToCloud } from "../Services/cloudinaryConfig";
import { IoChevronBackSharp } from "react-icons/io5";
import {baseURL} from "../Services/URL"
import { AuthContext } from "../Context/AuthProvider";


const CustomTextField = styled(TextField)(() => ({
  "& .MuiInputBase-input": { color: "white", fontFamily: "poppins, sans-serif", fontWeight: 300 },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontFamily: "poppins, sans-serif" },
  "&:hover .MuiInputLabel-root": { color: "white" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)", transition: "all 0.3s ease" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
    "&.Mui-focused fieldset": { borderColor: "white", borderWidth: "1px" },
  },
  "& .MuiSelect-icon": { color: "white" }
}));

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [currUser, setCurrUser] = useState({});
  const [updatedUser, setUpdatedUser] = useState({});
  const [isFocused, setIsFocused] = useState(false);
  const axiosSecure = useAxiosSecure();
  const { session } = useContext(AuthContext);

  const username = session?.username;

   useEffect(() => {
      const getUser = async () => {
        try {
          const res = await axiosSecure.get(`/user?username=${username}`);
          if (res.data){
              setCurrUser(res.data);
              setUpdatedUser(res.data);
              setImage(res.data.profile || null);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      if (username) {
        getUser();
      }
    }, [username, axiosSecure]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Update Profile?",
      text: "Are you sure you want to save these changes?",
      color: "white",
      icon: "question",
      background: "#111",
      showCancelButton: true,
      confirmButtonColor: "#fff",
      cancelButtonColor: "rgba(255,255,255,0.1)",
      confirmButtonText: "<span style='color:black'>Yes, Update</span>",
      cancelButtonText: "Cancel",
      customClass: { popup: 'border border-white/10 rounded-2xl' }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Updating...",
          text: "Please wait while we save your changes.",
          background: "#111",
          color: "white",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
        updateData();
      }
    });
  };

  const updateData = async () => {
    try {
      let finalProfileUrl = updatedUser.profile;

      // 2. Dramatically simplified: Using your centralized upload logic
      if (image && typeof image !== "string") {
        // Calling your imported function and saving it to a "Profiles" folder
        const cloudRes = await uploadImageToCloud(image, "Profiles");
        const cloudData = await cloudRes.json();

        if (cloudData.secure_url) {
          finalProfileUrl = cloudData.secure_url;
        } else {
          throw new Error("Failed to upload image to Cloudinary");
        }
      }

      const finalUserData = {
        ...updatedUser,
        profile: finalProfileUrl
      };
      console.log(finalUserData)
      const response = await axiosSecure.put(`${baseURL}/user/update-user/${currUser?.id}`, finalUserData);

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          title: "Success",
          text: "Your profile has been updated.",
          icon: "success",
          color: "white",
          background: "#111",
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: 'border border-white/10 rounded-2xl' }
        }).then(() => navigate("/"));
      }
    } catch (error) {
      console.error("Update failed:", error);
      Swal.fire({
        title: "Error",
        text: "There was a problem updating your profile.",
        icon: "error",
        color: "white",
        background: "#111",
        customClass: { popup: 'border border-white/10 rounded-2xl' }
      });
    }
  };

  const closeDialog = () => document.getElementById("my_modal_1").close();
  const deleteImage = () => { setImage(null); setUpdatedUser((prev) => ({ ...prev, profile: "" })); };

  const handleImageChange = (imageFileOrUrl, name) => {
    setImage(imageFileOrUrl);
    setUpdatedUser((prev) => ({ ...prev, [name]: imageFileOrUrl }));
    closeDialog();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 relative flex justify-center items-center">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:left-12 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <IoChevronBackSharp size={24} />
        <span className="poppins-medium text-sm tracking-widest uppercase hidden md:block">Back to Home</span>
      </button>

      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <h2 className="text-3xl poppins-semibold tracking-wide text-center mb-10">Profile Settings</h2>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-white/20 bg-[#111]">
                <img
                  src={image ? (typeof image === "string" ? image : URL.createObjectURL(image)) : currUser.profile || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                <button type="button" onClick={() => document.getElementById("my_modal_1").showModal()} className="text-white text-xs poppins-medium hover:underline">Edit</button>
                <span className="text-white/50">|</span>
                <button type="button" onClick={deleteImage} className="text-red-400 text-xs poppins-medium hover:underline">Remove</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <CustomTextField label="First Name" name="firstName" value={updatedUser.firstName || ""} onChange={handleChange} fullWidth />
            <CustomTextField label="Last Name" name="lastName" value={updatedUser.lastName || ""} onChange={handleChange} fullWidth />
            <CustomTextField label="Email" type="email" name="username" value={updatedUser.username || ""} onChange={handleChange} fullWidth disabled />
            <CustomTextField label="Phone Number" name="phone" value={updatedUser.phone || ""} onChange={handleChange} fullWidth inputProps={{ maxLength: 10 }} />
            <CustomTextField
              type={isFocused || updatedUser.dob ? "date" : "text"}
              label={!isFocused && !updatedUser.dob ? "Date of Birth" : ""}
              name="dob" value={updatedUser.dob || ""} onChange={handleChange}
              onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <CustomTextField select label="Gender" name="gender" value={updatedUser.gender || ""} onChange={handleChange} fullWidth>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </CustomTextField>
            <div className="md:col-span-2">
              <CustomTextField label="Address Line" name="addressLine" value={updatedUser.addressLine || ""} onChange={handleChange} fullWidth multiline />
            </div>
            <CustomTextField label="City" name="city" value={updatedUser.city || ""} onChange={handleChange} fullWidth />
            <CustomTextField select label="State" name="state" value={updatedUser.state || ""} onChange={handleChange} fullWidth>
              {states.map((state) => <MenuItem key={state.value} value={state.value}>{state.label}</MenuItem>)}
            </CustomTextField>
            <CustomTextField label="Pincode" name="pincode" value={updatedUser.pincode || ""} onChange={handleChange} fullWidth inputProps={{ maxLength: 6 }} />
            <CustomTextField label="Landmark" name="landmark" value={updatedUser.landmark || ""} onChange={handleChange} fullWidth />
          </div>

          <button type="submit" className="w-full py-4 rounded-full bg-white text-black poppins-semibold tracking-widest uppercase hover:bg-neutral-300 transition-colors">
            Save Changes
          </button>
        </form>
      </div>

      <dialog id="my_modal_1" className="modal modal-bottom sm:modal-middle backdrop-blur-md">
        <div className="modal-box bg-[#111] border border-white/10 text-white rounded-t-3xl sm:rounded-3xl p-8">
          <h3 className="poppins-medium text-lg mb-6 text-center tracking-wide">Update Profile Picture</h3>
          <MyDropzone onImageChange={handleImageChange} currentImage={image} name="profile" onRemoveImage={deleteImage} />

          <div className="divider before:bg-white/10 after:bg-white/10 text-white/40 text-sm my-6">OR ENTER URL</div>

          <div className="mb-8">
            <CustomTextField label="Image URL" fullWidth value={typeof image === 'string' ? image : ""} onChange={(e) => { setImage(e.target.value); setUpdatedUser((prev) => ({ ...prev, profile: e.target.value })); }} />
          </div>

          <div className="flex gap-4">
            <button className="flex-1 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors poppins-medium text-sm" onClick={closeDialog}>Cancel</button>
            <button className="flex-1 py-3 rounded-full bg-white text-black hover:bg-neutral-300 transition-colors poppins-medium text-sm" onClick={() => { setImage(image); closeDialog(); }}>Apply</button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default UpdateProfile;