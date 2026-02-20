import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { IoIosSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";

// Configuration for Location API
const config = {
  cUrl: import.meta.env.VITE_LOCATION_URL,
  ckey: import.meta.env.VITE_LOCATION_KEY,
};

const TheatreRequest = () => {
  const axiosSecure = useAxiosSecure();
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedCity, setSelectedCity] = useState("");

  const email = localStorage.getItem("username");
  
  const form = useForm({
    mode: "all",
    defaultValues: {
      username: email,
      contact: "",
      tname: "",
      tlocation: "",
      state: "",
      address: "",
      tscreens: "",
      pan: "",
      accountNo: "",
      cgstNo: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = form;

  // --- Logic: Load States ---
  useEffect(() => {
    const loadIndianStates = async () => {
      try {
        const response = await fetch(`${config.cUrl}/IN/states`, {
          headers: { "X-CSCAPI-KEY": config.ckey },
        });
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error("Error loading Indian states:", error);
      }
    };
    loadIndianStates();
  }, []);

  // --- Logic: Handle State Change & Load Cities ---
  const handleStateChange = async (e) => {
    const stateCode = e.target.value;
    const stateName = states.find((state) => state.iso2 === stateCode)?.name || "";
    
    setSelectedState(stateCode);
    setSelectedCity("");
    setCities([]);
    
    // Update React Hook Form values
    setValue("tlocation", "");
    setValue("state", stateName);

    if (stateCode) {
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

  // --- Logic: Handle City Change ---
  const handleCityChange = (e) => {
     const cityName = e.target.value;
     setSelectedCity(cityName);
     setValue("tlocation", cityName);
  };

  const steps = [
    { step: 1, name: "Details" },
    { step: 2, name: "Location" },
    { step: 3, name: "Docs" },
    { step: 4, name: "Review" },
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

  const changeCurStep = async (idx) => {
    // Only allow jumping back or to the immediate next if valid
    if (idx + 1 < currentStep) {
        setCurrentStep(idx + 1);
    }
  };

  const onSubmit = (data) => {
    Swal.fire({
      title: "Confirm Theatre Details",
      text: "Are you sure you want to submit this request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, submit it!",
      background: "#1a1a1a",
      color: "#fff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.post(`/make-request`, data);
          if (res) {
            Swal.fire({
              title: "Success!",
              text: "Your request has been sent.",
              icon: "success",
              background: "#1a1a1a",
              color: "#fff"
            });
          }
        } catch (error) {
          console.error("Error saving request:", error);
          Swal.fire({
            title: "Error!",
            text: "There was an error sending your request.",
            icon: "error",
            background: "#1a1a1a",
            color: "#fff"
          });
        }
        navigate("/");
      }
    });
  };

  const getUniqueCities = (cities) => {
    return cities.filter(
      (city, index, self) =>
        index === self.findIndex((c) => c.name === city.name)
    );
  };

  const uniqueCities = getUniqueCities(cities);

  // --- Helper Components for Styles ---
  const InputGroup = ({ label, error, children }) => (
    <div className="space-y-2">
      <label className="text-gray-300 text-sm font-medium ml-1">{label}</label>
      <div className="relative">
        {children}
      </div>
      {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
    </div>
  );

  const baseInputClass = "w-full px-4 py-3 bg-transparent border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8 bg-black">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 md:top-6 md:right-6 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 z-10"
      >
        <span className="hidden sm:inline">Home</span>
      </button>

      <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-2xl py-8 md:py-10 px-4 md:px-8 shadow-2xl shadow-gray-800 border border-gray-800">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2 text-white">
             <IoIosSend size={28} className="text-blue-500" />
             <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
               Theatre Request
             </h1>
          </div>
          <p className="text-gray-400 text-sm text-center">
            Partner with us to manage your shows
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
            <div className="flex justify-between items-center relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-700 -z-10"></div>
                
                {steps.map((s, i) => {
                    const isActive = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;
                    return (
                        <div 
                            key={i} 
                            onClick={() => changeCurStep(i)}
                            className={`flex flex-col items-center cursor-pointer group bg-gray-900 px-2`}
                        >
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 
                                ${isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-800 border-gray-600 text-gray-400 group-hover:border-gray-400"}
                                ${isCurrent ? "ring-4 ring-blue-500/30" : ""}
                            `}>
                                {s.step}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isActive ? "text-blue-400" : "text-gray-500"}`}>
                                {s.name}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <InputGroup label="Theatre Name" error={errors.tname?.message}>
                <input
                  className={baseInputClass}
                  placeholder="Enter Theatre Name"
                  {...register("tname", { required: "Theatre name is required." })}
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="Contact Number" error={errors.contact?.message}>
                    <input
                      type="number"
                      className={baseInputClass}
                      placeholder="10-digit Mobile Number"
                      {...register("contact", {
                        required: "Contact number is required.",
                        minLength: { value: 10, message: "Must be 10 digits." },
                        maxLength: { value: 10, message: "Must be 10 digits." },
                      })}
                    />
                  </InputGroup>

                  <InputGroup label="Number of Screens" error={errors.tscreens?.message}>
                    <input
                      type="number"
                      className={baseInputClass}
                      placeholder="e.g. 4"
                      {...register("tscreens", { required: "Required." })}
                    />
                  </InputGroup>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <InputGroup label="Address" error={errors.address?.message}>
                <textarea
                  rows="3"
                  className={baseInputClass}
                  placeholder="Street Address, Area, Landmark..."
                  {...register("address", { required: "Address is required." })}
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup label="State" error={errors.state?.message}>
                    <select
                        className={`${baseInputClass} appearance-none cursor-pointer`}
                        value={selectedState}
                        onChange={handleStateChange}
                    >
                        <option value="" className="bg-gray-800 text-gray-400">Select State</option>
                        {states.map((st) => (
                            <option key={st.iso2} value={st.iso2} className="bg-gray-800 text-white">
                                {st.name}
                            </option>
                        ))}
                    </select>
                 </InputGroup>

                 <InputGroup label="City" error={errors.tlocation?.message}>
                    <select
                        className={`${baseInputClass} appearance-none cursor-pointer`}
                        disabled={!selectedState}
                        onChange={handleCityChange}
                        // We rely on getValues or local state for the value logic here
                        defaultValue="" 
                    >
                         <option value="" className="bg-gray-800">Select City</option>
                         {uniqueCities.map((c, i) => (
                             <option key={i} value={c.name} className="bg-gray-800">
                                 {c.name}
                             </option>
                         ))}
                    </select>
                 </InputGroup>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-white border border-gray-600 px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
               <InputGroup label="Account Number" error={errors.accountNo?.message}>
                <input
                  type="text"
                  className={baseInputClass}
                  placeholder="Bank Account Number"
                  {...register("accountNo", { required: "Account No. is required." })}
                />
              </InputGroup>

              <InputGroup label="PAN Number" error={errors.pan?.message}>
                <input
                  type="text"
                  className={baseInputClass}
                  placeholder="Permanent Account Number"
                  {...register("pan", { required: "PAN is required." })}
                />
              </InputGroup>

              <InputGroup label="CGST Number (Optional)" error={errors.cgstNo?.message}>
                <input
                  type="text"
                  className={baseInputClass}
                  placeholder="GSTIN"
                  {...register("cgstNo")}
                />
              </InputGroup>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-white border border-gray-600 px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
               <div className="border-b border-gray-700 pb-2">
                   <h2 className="text-xl text-white font-semibold">Review Details</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                   <div className="space-y-1">
                       <p className="text-gray-400">Theatre Name</p>
                       <p className="text-white text-lg font-medium">{getValues("tname")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-gray-400">Screens</p>
                       <p className="text-white text-lg font-medium">{getValues("tscreens")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-gray-400">Contact</p>
                       <p className="text-white text-lg font-medium">{getValues("contact")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-gray-400">Location</p>
                       <p className="text-white text-lg font-medium">
                           {getValues("tlocation")}, {getValues("state")}
                       </p>
                       <p className="text-gray-500 text-xs">{getValues("address")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-gray-400">PAN Number</p>
                       <p className="text-white text-lg font-medium">{getValues("pan")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-gray-400">Account Number</p>
                       <p className="text-white text-lg font-medium">{getValues("accountNo")}</p>
                   </div>
               </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-white border border-gray-600 px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  Submit Request
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