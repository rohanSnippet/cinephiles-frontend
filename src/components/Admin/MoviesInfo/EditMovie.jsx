import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import certifications from "../../../assets/certification.json";
import MultiSelect from "../../Common/MultiSelect";
import MyDropzone from "../../Common/MyDropzone";
import { RiMovieFill } from "react-icons/ri";
import { BiImageAdd } from "react-icons/bi";
import { Controller, useForm } from "react-hook-form";
import { HiMiniUserGroup } from "react-icons/hi2";
import { Checkbox } from "@mui/material";
import Swal from "sweetalert2";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { SiTicktick } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import languages from "../../../assets/languages.json";
import Select from "react-select";
import { isEqual } from "lodash";

const EditMovie = () => {
  const genres = [
    { label: "Action", value: "action" },
    { label: "Comedy", value: "comedy" },
    { label: "Thriller", value: "thriller" },
    { label: "Romance", value: "romance" },
    { label: "Horror", value: "horror" },
    { label: "Fantasy", value: "fantasy" },
    { label: "Adventure", value: "adventure" },
    { label: "Sci-Fi", value: "sci-Fi" },
  ];
  const formats = [
    { label: "2D", value: "2D" },
    { label: "3D", value: "3D" },
    { label: "IMAX", value: "IMAX" },
    { label: "IMAX 3D", value: "IMAX 3D" },
    { label: "4DX", value: "4DX" },
  ];
  const CrewRoles = [
    { label: "Director", value: "Director" },
    { label: "Producer", value: "Producer" },
    { label: "Cinematography", value: "Cinematography" },
    { label: "Music Composer", value: "Music Composer" },
    { label: "Writer", value: "Writer" },
    { label: "Screenplay", value: "Screenplay" },
    { label: "Dialog Writer", value: "Dialog Writer" },
  ];
  const [movie, setMovie] = useState({});
  const [trailers, setTrailers] = useState({});
  const [trailerLang, setTrailerLang] = useState("");
  const [trailerURL, setTrailerURL] = useState("");
  const [crew, setCrew] = useState([]);
  const [cast, setCast] = useState({});
  const [name, setName] = useState("");
  const [roles, setRoles] = useState([]);
  const [actor, setActor] = useState("");
  const [char, setChar] = useState("");
  const [posterImage, setPosterImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMovie } = location.state;
  const axiosSecure = useAxiosSecure();

  const defaultValues = {
    title: selectedMovie?.title || "",
    runtime: selectedMovie?.runtime || null,
    description: selectedMovie?.description || "",
    certification: selectedMovie?.certification || "",
    genre: selectedMovie?.genre || [],
    languages: selectedMovie?.languages || [],
    formats: selectedMovie?.formats || [],
    ratings: selectedMovie?.ratings || 0,
    votes: selectedMovie?.votes || 0,
    likes: selectedMovie?.likes || 0,
    cast: selectedMovie?.cast || {},
    crew: selectedMovie?.crew || [],
    poster: selectedMovie?.poster || "",
    banner: selectedMovie?.banner || "",
    trailers: selectedMovie?.trailers || {},
    releaseDate: selectedMovie?.releaseDate || "",
    bookingOpen: selectedMovie?.bookingOpen || false,
    promoted: selectedMovie?.promoted || false,
  };
  
  const form = useForm({ defaultValues });
  
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = form;

  const certificationValue = watch("certification");
  const isAddTrailerDisabled = !(trailerLang && trailerURL);
  const isAddCrewDisabled = !(name && roles.length > 0);
  const isAddCastDisabled = !(char && actor);
  const bookingOpenValue = watch("bookingOpen")
  const promotedValue = watch("promoted")

  const onSubmit = (data) => {
    const runtime = parseInt(data.runtime, 10);
    // const certification = data.certificationValue;

    const genre = data.genre.map(
      (g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
    );
    const cast = { ...data.cast };

    const crew = [...data.crew];

    const releaseDate = new Date(data.releaseDate).toISOString().split("T")[0];

    const movieData = {
      title: data.title,
      runtime,
      description: data.description,
      certification: certificationValue,
      genre,
      languages: data.languages,
      formats: data.formats,
      ratings: data.ratings,
      votes: data.votes,
      likes: data.likes,
      cast,
      crew,
      poster: data?.poster || selectedMovie.poster,
      banner: data?.banner || selectedMovie.banner,
      trailers: data.trailers,
      releaseDate,
      bookingOpen: data.bookingOpen,
      promoted: data.promoted,
    };
    handleEditMovie(movieData);
  };
  const handleEditMovie = async (movieData) => {
    console.log(movieData);
    Swal.fire({
      title: "Delete Movie",
      text: "You can update this later",
      icon: "info",
      background: "rgba(43, 43, 46, 0.845)",
      color: "white",
      showCancelButton: true,
      confirmButtonColor: "rgb(28, 188, 28, 0.941)",
      cancelButtonColor: "#d33",
      cancelButtonText: "Keep Updating",
      confirmButtonText: "Save",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.put(
            `/movie/edit-movie/${selectedMovie.id}`,
            movieData
          );
          console.log(res.data);
          if (res) {
            Swal.fire({
              title: "Done!",
              text: "Movie has been updated.",
              icon: "success",
              background: "rgba(43, 43, 46, 0.845)",
              color: "white",
            });
          }
          navigate("/admin/movie-dashboard");
        } catch (error) {
          console.error("Error saving movie:", error);
          Swal.fire({
            title: "Error!",
            text: "There was an error updated the movie.",
            icon: "error",
          });
        }
      }
    });
  };
  useEffect(() => {
    setValue("poster", movie.poster);
    setValue("banner", movie.banner);
    setTrailers(selectedMovie.trailers);
    setCast(selectedMovie.cast);
    setCrew(selectedMovie.crew);
  }, [movie, setValue]);

  //Trailers //
  const handleLangChange = async (event) => {
    setTrailerLang(event.target.value);
  };

  const handleURLChange = (event) => {
    setTrailerURL(event.target.value);
  };

  const handleAddTrailer = () => {
    if (trailerLang && trailerURL) {
      const updatedTrailers = {
        ...getValues("trailers"),
        [trailerLang]: trailerURL,
      };
      setTrailers(updatedTrailers);
      setValue("trailers", updatedTrailers);

      setTrailerLang("");
      setTrailerURL("");
    }
  };
  const handleDeleteTrailer = (language, urlToDelete) => {
    // Create a deep copy of the trailers array to avoid mutating state directly
    const updatedTrailers = trailers.map((trailer) => {
      if (trailer.language === language) {
        // Filter out the URL to delete
        return {
          ...trailer,
          trailerUrl: trailer.trailerUrl.filter((url) => url !== urlToDelete),
        };
      }
      return trailer;
    });
  
    // Remove objects with empty trailerUrl arrays
    const filteredTrailers = updatedTrailers.filter(
      (trailer) => trailer.trailerUrl.length > 0
    );
  
    // Update the state and form value
    setTrailers(filteredTrailers);
    setValue("trailers", filteredTrailers);
  
  };
  

const getYouTubeVideoId = (url) => {
  const regex = /(?:https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/))([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null; // Return the video ID if found, otherwise null
};
  // cast and crew //
  //crew
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleRolesChange = (selectedOptions) => {
    setRoles(selectedOptions.map((option) => option.value));
  };
  //cast
  const handleActorChange = (event) => {
    setActor(event.target.value);
  };
  const handleCharChange = (event) => {
    setChar(event.target.value);
  };
  const handleAddCast = () => {
    if (char && actor) {
      const updatedCast = { ...getValues("cast"), [actor]: char };
      setCast(updatedCast);
      setValue("cast", updatedCast);
      setChar("");
      setActor("");
    }
  };
  const handleAddCrew = () => {
    if (name && roles.length > 0) {
      // Create a new crew member object
      const newCrewMember = { name, roles };

      // Add to the existing crew array
      const updatedCrew = [...crew, newCrewMember];

      // Update the state and form values
      setCrew(updatedCrew);
      setValue("crew", updatedCrew);

      // Clear input fields after adding a crew member
      setName("");
      setRoles([]);
    }
  };
  const handleRemoveCrew = (index, team) => {
    if (team == "crew") {
      const updatedCrew = crew.filter((_, idx) => idx !== index);

      // Update the state and form values
      setCrew(updatedCrew);
      setValue("crew", updatedCrew);
      setValue("crew", updatedCrew);
    } else if (team == "cast") {
      const updatedCast = { ...cast }; // Create a copy of the current cast object
      const castKeyToRemove = Object.keys(cast)[index]; // Get the key of the actor to remove
      delete updatedCast[castKeyToRemove]; // Delete the key-value pair
      setCast(updatedCast); // Update the cast state
      setValue("cast", updatedCast);
    }
  };
  //Poster and banner
  const saveImage = async (image, name) => {
    if (name === "poster") {
      setMovie((prevMovie) => ({
        ...prevMovie,
        poster: image,
      }));
      console.log(image ? "Banner saved" : "Banner set to null");
    } else if (name === "banner") {
      setMovie((prevMovie) => ({
        ...prevMovie,
        banner: image,
      }));
      console.log(image ? "Banner saved" : "Banner set to null");
    }
  };
  const removeImage = (name) => {
    if (name === "poster") {
      setMovie((prevMovie) => ({
        ...prevMovie,
        poster: "",
      }));
      setPosterImage("");
    } else if (name === "banner") {
      setMovie((prevMovie) => ({
        ...prevMovie,
        banner: "",
      }));
      setBannerImage("");
    }
  };
  const closeDialog1 = () => {
    document.getElementById("my_modal_1").close();
  };
  const closeDialog2 = () => {
    document.getElementById("my_modal_2").close();
  };
 
  //styles
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
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "transparent", // Dark background
      color: "#fff",
      border: "1px solid gray", // Border color
      minHeight: "52px",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#4444448a", // Background for the tag
      color: "#fff", // Tag text color
      maxWidth: "500px", // Set max width for the tags here
      overflow: "hidden", // Hide overflow if the text is too long
      textOverflow: "ellipsis", // Add ellipsis for long text
      whiteSpace: "nowrap", // Prevent wrapping
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "white", // Tag label text color
      fontSize: "1rem", // Adjust font size if needed
      maxWidth: "200px", // Set width for the label text
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#ddd",
      ":hover": {
        backgroundColor: "#555",
        color: "#fff",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#aaa",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#333",
      color: "#fff",
    }),
  };

  const handleImageChange = (imageUrl, name) => {
  if (name === 'poster') {
    setPosterImage(imageUrl);
     saveImage(imageUrl, name);
     closeDialog1();
  }else{
    setBannerImage(imageUrl);
    saveImage(imageUrl, name);
    closeDialog2();
  }
};
  return (
    <div>
      <div className="ring-2 ring-gray-900 ring-offset-2 rounded-xl flex items-center bg-gradient-to-br from-black via-gray-900 to-black mb-2 shadow-2xl text-white shadow-slate-600 p-4 text-xl poppins-semibold gap-x-8">
        <RiMovieFill size={32} className="ml-8" /> ADD NEW MOVIE
      </div>
      <div className="rounded-xl w-full h-full poppins-regular">
        {/* modal for poster */}
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box bg-gray-900 text-white">
            {/* Dropzone to upload image */}
            <MyDropzone
              onImageChange={handleImageChange} // Use the new prop
              currentImage={posterImage} // Pass the current image state
              name="poster"
              onRemoveImage={removeImage} // Pass the remove function
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
                name="poster"
                className="w-[58vh]"
                variant="outlined"
                value={posterImage}
                onChange={(e) => setPosterImage(e.target.value)}
                sx={textFieldStyles}
              />

              {/* Remove button to set image to null */}
              <button
                className="btn bg-gray-700 text-white mt-2"
                onClick={() => removeImage("poster")}
              >
                Remove
              </button>
            </div>

            <div className="modal-action">
              {/* Save button - saves image and closes modal */}
              <button
                className="btn bg-gray-700 text-white"
                onClick={() => {
                  saveImage(posterImage, "poster");
                  closeDialog1();
                }}
              >
                Save
              </button>

              {/* Close button - just closes modal without saving */}
              <button
                className="btn bg-gray-700 text-white"
                onClick={closeDialog1}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>

        {/* main form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-[160%] pl-12  mx-auto rounded-xl bg-gradient-to-br from-black via-gray-900 to-slate-900 shadow-2xl space-y-10 shadow-slate-600 p-8"
        >
          {/* Poster, banner */}
          <div className="space-x-8 text-center">
            {posterImage ? (
              <button
                type="button"
                className="btn h-[50vh] w-[32vh] hover:text-opacity-100 text-opacity-0 border-2 border-doubled border-green-600/40  hover:bg-gray-700 bg-green-800 text-white"
                onMouseOver={() => {
                  document
                    .getElementById("update-poster")
                    .classList.replace("opacity-0", "opacity-100");
                }}
                onMouseLeave={() => {
                  document
                    .getElementById("update-poster")
                    .classList.replace("opacity-100", "opacity-0");
                }}
                onClick={() =>
                  document.getElementById("my_modal_1").showModal()
                }
                style={{
                  backgroundImage: `url(${posterImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <SiTicktick size={64} />
              </button>
            ) : (
              <button
                type="button"
                style={{
                  backgroundImage: `url(${selectedMovie.poster})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                onMouseOver={() => {
                  document
                    .getElementById("update-poster")
                    .classList.replace("opacity-0", "opacity-100");
                }}
                onMouseLeave={() => {
                  document
                    .getElementById("update-poster")
                    .classList.replace("opacity-100", "opacity-0");
                }}
                className=" relative btn h-[50vh] w-[32vh] text-opacity-0 hover:text-opacity-100 border-gray-600 text-white"
                onClick={() =>
                  document.getElementById("my_modal_1").showModal()
                }
              >
                <BiImageAdd size={64} />
                <span
                  className="w-full rounded-b-lg absolute bottom-0 text-lg opacity-0 font-bold bg-black/80"
                  id="update-poster"
                >
                  {" "}
                  Update Movie Poster
                </span>
              </button>
            )}

            {bannerImage ? (
              <button
                type="button"
                className="btn w-[68vh] h-[38vh] border-gray-600 text-white"
                onClick={() => {
                  // Open another dialog for banner
                  document.getElementById("my_modal_2").showModal();
                }}
                style={{
                  background: `url(${getValues("banner")})`,
                  backgroundPosition: `center`,
                  backgroundSize: `contain`,
                  backgroundRepeat: `no-repeat`,
                }}
              >
                <SiTicktick size={24} />
              </button>
            ) : (
              <button
                type="button"
                className="relative btn w-[68vh] h-[38vh] hover:bg-opacity-100 hover:text-opacity-100 text-opacity-0 border-gray-600 text-white"
                onMouseOver={() => {
                  document
                    .getElementById("update-banner")
                    .classList.replace("opacity-0", "opacity-100");
                }}
                onMouseLeave={() => {
                  document
                    .getElementById("update-banner")
                    .classList.replace("opacity-100", "opacity-0");
                }}
                onClick={() => {
                  // Open another dialog for banner
                  document.getElementById("my_modal_2").showModal();
                }}
                style={{
                  background: `url(${selectedMovie.banner})`,
                  backgroundPosition: `center`,
                  backgroundSize: `contain`,
                  backgroundRepeat: `no-repeat`,
                }}
              >
                <BiImageAdd size={64} />{" "}
                <span
                  className="absolute bottom-0 w-full text-xl opacity-0 font-bold text-white bg-black/60 "
                  id="update-banner"
                >
                  Update Movie Banner
                </span>
              </button>
            )}
          </div>
          {/* title, runtime, certification */}
          <div className=" flex gap-x-8 text-white">
            <div className="mb-2">
              <label
                htmlFor="title-multiselect"
                className="block text-white text-sm font-bold mb-2"
              >
                Title of the movie
              </label>
              <TextField
                label="Title"
                type="text"
                name="title"
                className="w-[68vh]"
                variant="outlined"
                {...register("title", { required: "Movie without title?" })}
                sx={textFieldStyles}
                error={!!errors.title}
                helperText={errors.title ? errors.title.message : ""}
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="runtime-multiselect"
                className="block text-white text-sm font-bold mb-2"
              >
                Runtime
              </label>
              <TextField
                label="Runtime(mins)"
                type="number"
                className="w-[30vh]"
                name="runtime"
                variant="outlined"
                {...register("runtime", {
                  required: "Uh-oh, our movie's missing runtime",
                })}
                sx={textFieldStyles}
                error={!!errors.runtime}
                helperText={errors.runtime ? errors.runtime.message : ""}
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="languages-multiselect"
                className="block text-white text-sm font-bold mb-2"
              >
                Certification
              </label>
              <TextField
                select
                className="w-[30vh] space-x-2"
                name="certification"
                variant="outlined"
                value={certificationValue || ""}
                {...register("certification", { required: true })}
                onChange={(e) => setValue("certification", e.target.value)} // Updates the form state
                sx={textFieldStyles}
              >
                {certifications.map((cert) => (
                  <MenuItem
                    sx={{ fontFamily: "poppins" }}
                    key={cert.value}
                    value={cert.value}
                  >
                    {cert.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>
          {/* desc, genre */}
          <div className=" flex gap-x-7">
            <div className="mb-2">
              <label
                htmlFor="description-multiselect"
                className="block text-white text-sm font-bold mb-2"
              >
                Summary of the movie
              </label>
              <TextField
                label="Description"
                type="text"
                name="description"
                className="w-[85vh]"
                value={selectedMovie.description}
                variant="outlined"
                {...register("description", {
                  required: "Tell something about the story",
                })}
                error={!!errors.description}
                helperText={
                  errors.description ? errors.description.message : ""
                }
                sx={textFieldStyles}
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="genre-multiselect"
                className="block text-white text-sm font-bold mb-2"
              >
                Select Genres
              </label>
              <Select
                isMulti
                id="genre-multiselect"
                options={genres}
                name="genre"
                labelField="label"
                valueField="value"
                placeholder={selectedMovie.genre.map((g) => g).join("/")}
                onChange={(selectedOptions) =>
                  setValue(
                    "genre",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : []
                  )
                }
                styles={customStyles}
              />
            </div>
          </div>
          {/* Languages . experiences . bookings open/not open*/}
          <div className=" flex gap-x-10">
            <div className="mb-2">
              <label
                htmlFor="languages-multiselect"
                className="block text-white text-sm font-bold mb-2"
              >
                Languages
              </label>
              <Select
                isMulti
                options={languages}
                name="languages"
                labelField="label"
                valueField="value"
                //required
                placeholder={selectedMovie.languages.map((l) => l).join("/")}
                onChange={(selectedOptions) =>
                  setValue(
                    "languages",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : []
                  )
                }
                styles={customStyles}
              />
            </div>

            <div className="mb-2">
              <label
                htmlFor="formats-multiselect"
                className="block text-white text-sm font-bold mb-2"
              >
                Experiences available
              </label>
              <Select
                isMulti
                options={formats}
                name="formats"
                labelField="label"
                valueField="value"
                // required
                styles={customStyles}
                placeholder={selectedMovie.formats.map((f) => f).join("/")}
                onChange={(selectedOptions) =>
                  setValue(
                    "formats",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : []
                  )
                }
              />
            </div>

            <div className="mb-2">
              <label
                htmlFor="formats-multiselect"
                className="block text-white text-sm font-bold mb-2"
              >
                Release Date
              </label>
              <TextField
                type="date"
                name="releaseDate"
                className="w-[30vh]"
                variant="outlined"
                {...register("releaseDate", {
                  valueAsDate: true,
                  required: {
                    value: true,
                    message: "Atleast provide a tentative date",
                  },
                })}
                error={!!errors.releaseDate}
                helperText={
                  errors.releaseDate ? errors.releaseDate.message : ""
                }
                sx={textFieldStyles}
              />
            </div>
          </div>

          {/* Add trailers */}
          <div className="rounded-lg border-gray-700 border-2 bg-black/30">
            {" "}
            <h2 className="poppins-semibold text-lg text-white text-center">
              Add Trailers
            </h2>
            <table className="table table-zebra">
              <thead>
                <tr className="">
                  <th></th>
                  <th>
                    <Controller
                      name="language"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          label="Language"
                          className="w-[45vh] outline-none"
                          value={trailerLang}
                          onChange={(e) => {
                          
                            handleLangChange(e);
                            field.onChange(e);
                          }}
                          variant="outlined"
                          sx={textFieldStyles}
                        >
                          {languages.map((bs, i) => (
                            <MenuItem
                              sx={{ fontFamily: "poppins" }}
                              // key={bs.value}
                              key={i}
                              value={bs.value}
                            >
                              {bs.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </th>
                  <th>
                    <Controller
                      name="trailerURL"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="URL"
                          type="text"
                          value={trailerURL}
                          onChange={(e) => {
                            handleURLChange(e);
                            field.onChange(e);
                          }}
                          className="w-[48vh]"
                          variant="outlined"
                          sx={textFieldStyles}
                        />
                      )}
                    />
                  </th>
                  <th>
                    {" "}
                    <button
                      type="button"
                      className="btn w-[25vh] bg-slate-900 hover:bg-gray-700 border-gray-600 text-white"
                      onClick={handleAddTrailer}
                      disabled={isAddTrailerDisabled}
                    >
                      <BiImageAdd size={24} /> Add Trailer
                    </button>
                  </th>
                </tr>
              </thead>
            </table>
            {/* Display added trailers */}
            {trailers.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  {/* head */}
                  <thead>
                    <tr className="border-2 border-gray-600 text-gray-300">
                      <th></th>
                      <th>Language</th>
                      <th>Trailer Link</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* row 1 */}
                    {trailers.map((trailer, idx) =>
                      trailer.trailerUrl.map((url, urlIdx) => (
                        <tr key={`${idx}-${urlIdx}`}>
                          <th>{idx + 1}</th>
                          <td>{trailer.language}</td>
                          <td>
                            {/* You can embed the thumbnail from the YouTube URL */}
                            <img
                              src={`https://img.youtube.com/vi/${getYouTubeVideoId(
                                url
                              )}/0.jpg`} // Get the thumbnail image
                              alt="Trailer Thumbnail"
                              style={{
                                width: "100px",
                                height: "auto",
                                marginRight: "10px",
                              }}
                            />
                           
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() =>handleDeleteTrailer(trailer.language,trailer.trailerUrl[urlIdx])}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Add cast members */}
          <div className="rounded-lg border-gray-700 border-2 bg-black/30">
            <h2 className="poppins-semibold text-lg text-white text-center">
              Add Cast
            </h2>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <Controller
                      name="actor"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Actor"
                          type="text"
                          value={actor}
                          onChange={(e) => {
                            handleActorChange(e);

                            field.onChange(e);
                          }}
                          className="w-[45vh]"
                          variant="outlined"
                          sx={textFieldStyles}
                        />
                      )}
                    />
                  </th>
                  <th>
                    <Controller
                      name="char"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Character"
                          type="text"
                          value={char}
                          onChange={(e) => {
                            handleCharChange(e);

                            field.onChange(e);
                          }}
                          className="w-[45vh]"
                          variant="outlined"
                          sx={textFieldStyles}
                        />
                      )}
                    />
                  </th>
                  <th>
                    <button
                      type="button"
                      className="btn w-[25vh] bg-slate-900 hover:bg-gray-700 border-gray-600 text-white"
                      onClick={handleAddCast}
                      disabled={isAddCastDisabled}
                    >
                      <HiMiniUserGroup size={24} /> Add Cast
                    </button>
                  </th>
                </tr>
              </thead>
            </table>
            {/* Display added crew members */}
            {Object.keys(cast).length > 0 && (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  {/* head */}
                  <thead className="text-gray-300">
                    <tr className="border-2 border-gray-600">
                      <th></th>
                      <th>Actor</th>
                      <th>Roles</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(cast).map(([actor, char], idx) => (
                      <tr key={idx}>
                        <th>{idx + 1}</th>
                        <td>{actor}</td>
                        <td>{char}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveCrew(idx, "cast")}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Add crew members */}
          <div className="rounded-lg border-gray-700 border-2 bg-black/30">
            <h2 className="poppins-semibold text-lg text-white text-center">
              Add Crew Member
            </h2>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Name"
                          type="text"
                          value={name}
                          onChange={(e) => {
                            handleNameChange(e);
                            field.onChange(e);
                          }}
                          className="w-[45vh]"
                          variant="outlined"
                          sx={textFieldStyles}
                        />
                      )}
                    />
                  </th>
                  <th>
                    <Controller
                      name="roles"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          options={CrewRoles}
                          name="roles"
                          value={roles}
                          onChange={(selectedOptions) => {
                            handleRolesChange(selectedOptions);
                          }}
                          className="w-[30vh]"
                          labelField="label"
                          valueField="value"
                        />
                      )}
                    />
                  </th>
                  <th>
                    <button
                      type="button"
                      className="btn w-[25vh] bg-slate-900 hover:bg-gray-700 border-gray-600 text-white"
                      onClick={handleAddCrew}
                      disabled={isAddCrewDisabled}
                    >
                      <HiMiniUserGroup size={24} /> Add Crew
                    </button>
                  </th>
                </tr>
              </thead>
            </table>
            {/* Display added crew members */}
            {crew.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  {/* head */}
                  <thead className="text-gray-300">
                    <tr className="border-2 border-gray-600">
                      <th></th>
                      <th>Name</th>
                      <th>Roles</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crew.map((cr, idx) => (
                      <tr key={idx}>
                        <th>{idx + 1}</th>
                        <td>{cr.name}</td>
                        <td>{cr.roles.join(",")}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveCrew(idx, "crew")}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex mb-2 justify-center gap-x-10">
            <div className={`w-[40vh] text-center rounded-lg border-2 hover:bg-gray-700 ${bookingOpenValue?`bg-green-400/60 border-green-600`:`bg-red-800/60 border-red-600/60`}  text-white`}>
              <label htmlFor="" className="poppins-semibold">
                Bookings Open
              </label>{" "}
              <Checkbox
                name="bookingOpen"
                {...register("bookingOpen")}
                label="Focus on me"
                color="info"
              />
            </div>
            <div className={`w-[40vh] text-center rounded-lg border-2 ${promotedValue?`bg-green-400/60 border-green-600`:`bg-red-800/60 border-red-600/60`} hover:bg-gray-700 text-white`}>
              <label htmlFor="" className="poppins-semibold">
                Promoted
              </label>{" "}
              <Checkbox
                name="promoted"
                {...register("promoted")}
                label="Focus on me"
                color="info"
              />
            </div>
          </div>
          { <button type="submit" className="btn bg-blue-500 text-white w-full">
            Save Movie
          </button>
          }
        </form>
        {/* {modal for banner} */}
        <dialog id="my_modal_2" className="modal">
          <div className="modal-box bg-gray-900 text-white">
           <MyDropzone
              onImageChange={handleImageChange} // Use the new prop
              currentImage={bannerImage} // Pass the current image state
              name="banner"
              onRemoveImage={removeImage}
              closeDialog={closeDialog1} // Pass the remove function
            />
            <div className="text-center">
              <label
                className="block text-center poppins-light my-2 text-white text-md font-bold mb-2"
                htmlFor="title"
              >
                OR
              </label>
              <TextField
                label="URL"
                type="text"
                name="banner"
                className="w-[58vh]"
                variant="outlined"
                value={bannerImage}
                onChange={(e) => {
                  setBannerImage(e.target.value);
                }}
                sx={textFieldStyles}
              />
              <button
                className="btn bg-gray-700 text-white mt-2"
                onClick={() => removeImage("banner")}
              >
                Remove
              </button>
            </div>
            <div className="modal-action">
              {/* Save button - saves image and closes modal */}
              <button
                className="btn bg-gray-700 text-white"
                onClick={() => {
                  saveImage(bannerImage, "banner");
                  closeDialog2();
                }}
              >
                Save
              </button>

              {/* Close button - just closes modal without saving */}
              <button
                className="btn bg-gray-700 text-white"
                onClick={closeDialog2}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default EditMovie;
