import React, { useEffect, useState } from "react";
import useAxiosSecure from "../Hooks/AxiosSecure";
import MyDropzone from "./MyDropzone";
import states from "../../assets/states.json";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { cloudURL } from "../Services/cloudinaryConfig";

const CustomTextField = styled(TextField)(() => ({
  "& .MuiInputBase-input": {
    color: "white",
    fontFamily: "poppins",
  },
  "& .MuiInputLabel-root": {
    color: "gray",
    fontFamily: "poppins",
  },
  "&:hover .MuiInputLabel-root": {
    color: "white",
    fontFamily: "poppins",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "gray",
    },
    "&:hover fieldset": {
      borderColor: "white",
      fontFamily: "poppins",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
}));
const UpdateProfile = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [currUser, setCurrUser] = useState({});
  const [updatedUser, setUpdatedUser] = useState({});
  const [publicId, setPublicId] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const axiosSecure = useAxiosSecure();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      color:"white",
      icon: "warning",
      fontFamily:"poppins",
      background: "rgba(43, 43, 46, 0.845)",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update Profile!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Done!",
          text: "Your profile has been Updated.",
          icon: "success",
          color:"white",
          fontFamily:"poppins",
          background: "rgba(43, 43, 46, 0.845)",
          showCloseButton:false,
          timer:500
        }).then(updateData(e));
      }
    });
  };
  const updateData = async (e) => {
    if (image) {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUDNAME);
      data.append("folder", import.meta.env.VITE_CLOUDINARY_FOLDER);

      try {
        const res = await fetch(`${cloudURL}/upload`, {
          method: "POST",
          body: data,
        });
        const cloudinaryData = await res.json();
        updatedUser.profile = cloudinaryData.url;
        updatedUser.publicId = cloudinaryData.public_id;
      } catch (err) {
        console.error("Error uploading image", err);
      }
    }
    try {
      const res = await axiosSecure.put(
        `/user/update-user/${currUser.id}`,
        updatedUser
      );
      console.log("User updated successfully", res);

      if(res.status == 200) navigate("/");
    } catch (err) {
      console.error("Error updating user", err);
    }
  };
  const username = localStorage.getItem("username");
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosSecure.get(`/user?username=${username}`);
        setCurrUser(response.data);
        console.log(response)
        setImage(response?.data?.profile)
        setUpdatedUser(response.data);
        setPublicId(response.data.publicId);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchUser();
  }, [username, axiosSecure]);

  const closeDialog = () => {
    document.getElementById("my_modal_1").close();
  };

  const deleteImage = () => {
    setImage(null);
    setUpdatedUser((prev) => ({ ...prev, profile: "" }));
  };

  const handleImageChange = (imageFileOrUrl, name) => {
    setImage(imageFileOrUrl);
    setUpdatedUser((prev) => ({ ...prev, [name]: imageFileOrUrl }));
    closeDialog();
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "gray",
      },
      "&:hover fieldset": {
        borderColor: "lightgray",
      },
    },
    "& .MuiInputBase-input": {
      color: "white",
    },
    "& .MuiInputLabel-root": {
      color: "gray",
    },
  };
  return (
    <div className="relative w-full h-full bg-gradient-to-tr from-slate-700 via-slate-900 to-slate-700 text-white p-8">
      {/* Profile Modal */}
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box bg-gray-900 text-white">
          {/* Dropzone to upload image */}
          <MyDropzone
            onImageChange={handleImageChange} // Use the new prop
            currentImage={image} // Pass the current image state
            name="profile"
            onRemoveImage={deleteImage} // Pass the remove function
          />

          <div className="text-center">
            <label
              className="block text-center poppins-light my-2 text-white text-md font-bold mb-2"
              htmlFor="title"
            >
              OR
            </label>

            {/* URL input field */}
            <TextField
              label="URL"
              type="text"
              name="profile"
              className="w-[58vh]"
              variant="outlined"
              value={image || ""}
              onChange={(e) => {
                setImage(e.target.value);
                setUpdatedUser((prev) => ({
                  ...prev,
                  profile: e.target.value,
                }));
              }}
              sx={textFieldStyles}
            />

            {/* Remove button to set image to null */}
            <button
              className="btn bg-gray-700 text-white mt-2"
              onClick={() => deleteImage()}
            >
              Remove
            </button>
          </div>

          <div className="modal-action">
            {/* Save button - saves image and closes modal */}
            <button
              className="btn bg-gray-700 text-white"
              onClick={() => {
                setImage(image);
                closeDialog();
              }}
            >
              Save
            </button>

            {/* Close button - just closes modal without saving */}
            <button
              className="btn bg-gray-700 text-white"
              onClick={closeDialog} // ✅ Don't call the function immediately
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

       {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 md:top-6 md:right-6 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span className="hidden sm:inline">Home</span>
      </button>

      {/* Form to fill details */}
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-gradient-to-br from-black/90 via-black/50 to-black/20 shadow-2xl shadow-slate-600 rounded-lg p-8"
      >
        {/* Profile Picture Section */}
        <div className="relative mb-8 mx-auto justify-center flex">
          <div className="avatar mx-auto mb-4">
            <div className="w-48 rounded-full overflow-hidden">
              <img
                src={
                  image
                    ? typeof image === "string"
                      ? image
                      : URL.createObjectURL(image)
                    : currUser.profile ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                }
                alt="Profile"
              />
            </div>
          </div>

          {/* Buttons on Top of the Image */}
          <div className="absolute top-[60%] right-[50%] transform translate-x-1/2 translate-y-1/2 space-x-2">
            <button
              type="button"
              className="btn bg-gray-700 text-white rounded-full px-4 py-2 shadow-md"
              onClick={() => deleteImage()}
            >
              Remove
            </button>
            <button
              type="button"
              className="btn bg-gray-700 text-white rounded-full px-4 py-2 shadow-md"
              onClick={() => document.getElementById("my_modal_1").showModal()}
            >
              Edit
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="mb-4">
          <CustomTextField
            label="Email"
            type="email"
            name="username"
            fullWidth
            variant="outlined"
            value={updatedUser.username || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            label="Phone Number"
            type="tel"
            name="phone"
            fullWidth
            variant="outlined"
            value={updatedUser.phone || ""}
            onChange={handleChange}
            inputProps={{ maxLength: 10 }}
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            label="First Name"
            type="text"
            name="firstName"
            fullWidth
            variant="outlined"
            value={updatedUser.firstName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            label="Last Name"
            type="text"
            name="lastName"
            fullWidth
            variant="outlined"
            value={updatedUser.lastName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            type={isFocused || updatedUser.dob ? "date" : "text"} // Change the type based on focus or value
            label={!isFocused && !updatedUser.dob ? "Date of Birth" : ""}
            name="dob"
            fullWidth
            variant="outlined"
            value={updatedUser.dob || ""}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={!isFocused && !updatedUser.dob ? "Date of Birth" : ""} // Set placeholder conditionally
            className={`relative ${isFocused || updatedUser.dob ? "pt-4" : ""}`} // Adjust padding for label space
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            select
            label="Gender"
            name="gender"
            fullWidth
            variant="outlined"
            value={updatedUser.gender || ""}
            onChange={handleChange}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Others">Others</MenuItem>
          </CustomTextField>
        </div>

        <div className="mb-4">
          <CustomTextField
            label="Address Line"
            type="text"
            name="addressLine"
            fullWidth
            variant="outlined"
            multiline
            value={updatedUser.addressLine || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            label="City"
            type="text"
            name="city"
            fullWidth
            variant="outlined"
            value={updatedUser.city || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            select
            label="State"
            name="state"
            fullWidth
            variant="outlined"
            value={updatedUser.state || ""}
            onChange={handleChange}
          >
            {states.map((state) => (
              <MenuItem key={state.value} value={state.value}>
                {state.label}
              </MenuItem>
            ))}
          </CustomTextField>
        </div>

        <div className="mb-4">
          <CustomTextField
            label="Pincode"
            type="text"
            name="pincode"
            fullWidth
            variant="outlined"
            value={updatedUser.pincode || ""}
            onChange={handleChange}
            inputProps={{ maxLength: 6 }}
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            label="Landmark"
            type="text"
            name="landmark"
            fullWidth
            variant="outlined"
            value={updatedUser.landmark || ""}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn bg-base-100 text-white w-full">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
