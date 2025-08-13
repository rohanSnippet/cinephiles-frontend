import {
  Autocomplete,
  MenuItem,
  TextField,
  Typography,
  Box,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { IoIosSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";

const config = {
  cUrl: import.meta.env.VITE_LOCATION_URL,
  ckey: import.meta.env.VITE_LOCATION_KEY,
};

const FormContainer = styled(Box)({
  background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.8))",
  padding: "3rem",
  borderRadius: "1rem",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
  width: "100%",
  maxWidth: "700px",
  margin: "0 auto",
  marginTop: "2rem",
  marginBottom: "2rem",
  color: "white",
  fontFamily: "Poppins, sans-serif",
});

const HeaderBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  padding: "1rem 2rem",
  background: "linear-gradient(to right, #000, #333, #000)",
  borderRadius: "1rem",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  color: "white",
  fontWeight: "600",
  fontSize: "1.5rem",
  marginBottom: "2rem",
});

const StepIndicator = styled("ul")({
  display: "flex",
  justifyContent: "space-between",
  listStyle: "none",
  padding: 0,
  marginBottom: "3rem",
  "& .step": {
    cursor: "pointer",
    padding: "0.5rem 1rem",
    borderRadius: "2rem",
    border: "2px solid #555",
    color: "#aaa",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      borderColor: "#fff",
      color: "#fff",
    },
  },
  "& .step-active": {
    backgroundColor: "#3f51b5",
    color: "#fff",
    borderColor: "#3f51b5",
    boxShadow: "0 0 10px rgba(63, 81, 181, 0.7)",
  },
});

const TextFieldStyled = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#555",
    },
    "&:hover fieldset": {
      borderColor: "#888",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3f51b5",
    },
    "& .MuiInputBase-input": {
      color: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
    "&.Mui-focused": {
      color: "#3f51b5",
    },
  },
  "& .MuiFormHelperText-root": {
    color: "#f44336",
  },
});

const AutocompleteStyled = styled(Autocomplete)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#555",
    },
    "&:hover fieldset": {
      borderColor: "#888",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3f51b5",
    },
    "& .MuiInputBase-input": {
      color: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
    "&.Mui-focused": {
      color: "#3f51b5",
    },
  },
});

const FormButton = styled(Button)({
  backgroundColor: "#3f51b5",
  color: "white",
  fontWeight: "bold",
  borderRadius: "2rem",
  padding: "0.75rem 1.5rem",
  "&:hover": {
    backgroundColor: "#303f9f",
  },
});

const NavigationButton = styled(Button)({
  backgroundColor: "#fff",
  color: "black",
  fontWeight: "bold",
  borderRadius: "2rem",
  padding: "0.75rem 1.5rem",
  "&:hover": {
    backgroundColor: "#eee",
  },
});

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

  const handleStateChange = async (e) => {
    const stateCode = e.target.value;
    const stateName =
      states.find((state) => state.iso2 === stateCode)?.name || "";
    setSelectedState(stateCode);
    setSelectedCity("");
    setCities([]);
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

  const steps = [
    { step: 1, name: "Theatre Details" },
    { step: 2, name: "Location" },
    { step: 3, name: "Documents" },
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

  const onSubmit = (data) => {
    Swal.fire({
      title: "Confirm Theatre Details",
      text: "Are you sure you want to submit this request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3f51b5",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, submit it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.post(`/make-request`, data);
          if (res) {
            Swal.fire({
              title: "Success!",
              text: "Your request has been sent.",
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
        navigate("/");
      }
    });
  };

  const changeCurStep = (idx) => {
    setCurrentStep(idx + 1);
  };

  const getUniqueCities = (cities) => {
    return cities.filter(
      (city, index, self) =>
        index === self.findIndex((c) => c.name === city.name)
    );
  };

  const uniqueCities = getUniqueCities(cities);

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, #000, #333)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <HeaderBox>
        <IoIosSend size={32} /> THEATRE REQUEST
      </HeaderBox>
      <FormContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <StepIndicator>
            {steps.map((stepObj, index) => (
              <li
                key={index}
                className={`step ${
                  currentStep >= stepObj.step ? "step-accent" : ""
                }`}
                onClick={() => changeCurStep(index)}
              >
                {stepObj.name}
              </li>
            ))}
          </StepIndicator>

          {currentStep === 1 && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <TextFieldStyled
                label="Theatre Name"
                type="text"
                {...register("tname", {
                  required: "Theatre name is required.",
                })}
                error={!!errors.tname}
                helperText={errors.tname?.message}
                fullWidth
              />
              <TextFieldStyled
                label="Theatre Contact"
                type="number"
                {...register("contact", {
                  required: "Contact number is required.",
                  minLength: {
                    value: 10,
                    message: "Contact number must be 10 digits.",
                  },
                  maxLength: {
                    value: 10,
                    message: "Contact number must be 10 digits.",
                  },
                })}
                error={!!errors.contact}
                helperText={errors.contact?.message}
                fullWidth
              />
              <TextFieldStyled
                label="Number of Screens"
                type="number"
                {...register("tscreens", {
                  required: "Number of screens is required.",
                })}
                error={!!errors.tscreens}
                helperText={errors.tscreens?.message}
                fullWidth
              />
              <Box sx={{ textAlign: "right", marginTop: "1rem" }}>
                <FormButton type="button" onClick={nextStep}>
                  Next
                </FormButton>
              </Box>
            </Box>
          )}

          {currentStep === 2 && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <TextFieldStyled
                label="Address"
                type="text"
                {...register("address", { required: "Address is required." })}
                error={!!errors.address}
                helperText={errors.address?.message}
                fullWidth
                multiline
                rows={3}
              />
              <TextFieldStyled
                select
                label="State"
                value={selectedState}
                onChange={handleStateChange}
                error={!!errors.state}
                helperText={errors.state?.message}
                fullWidth
              >
                <MenuItem value="">Select State</MenuItem>
                {states.map((state) => (
                  <MenuItem key={state.iso2} value={state.iso2}>
                    {state.name}
                  </MenuItem>
                ))}
              </TextFieldStyled>
              <AutocompleteStyled
                options={uniqueCities}
                getOptionLabel={(city) => city.name}
                value={
                  selectedCity
                    ? uniqueCities.find((city) => city.name === selectedCity)
                    : null
                }
                onChange={(e, newValue) => {
                  setSelectedCity(newValue ? newValue.name : "");
                  setValue("tlocation", newValue ? newValue.name : "");
                }}
                renderInput={(params) => (
                  <TextFieldStyled
                    {...params}
                    label="City"
                    {...register("tlocation", {
                      required: "City is required.",
                    })}
                    error={!!errors.tlocation}
                    helperText={errors.tlocation?.message}
                  />
                )}
                disabled={!selectedState}
                isOptionEqualToValue={(option, value) =>
                  option.name === value.name
                }
                fullWidth
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1rem",
                }}
              >
                <NavigationButton type="button" onClick={prevStep}>
                  Previous
                </NavigationButton>
                <FormButton type="button" onClick={nextStep}>
                  Next
                </FormButton>
              </Box>
            </Box>
          )}

          {currentStep === 3 && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <TextFieldStyled
                label="Account Number"
                type="text"
                {...register("accountNo", {
                  required: "Account number is required.",
                })}
                error={!!errors.accountNo}
                helperText={errors.accountNo?.message}
                fullWidth
              />
              <TextFieldStyled
                label="PAN Number"
                type="text"
                {...register("pan", { required: "PAN number is required." })}
                error={!!errors.pan}
                helperText={errors.pan?.message}
                fullWidth
              />
              <TextFieldStyled
                label="CGST Number (Optional)"
                type="text"
                {...register("cgstNo")}
                fullWidth
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1rem",
                }}
              >
                <NavigationButton type="button" onClick={prevStep}>
                  Previous
                </NavigationButton>
                <FormButton type="button" onClick={nextStep}>
                  Next
                </FormButton>
              </Box>
            </Box>
          )}

          {currentStep === 4 && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  borderBottom: "2px solid #555",
                  paddingBottom: "0.5rem",
                }}
              >
                Review Details
              </Typography>
              <Box>
                <Typography variant="body1">
                  <span style={{ fontWeight: "bold", color: "#aaa" }}>
                    Theatre Name:
                  </span>{" "}
                  {getValues("tname")}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: "bold", color: "#aaa" }}>
                    Screens:
                  </span>{" "}
                  {getValues("tscreens")}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: "bold", color: "#aaa" }}>
                    Contact:
                  </span>{" "}
                  {getValues("contact")}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: "bold", color: "#aaa" }}>
                    Location:
                  </span>{" "}
                  {getValues("address")}, {getValues("tlocation")},{" "}
                  {getValues("state")}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: "bold", color: "#aaa" }}>
                    PAN Number:
                  </span>{" "}
                  {getValues("pan")}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: "bold", color: "#aaa" }}>
                    Account Number:
                  </span>{" "}
                  {getValues("accountNo")}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: "bold", color: "#aaa" }}>
                    CGST Number:
                  </span>{" "}
                  {getValues("cgstNo") || "N/A"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1rem",
                }}
              >
                <NavigationButton type="button" onClick={prevStep}>
                  Previous
                </NavigationButton>
                <FormButton
                  type="submit"
                  disabled={
                   !isValid
                  }
                >
                  Submit
                </FormButton>
              </Box>
            </Box>
          )}
        </form>
      </FormContainer>
    </Box>
  );
};

export default TheatreRequest;
