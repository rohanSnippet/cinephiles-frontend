import { Autocomplete, MenuItem, TextField } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { IoIosSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
// import { allStates } from "../../assets/states.json";

const config = {
  cUrl: "https://api.countrystatecity.in/v1/countries",
  ckey: "M0E4amQ3a2xydU14NkJHcWxPTG0weEI4UmN5eThwMmxqQUdIZXNsdg==",
};

const TheatreRequest = () => {
  const axiosSecure = useAxiosSecure();
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");

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
  const email = localStorage.getItem("username");
  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      username: email,
      contact: null,
      tname: null,
      tlocation: null,
      state: selectedState || "",
      address: null,
      tscreens: null,
      pan: null,
      accountNo: null,
      cgstNo: null,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = form;

  useEffect(() => {
    const loadIndianStates = async () => {
      try {
        const response = await fetch(`${config.cUrl}/IN/states`, {
          headers: { "X-CSCAPI-KEY": config.ckey },
        });
        const data = await response.json();
        setStates(data);
        // console.log(data);
      } catch (error) {
        console.error("Error loading Indian states:", error);
      }
    };

    loadIndianStates();
  }, [config]);

  const handleStateChange = async (e) => {
    const stateCode = e.target.value;
    const stateName = states.find((state) => state.iso2 === stateCode).name;
    setSelectedState(stateCode);
    setSelectedCity(""); // Reset city when state changes
    setCities([]); // Clear previous cities
    setValue("tlocation", ""); // Reset the location value in your form
    setValue("state", stateName);
    if (stateCode) {
      // Fetch cities of the selected Indian state
      try {
        const response = await fetch(
          `${config.cUrl}/IN/states/${stateCode}/cities`,
          { headers: { "X-CSCAPI-KEY": config.ckey } }
        );
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error("Error loading cities:", error);
      }
    }
  };

  const steps = [
    { step: 1, name: "Theatre details" },
    { step: 2, name: "Location" },
    { step: 3, name: "Documents Verification" },
    { step: 4, name: "Review Details" },
  ];

  const nextStep = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = (data) => {
    Swal.fire({
      title: "Save Theatre Details",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, make a request!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.post(`/make-request`, data);
          console.log(res);

          if (res) {
            Swal.fire({
              title: "Done!",
              text: "Your request has been Sent.",
              icon: "success",
            });
          }
        } catch (error) {
          console.error("Error saving movie:", error);
          Swal.fire({
            title: "Error!",
            text: "There was an error sending your request.",
            icon: "error",
          });
        }
      }
      navigate("/");
    });
  };

  const changeCurStep = (idx) => {
    setCurrentStep(idx + 1); // Set to the correct step
  };
  const getUniqueCities = (cities) => {
    return cities.filter(
      (city, index, self) =>
        index === self.findIndex((c) => c.name === city.name)
    );
  };

  const uniqueCities = getUniqueCities(cities); // Filter unique cities

  return (
    <div className="bg-gradient-to-br from-black to-black/80 min-h-screen">
      <div className="mx-[60vh] ring-gray-900 ring-offset-2 rounded-xl flex items-center bg-gradient-to-br from-black via-gray-900 to-black mb-2 shadow-2xl text-white shadow-slate-600 p-4 text-xl poppins-semibold gap-x-8">
        <IoIosSend size={32} className="ml-8" /> THEATRE REQUEST
      </div>

      <div className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Steps indicator */}
          <ul className="steps mb-8 text-white poppins-medium">
            {steps.map((stepObj, index) => (
              <button
                onClick={() => changeCurStep(index)}
                key={index}
                className={`step ${
                  currentStep >= stepObj.step ? "step-accent" : ""
                }`}
              >
                {stepObj.name}
              </button>
            ))}
          </ul>

          {/* Theatre details */}
          {currentStep === 1 && (
            <div className="gap-x-8 text-white">
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">
                  Theatre Name
                </label>
                <TextField
                  label="Theatre Name"
                  type="text"
                  name="tname"
                  className="w-[68vh]"
                  variant="outlined"
                  {...register("tname", { required: "Provide Theatre Name?" })}
                  sx={textFieldStyles}
                  error={!!errors.tname}
                  helperText={errors.tname ? errors.tname.message : ""}
                />
              </div>

              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">
                  Theatre Contact
                </label>
                <TextField
                  label="Contact"
                  type="number"
                  className="w-[68vh]"
                  name="contact"
                  variant="outlined"
                  {...register("contact", {
                    required: "Contact is required",
                    minLength: {
                      value: 10,
                      message: "Contact number must be at least 10 digits",
                    },
                    maxLength: {
                      value: 10,
                      message: "Contact number must be at most 15 digits",
                    },
                  })}
                  sx={textFieldStyles}
                  error={!!errors.contact}
                  helperText={errors.contact ? errors.contact.message : ""}
                />
              </div>

              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">
                  Number of Screens
                </label>
                <TextField
                  label="Screens"
                  type="number"
                  name="tscreens"
                  className="w-[68vh]"
                  variant="outlined"
                  {...register("tscreens", {
                    required: "Provide number of screens",
                  })}
                  sx={textFieldStyles}
                  error={!!errors.tscreens}
                  helperText={errors.tscreens ? errors.tscreens.message : ""}
                />
              </div>

              <div className="space-x-3 mt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn bg-white text-black w-20 rounded-xl hover:bg-success"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Location step */}
          {currentStep === 2 && (
            <div className="gap-x-8 mx-[60vh] text-white bg-gradient-to-br from-black via-gray-900 to-black mb-2 shadow-2xl rounded-xl">
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">
                  Theatre Location
                </label>
                <TextField
                  label="Address"
                  type="text"
                  className="w-[72vh] textarea"
                  name="address"
                  variant="outlined"
                  {...register("address", {
                    required: "Address is required",
                  })}
                  sx={textFieldStyles}
                  error={!!errors.address}
                  helperText={errors.address ? errors.address.message : ""}
                />
              </div>

              {/* State Select */}
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">
                  State
                </label>
                <TextField
                  select
                  label="State"
                  className="w-[68vh]"
                  name="state"
                  variant="outlined"
                  value={selectedState}
                  onChange={(e) => {
                    handleStateChange(e);
                  }}
                  sx={textFieldStyles}
                  error={!!errors.state}
                  helperText={errors.state ? errors.state.message : ""}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state.iso2} value={state.iso2}>
                      {state.name}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* City Select */}
              <div className="mb-4">
                <label className="block text-white text-center text-sm font-bold mb-2">
                  City
                </label>
                <Autocomplete
                  className="w-[68vh] ml-[11vh]"
                  options={uniqueCities}
                  getOptionLabel={(city) => city.name} // Display city names in the dropdown
                  value={
                    selectedCity
                      ? uniqueCities.find((city) => city.name === selectedCity)
                      : null
                  }
                  onChange={(e, newValue) => {
                    setSelectedCity(newValue ? newValue.name : ""); // Set selected city
                    setValue("tlocation", newValue ? newValue.name : ""); // Set form value
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="City"
                      variant="outlined"
                      sx={textFieldStyles}
                      error={!!errors.tlocation}
                      helperText={
                        errors.tlocation ? errors.tlocation.message : ""
                      }
                      disabled={!selectedState}
                    />
                  )}
                  disabled={!selectedState}
                  isOptionEqualToValue={(option, value) =>
                    option.name === value.name
                  }
                />
              </div>

              <div className="space-x-3 mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn bg-white text-black w-20 rounded-xl hover:bg-success"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn bg-white text-black w-20 rounded-xl hover:bg-success"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Pan , accNo , cgstNo */}
          {currentStep === 3 && (
            <div className="gap-x-8 text-white">
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-4">
                  Account Number
                </label>
                <TextField
                  label="Account No"
                  type="text"
                  className="w-[72vh] textarea"
                  name="accountNo"
                  variant="outlined"
                  {...register("accountNo", {
                    required: "accountNo is required",
                  })}
                  sx={textFieldStyles}
                  error={!!errors.accountNo}
                  helperText={errors.accountNo ? errors.accountNo.message : ""}
                />
              </div>

              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">
                  Pan Number
                </label>
                <TextField
                  label="Pan Number"
                  type="text"
                  className="w-[72vh] textarea"
                  name="pan"
                  variant="outlined"
                  {...register("pan", {
                    required: "pan is required",
                  })}
                  sx={textFieldStyles}
                  error={!!errors.pan}
                  helperText={errors.pan ? errors.pan.message : ""}
                />
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">
                  CGST Number(Optional)
                </label>
                <TextField
                  label="CGST No"
                  type="text"
                  className="w-[72vh] textarea"
                  name="cgstNo"
                  variant="outlined"
                  {...register("cgstNo", {
                    required: "cgstNo is required",
                  })}
                  sx={textFieldStyles}
                  error={!!errors.cgstNo}
                  helperText={errors.cgstNo ? errors.cgstNo.message : ""}
                />
              </div>

              <div className="space-x-3 mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn bg-white text-black w-20 rounded-xl hover:bg-success"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn bg-white text-black w-20 rounded-xl hover:bg-success"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {/* Review*/}
          {currentStep === 4 && (
            <div className="gap-x-8 text-white">
              <div className="mb-2">
                <label className="block text-white text-sm font-bold mb-4">
                  Theatre Name : {`${getValues("tname")}`}
                </label>
                <label className="block text-white text-sm font-bold mb-4">
                  Number of Screens in theatre : {`${getValues("tscreens")}`}
                </label>
                <label className="block text-white text-sm font-bold mb-4">
                  Theatre Contact Number: {`${getValues("contact")}`}
                </label>
                <label className="block text-white text-sm font-bold mb-4">
                  Location : {getValues("address")}, {getValues("tlocation")},{" "}
                  {getValues("state")}
                </label>
                <label className="block text-white text-sm font-bold mb-4">
                  PAN Number : {`${getValues("pan")}`}
                </label>
                <label className="block text-white text-sm font-bold mb-4">
                  Account Number : {`${getValues("accountNo")}`}
                </label>
              </div>

              <div className="space-x-3 mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn bg-white text-black w-20 rounded-xl hover:bg-success"
                >
                  Previous
                </button>
                <button
                  type="Submit"
                  className="btn bg-white text-black w-20 rounded-xl hover:bg-success"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TheatreRequest;
