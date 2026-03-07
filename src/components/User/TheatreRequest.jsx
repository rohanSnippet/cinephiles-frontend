import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { IoChevronBackSharp } from "react-icons/io5";
import {baseURL} from "../Services/URL"

// Configuration for Location API
const config = {
  cUrl: import.meta.env.VITE_LOCATION_URL,
  ckey: import.meta.env.VITE_LOCATION_KEY,
};

// MOVED OUTSIDE to prevent the input focus-loss bug!
const InputGroup = ({ label, error, children }) => (
  <div className="space-y-2">
    <label className="text-white/70 text-xs poppins-medium tracking-widest uppercase">{label}</label>
    <div className="relative">
      {children}
    </div>
    {error && <p className="text-red-400 text-xs mt-1 poppins-medium">{error}</p>}
  </div>
);

const baseInputClass = "w-full px-4 py-3 bg-[#111] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors poppins-medium text-sm rounded-sm";

const TheatreRequest = () => {
  const axiosSecure = useAxiosSecure();
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
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

    setValue("tlocation", "", { shouldValidate: true });
    setValue("state", stateName, { shouldValidate: true });

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
     setValue("tlocation", cityName, { shouldValidate: true });
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
    if (idx + 1 < currentStep) {
        setCurrentStep(idx + 1);
    }
  };

  const onSubmit = (data) => {
    Swal.fire({
      title: "Confirm Application",
      text: "Are you sure you want to submit this theatre request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#fff",
      cancelButtonColor: "rgba(255,255,255,0.1)",
      confirmButtonText: "<span style='color:black'>Submit Request</span>",
      cancelButtonText: "Review Again",
      background: "#111",
      color: "#fff",
      customClass: { popup: 'border border-white/10 rounded-sm' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.post(`${baseURL}/make-request`, data);
          if (res) {
            Swal.fire({
              title: "Application Sent",
              text: "Our team will review your details shortly.",
              icon: "success",
              background: "#111",
              color: "#fff",
              showConfirmButton: false,
              timer: 2000,
              customClass: { popup: 'border border-white/10 rounded-sm' }
            });
            navigate("/");
          }
        } catch (error) {
          console.error("Error saving request:", error);
          Swal.fire({
            title: "Transmission Failed",
            text: "There was an error sending your request.",
            icon: "error",
            background: "#111",
            color: "#fff",
            customClass: { popup: 'border border-white/10 rounded-sm' }
          });
        }
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

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 relative flex justify-center items-center">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:left-12 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <IoChevronBackSharp size={24} />
        <span className="poppins-medium text-sm tracking-widest uppercase hidden md:block">Back to Home</span>
      </button>

      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-2xl md:text-3xl poppins-semibold tracking-wide text-center mb-2">
             PARTNER WITH US
          </h1>
          <p className="text-white/50 text-xs text-center poppins-medium tracking-widest uppercase">
            Theatre Registration Form
          </p>
        </div>

        {/* Sharp Diamond Stepper */}
        <div className="mb-12 px-4">
            <div className="flex justify-between items-center relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-[10px] transform -translate-y-1/2 w-full h-[1px] bg-white/10 -z-10"></div>

                {steps.map((s, i) => {
                    const isActive = currentStep >= s.step;
                    return (
                        <div
                            key={i}
                            onClick={() => changeCurStep(i)}
                            className="flex flex-col items-center cursor-pointer bg-[#0a0a0a] px-2 md:px-4"
                        >
                            <div className={`w-4 h-4 rotate-45 border transition-all duration-500
                                ${isActive ? "bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "bg-[#111] border-white/20"}
                            `}></div>
                            <span className={`text-[10px] md:text-xs mt-4 poppins-medium tracking-widest uppercase transition-colors ${isActive ? "text-white" : "text-white/30"}`}>
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
            <div className="space-y-6 animate-fadeIn">
              <InputGroup label="Theatre Name" error={errors.tname?.message}>
                <input
                  className={baseInputClass}
                  placeholder="Official Theatre Name"
                  {...register("tname", { required: "Theatre name is required." })}
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Contact Number" error={errors.contact?.message}>
                    <input
                      type="number"
                      className={baseInputClass}
                      placeholder="10-digit Mobile"
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

              <div className="flex justify-end pt-8">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-white text-black px-10 py-3 font-semibold poppins-medium tracking-widest uppercase hover:bg-neutral-300 transition-colors text-sm rounded-sm"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <InputGroup label="Full Address" error={errors.address?.message}>
                <textarea
                  rows="3"
                  className={`${baseInputClass} resize-none`}
                  placeholder="Street Address, Area, Landmark..."
                  {...register("address", { required: "Address is required." })}
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InputGroup label="State" error={errors.state?.message}>
                    <select
                        className={`${baseInputClass} appearance-none cursor-pointer`}
                        value={selectedState}
                        onChange={handleStateChange}
                    >
                        <option value="" className="bg-[#111] text-white/50">Select State</option>
                        {states.map((st) => (
                            <option key={st.iso2} value={st.iso2} className="bg-[#111] text-white">
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
                        value={selectedCity}
                    >
                         <option value="" className="bg-[#111] text-white/50">Select City</option>
                         {uniqueCities.map((c, i) => (
                             <option key={i} value={c.name} className="bg-[#111] text-white">
                                 {c.name}
                             </option>
                         ))}
                    </select>
                 </InputGroup>
              </div>

              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-white border border-white/20 px-8 py-3 poppins-medium tracking-widest uppercase hover:bg-white/10 transition-colors text-sm rounded-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-white text-black px-10 py-3 font-semibold poppins-medium tracking-widest uppercase hover:bg-neutral-300 transition-colors text-sm rounded-sm"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
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

              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-white border border-white/20 px-8 py-3 poppins-medium tracking-widest uppercase hover:bg-white/10 transition-colors text-sm rounded-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-white text-black px-10 py-3 font-semibold poppins-medium tracking-widest uppercase hover:bg-neutral-300 transition-colors text-sm rounded-sm"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-fadeIn">

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 bg-[#111] p-6 border border-white/5 rounded-sm">
                   <div className="space-y-1">
                       <p className="text-white/40 text-[10px] poppins-medium tracking-widest uppercase">Theatre Name</p>
                       <p className="text-white poppins-medium">{getValues("tname")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-white/40 text-[10px] poppins-medium tracking-widest uppercase">Screens</p>
                       <p className="text-white poppins-medium">{getValues("tscreens")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-white/40 text-[10px] poppins-medium tracking-widest uppercase">Contact</p>
                       <p className="text-white poppins-medium">{getValues("contact")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-white/40 text-[10px] poppins-medium tracking-widest uppercase">Location</p>
                       <p className="text-white poppins-medium">
                           {getValues("tlocation")}, {getValues("state")}
                       </p>
                       <p className="text-white/50 text-xs mt-1 leading-relaxed">{getValues("address")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-white/40 text-[10px] poppins-medium tracking-widest uppercase">PAN Number</p>
                       <p className="text-white poppins-medium">{getValues("pan")}</p>
                   </div>
                   <div className="space-y-1">
                       <p className="text-white/40 text-[10px] poppins-medium tracking-widest uppercase">Account Number</p>
                       <p className="text-white poppins-medium">{getValues("accountNo")}</p>
                   </div>
               </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-white border border-white/20 px-8 py-3 poppins-medium tracking-widest uppercase hover:bg-white/10 transition-colors text-sm rounded-sm"
                >
                  Edit
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="bg-white text-black px-10 py-3 font-semibold poppins-medium tracking-widest uppercase hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm rounded-sm"
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