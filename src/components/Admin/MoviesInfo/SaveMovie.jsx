import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
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

const SaveMovie = () => {
  const [movie, setMovie] = useState({});
  const [trailers, setTrailers] = useState([]);
  const [trailerLang, setTrailerLang] = useState("");
  const [trailerURL, setTrailerURL] = useState("");
  const [crew, setCrew] = useState([]);
  const [cast, setCast] = useState({});
  const [name, setName] = useState("");
  const [roles, setRoles] = useState([]);
  const [actor, setActor] = useState("");
  const [char, setChar] = useState("");
  // const [image, setImage] = useState("");
  const [posterImage, setPosterImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      title: "",
      runtime: null,
      description: "",
      certification: "",
      genre: [],
      languages: [],
      formats: [],
      ratings: 0,
      votes: 0,
      likes: 0,
      cast: {},
      crew: [],
      poster: posterImage,
      banner: bannerImage,
      trailers: {},
      releaseDate: "",
      bookingOpen: false,
      promoted: false,
    },
  });
  const axiosSecure = useAxiosSecure();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = form;
  const certification = watch("certification.value");
  const isAddTrailerDisabled = !(trailerLang && trailerURL);
  const isAddCrewDisabled = !(name && roles.length > 0);
  const isAddCastDisabled = !(char && actor);
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
  const onSubmit = (data) => {
    const runtime = parseInt(data.runtime, 10);
    const certification = data.certification.value;
    const genre = data.genre.map(
      (g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
    );
    const cast = { ...data.cast };

    const transformCrew = { ...data.crew };
    const crew = transformCrewObject(transformCrew);
    const trailers = transformTrailersObject(data.trailers)
    const releaseDate = new Date(data.releaseDate).toISOString().split("T")[0];

    const movieData = {
      title: data.title,
      runtime,
      description: data.description,
      certification,
      genre,
      languages: data.languages,
      formats: data.formats,
      ratings: data.ratings,
      votes: data.votes,
      likes: data.likes,
      cast,
      crew,
      poster: data.poster,
      banner: data.banner,
      trailers,
      releaseDate,
      bookingOpen: data.bookingOpen,
      promoted: data.promoted,
    };

    Swal.fire({
      title: "Save Movie Details",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update Profile!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.post(`/movie/add-movie`, movieData); // Assuming saveMovie is an async function
          console.log(res);
          if (res) {
            Swal.fire({
              title: "Done!",
              text: "Movie has been Saved.",
              icon: "success",
            });
          }
          navigate("/admin/movie-dashboard");
        } catch (error) {
          console.error("Error saving movie:", error);
          Swal.fire({
            title: "Error!",
            text: "There was an error saving the movie.",
            icon: "error",
          });
        }
      }
    });
    console.log(movieData);
  };
  useEffect(() => {
    setValue("poster", movie.poster);
    setValue("banner", movie.banner);
  }, [movie, setValue]);
  const transformCrewObject = (crew) => {
    return Object.entries(crew).map(([name, roles]) => ({
      name: name,
      roles: roles,
    }));
  };
  const transformTrailersObject = (trailers) => {
    return Object.entries(trailers).map(([language, urls]) => ({
      language: language,
      trailerUrl: urls,
    }));
  };
  const handleLangChange = (event) => {
    setTrailerLang(event.target.value);
  };
  const handleURLChange = (event) => {
    setTrailerURL(event.target.value);
  };
  /*  const handleAddTrailer = () => {
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
  }; */
  const handleAddTrailer = () => {
    if (trailerLang && trailerURL) {
      const updatedTrailers = {
        ...trailers,
        [trailerLang]: trailers[trailerLang]
          ? [...trailers[trailerLang], trailerURL] // Append to existing array
          : [trailerURL], // Create a new array if none exists
      };

      setTrailers(updatedTrailers);
      setValue("trailers", updatedTrailers);

      // Reset input fields
      setTrailerLang("");
      setTrailerURL("");
    }
  };

  const handleDeleteTrailer = (language, urlToDelete) => {
    const updatedTrailers = {
      ...trailers,
      [language]: trailers[language].filter((url) => url !== urlToDelete),
    };

    // Remove the key if no URLs are left
    if (updatedTrailers[language].length === 0) {
      delete updatedTrailers[language];
    }

    setTrailers(updatedTrailers);
    setValue("trailers", updatedTrailers);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleRolesChange = (selectedOptions) => {
    setRoles(selectedOptions.map((option) => option.value));
  };
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
      const updatedCrew = { ...getValues("crew"), [name]: roles };
      setCrew(updatedCrew);
      setValue("crew", updatedCrew);
      setName("");
      setRoles([]);
    }
  };
  const saveImage = async (image, name) => {
    if (name === "poster") {
      setMovie((prevMovie) => ({
        ...prevMovie,
        poster: image, // save the image or set it to null
      }));
      console.log(image ? "Image saved" : "Image set to null");
      //
      //console.log(image);
    } else if (name === "banner") {
      setMovie((prevMovie) => ({
        ...prevMovie,
        banner: image,
      }));
      console.log(image ? "Image saved" : "Image set to null");
    }
  };
  // console.log(posterImage);
  // console.log(bannerImage);
  const closeDialog = () => {
    document.getElementById("my_modal_1").close();
  };
  const handleRemoveCrew = (index, team) => {
    if (team == "crew") {
      const updatedCrew = Object.entries(crew).filter(
        (_, idx) => idx !== index
      );
      setCrew(updatedCrew);
      setValue("crew", updatedCrew);
    } else if (team == "cast") {
      const updatedCast = Object.entries(cast).filter(
        (_, idx) => idx !== index
      );
      setCast(updatedCast);
      setValue("cast", updatedCast);
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
              setImage={setPosterImage}
              closeDialog={closeDialog}
              saveImage={saveImage}
              name="poster"
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
                  closeDialog();
                }}
              >
                Save
              </button>

              {/* Close button - just closes modal without saving */}
              <button
                className="btn bg-gray-700 text-white"
                onClick={closeDialog}
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
                value={certification || ""}
                onChange={(e) =>
                  setValue("certification.value", e.target.value)
                }
                required
                sx={textFieldStyles}
              >
                {certifications.map((certification) => (
                  <MenuItem
                    sx={{ fontFamily: "poppins" }}
                    key={certification.value}
                    value={certification.value}
                  >
                    {certification.label}
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
              <MultiSelect
                id="genre-multiselect"
                options={genres}
                name="genre"
                labelField="label"
                valueField="value"
                required
                onChange={(selectedOptions) =>
                  setValue(
                    "genre",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : []
                  )
                }
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
              <MultiSelect
                options={languages}
                name="languages"
                labelField="label"
                valueField="value"
                required
                onChange={(selectedOptions) =>
                  setValue(
                    "languages",
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
                Experiences available
              </label>
              <MultiSelect
                options={formats}
                name="formats"
                labelField="label"
                valueField="value"
                required
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
          {/* Poster, banner */}
          <div className="space-x-8 text-center">
            {posterImage ? (
              <button
                type="button"
                className="btn border-2 border-doubled border-green-500 w-[50vh] hover:bg-gray-700 bg-green-800 text-white"
                onClick={() =>
                  document.getElementById("my_modal_1").showModal()
                }
              >
                {typeof posterImage === "string"
                  ? posterImage.length > 20
                    ? posterImage.slice(0, 20) + "..."
                    : posterImage
                  : posterImage.name && posterImage.name.length > 20
                  ? posterImage.name.slice(0, 20) + "..."
                  : posterImage.name}
                <SiTicktick size={24} />
              </button>
            ) : (
              <button
                type="button"
                className="btn w-[50vh] bg-slate-900 hover:bg-gray-700 border-gray-600 text-white"
                onClick={() =>
                  document.getElementById("my_modal_1").showModal()
                }
              >
                <BiImageAdd size={24} /> Movie Poster (27 X 40)px
              </button>
            )}

            {bannerImage ? (
              <button
                type="button"
                className="btn w-[50vh] bg-slate-900 hover:bg-gray-700 border-gray-600 text-white"
                onClick={() => {
                  // Open another dialog for banner
                  document.getElementById("my_modal_2").showModal();
                }}
              >
                {typeof bannerImage === "string"
                  ? bannerImage.length > 20
                    ? bannerImage.slice(0, 20) + "..."
                    : bannerImage
                  : bannerImage.name && bannerImage.name.length > 20
                  ? bannerImage.name.slice(0, 20) + "..."
                  : bannerImage.name}{" "}
                <SiTicktick size={24} />
              </button>
            ) : (
              <button
                type="button"
                className="btn w-[50vh] bg-slate-900 hover:bg-gray-700 border-gray-600 text-white"
                onClick={() => {
                  // Open another dialog for banner
                  document.getElementById("my_modal_2").showModal();
                }}
              >
                <BiImageAdd size={24} /> Movie Banner (300 X 250)px
              </button>
            )}
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
                          {languages.map((bs) => (
                            <MenuItem
                              sx={{ fontFamily: "poppins" }}
                              key={bs.value}
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
            {Object.keys(trailers).length > 0 && (
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
                    {/*  {Object.entries(trailers).map(([language, url], idx) => (
                      <tr key={idx}>
                        <th>{idx + 1}</th>
                        <td>{language}</td>
                        <td>{url}</td>
                        <td>
                          <button type="button" onClick={()=>handleDeleteTrailer(language,url)} >Delete</button>
                        </td>
                      </tr>
                    ))} */}
                    {Object.entries(trailers).map(([language, urls], langIdx) =>
                      urls.map((url, urlIdx) => (
                        <tr key={`${langIdx}-${urlIdx}`}>
                          <th>
                            {langIdx + 1}.{urlIdx + 1}
                          </th>
                          <td>{language}</td>
                          <td>{url}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleDeleteTrailer(language, url)}
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
                            console.log(e.target.value);
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
                            console.log(e.target.value);
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
                            console.log(e.target.value);
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
            {Object.keys(crew).length > 0 && (
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
                    {Object.entries(crew).map(([name, roles], idx) => (
                      <tr key={idx}>
                        <th>{idx + 1}</th>
                        <td>{name}</td>
                        <td>{roles.join(", ")}</td>
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
            <div className="w-[40vh] text-center rounded-lg border-2 bg-slate-900 hover:bg-gray-700 border-gray-600 text-white">
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
            <div className="w-[40vh] text-center rounded-lg border-2 bg-slate-900 hover:bg-gray-700 border-gray-600 text-white">
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

          <button type="submit" className="btn bg-blue-500 text-white w-full">
            Save Movie
          </button>
        </form>
        {/* {modal for banner} */}
        <dialog id="my_modal_2" className="modal">
          <div className="modal-box bg-gray-900 text-white">
            <MyDropzone
              setImage={setBannerImage}
              saveImage={saveImage}
              closeDialog={closeDialog}
              name="banner"
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
                onChange={(e) => setBannerImage(e.target.value)}
                sx={textFieldStyles}
              />
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn bg-gray-700 text-white">Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default SaveMovie;
