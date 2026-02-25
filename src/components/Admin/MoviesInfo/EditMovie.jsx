import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { Checkbox } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import Swal from "sweetalert2";

import { RiMovieFill } from "react-icons/ri";
import { BiImageAdd } from "react-icons/bi";
import { HiMiniUserGroup } from "react-icons/hi2";
import { SiTicktick } from "react-icons/si";

import certifications from "../../../assets/certification.json";
import languages from "../../../assets/languages.json";
import MultiSelect from "../../Common/MultiSelect";
import MyDropzone from "../../Common/MyDropzone";
import useAxiosSecure from "../../Hooks/AxiosSecure";

const EditMovie = () => {
  const genres = [
    { label: "Action", value: "Action" },
    { label: "Comedy", value: "Comedy" },
    { label: "Thriller", value: "Thriller" },
    { label: "Romance", value: "Romance" },
    { label: "Horror", value: "Horror" },
    { label: "Fantasy", value: "Fantasy" },
    { label: "Adventure", value: "Adventure" },
    { label: "Sci-Fi", value: "Sci-Fi" },
    { label: "Crime", value: "Crime" },
    { label: "Drama", value: "Drama" },
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

  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMovie } = location.state || {};
  const axiosSecure = useAxiosSecure();

  const posterModalRef = useRef(null);
  const bannerModalRef = useRef(null);

  // States
  const [trailers, setTrailers] = useState(selectedMovie?.trailers || []);
  const [crew, setCrew] = useState(selectedMovie?.crew || []);
  const [cast, setCast] = useState(selectedMovie?.cast || {});
  
  const [trailerLang, setTrailerLang] = useState("");
  const [trailerURL, setTrailerURL] = useState("");
  const [name, setName] = useState("");
  const [roles, setRoles] = useState([]);
  const [actor, setActor] = useState("");
  const [char, setChar] = useState("");
  const [posterImage, setPosterImage] = useState(selectedMovie?.poster || "");
  const [bannerImage, setBannerImage] = useState(selectedMovie?.banner || "");

  const defaultValues = {
    title: selectedMovie?.title || "",
    runtime: selectedMovie?.runtime || "",
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
    trailers: selectedMovie?.trailers || [],
    releaseDate: selectedMovie?.releaseDate || "",
    bookingOpen: selectedMovie?.bookingOpen || false,
    promoted: selectedMovie?.promoted || false,
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm({ defaultValues });

  const certificationValue = watch("certification");
  const bookingOpenValue = watch("bookingOpen");
  const promotedValue = watch("promoted");
  const currentGenres = watch("genre");
  const currentFormats = watch("formats");
  const currentLanguages = watch("languages");

  const isAddTrailerDisabled = !(trailerLang && trailerURL);
  const isAddCrewDisabled = !(name && roles.length > 0);
  const isAddCastDisabled = !(char && actor);

  const onSubmit = (data) => {
    const runtime = parseInt(data.runtime, 10);
    const releaseDate = data.releaseDate ? new Date(data.releaseDate).toISOString().split("T")[0] : null;

    const movieData = {
      title: data.title,
      runtime,
      description: data.description,
      certification: data.certification,
      genre: data.genre,
      languages: data.languages,
      formats: data.formats,
      ratings: data.ratings,
      votes: data.votes,
      likes: data.likes,
      cast: cast,
      crew: crew,
      poster: posterImage,
      banner: bannerImage,
      trailers: trailers, // Now correctly formatted as an array
      releaseDate,
      bookingOpen: data.bookingOpen,
      promoted: data.promoted,
    };

    handleEditMovie(movieData);
  };

  const handleEditMovie = async (movieData) => {
    Swal.fire({
      title: "Update Movie",
      text: "Are you sure you want to save these changes?",
      icon: "info",
      background: "#1f2937",
      color: "white",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Save Changes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.put(`/movie/edit-movie/${selectedMovie.id}`, movieData);
          if (res.status === 200) {
            Swal.fire({
              title: "Updated!",
              text: "Movie has been successfully updated.",
              icon: "success",
              background: "#1f2937",
              color: "white",
            });
            navigate("/admin/movie-dashboard");
          }
        } catch (error) {
          console.error("Error saving movie:", error);
          Swal.fire({
            title: "Error!",
            text: "There was an error updating the movie.",
            icon: "error",
            background: "#1f2937",
            color: "white",
          });
        }
      }
    });
  };

  // --- TRAILER LOGIC ---
  const handleAddTrailer = () => {
    if (trailerLang && trailerURL) {
      const existingIndex = trailers.findIndex((t) => t.language === trailerLang);
      let updatedTrailers = [...trailers];

      if (existingIndex >= 0) {
        updatedTrailers[existingIndex].trailerUrl.push(trailerURL);
      } else {
        updatedTrailers.push({ language: trailerLang, trailerUrl: [trailerURL] });
      }

      setTrailers(updatedTrailers);
      setValue("trailers", updatedTrailers);
      setTrailerLang("");
      setTrailerURL("");
    }
  };

  const handleDeleteTrailer = (language, urlToDelete) => {
    const updatedTrailers = trailers
      .map((trailer) => {
        if (trailer.language === language) {
          return {
            ...trailer,
            trailerUrl: trailer.trailerUrl.filter((url) => url !== urlToDelete),
          };
        }
        return trailer;
      })
      .filter((trailer) => trailer.trailerUrl.length > 0);

    setTrailers(updatedTrailers);
    setValue("trailers", updatedTrailers);
  };

  const getYouTubeVideoId = (url) => {
    const regex = /(?:https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/))([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // --- CAST & CREW LOGIC ---
  const handleAddCast = () => {
    if (char && actor) {
      const updatedCast = { ...cast, [actor]: char };
      setCast(updatedCast);
      setValue("cast", updatedCast);
      setChar("");
      setActor("");
    }
  };

  const handleAddCrew = () => {
    if (name && roles.length > 0) {
      const updatedCrew = [...crew, { name, roles }];
      setCrew(updatedCrew);
      setValue("crew", updatedCrew);
      setName("");
      setRoles([]);
    }
  };

  const handleRemoveItem = (index, type) => {
    if (type === "crew") {
      const updatedCrew = crew.filter((_, idx) => idx !== index);
      setCrew(updatedCrew);
      setValue("crew", updatedCrew);
    } else if (type === "cast") {
      const updatedCast = { ...cast };
      const actorToRemove = Object.keys(updatedCast)[index];
      delete updatedCast[actorToRemove];
      setCast(updatedCast);
      setValue("cast", updatedCast);
    }
  };

  // --- IMAGE LOGIC ---
  const handleImageChange = (imageUrl, name) => {
    if (name === "poster") {
      setPosterImage(imageUrl);
      posterModalRef.current?.close();
    } else {
      setBannerImage(imageUrl);
      bannerModalRef.current?.close();
    }
  };

  const removeImage = (name) => {
    if (name === "poster") setPosterImage("");
    if (name === "banner") setBannerImage("");
  };

  // --- STYLES ---
  const textFieldStyles = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#4b5563" },
      "&:hover fieldset": { borderColor: "#9ca3af" },
    },
    "& .MuiInputBase-input": { color: "white" },
    "& .MuiInputLabel-root": { color: "#9ca3af" },
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "transparent",
      color: "#fff",
      border: "1px solid #4b5563",
      minHeight: "56px",
      width: "100%",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#374151",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "white",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#1f2937",
      color: "#fff",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#374151" : "transparent",
      "&:active": { backgroundColor: "#4b5563" },
    }),
  };

  if (!selectedMovie) return <div className="text-white text-center mt-20">No movie selected.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 poppins-regular">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-xl p-4 mb-8 flex items-center shadow-2xl gap-4">
          <RiMovieFill size={32} className="text-blue-500" />
          <h1 className="text-2xl font-bold tracking-wider uppercase">Edit Movie: {selectedMovie.title}</h1>
        </div>

        {/* Modal: Poster */}
        <dialog ref={posterModalRef} className="modal">
          <div className="modal-box bg-gray-900 border border-gray-700 text-white">
            <h3 className="font-bold text-lg mb-4">Update Poster</h3>
            <MyDropzone onImageChange={handleImageChange} currentImage={posterImage} name="poster" onRemoveImage={removeImage} closeDialog={() => posterModalRef.current?.close()}/>
            <div className="divider before:bg-gray-700 after:bg-gray-700">OR URL</div>
            <TextField label="Image URL" value={posterImage} onChange={(e) => setPosterImage(e.target.value)} sx={textFieldStyles} />
            <div className="modal-action mt-6">
              <button type="button" className="btn btn-error text-white" onClick={() => removeImage("poster")}>Remove</button>
              <button type="button" className="btn btn-primary" onClick={() => posterModalRef.current?.close()}>Done</button>
            </div>
          </div>
        </dialog>

        {/* Modal: Banner */}
        <dialog ref={bannerModalRef} className="modal">
          <div className="modal-box bg-gray-900 border border-gray-700 text-white max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Update Banner</h3>
            <MyDropzone onImageChange={handleImageChange} currentImage={bannerImage} name="banner" onRemoveImage={removeImage} closeDialog={() => bannerModalRef.current?.close()}/>
            <div className="divider before:bg-gray-700 after:bg-gray-700">OR URL</div>
            <TextField label="Image URL" value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} sx={textFieldStyles} />
            <div className="modal-action mt-6">
              <button type="button" className="btn btn-error text-white" onClick={() => removeImage("banner")}>Remove</button>
              <button type="button" className="btn btn-primary" onClick={() => bannerModalRef.current?.close()}>Done</button>
            </div>
          </div>
        </dialog>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 md:p-10 space-y-10 shadow-2xl">
          
          {/* Images Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1">
               <p className="text-gray-400 text-sm mb-2 font-semibold">Movie Poster</p>
               <button
                  type="button"
                  onClick={() => posterModalRef.current?.showModal()}
                  className="w-full aspect-[2/3] max-w-[300px] mx-auto relative group overflow-hidden rounded-xl border-2 border-gray-700 bg-gray-800 flex items-center justify-center transition-all hover:border-blue-500"
                  style={posterImage ? { backgroundImage: `url(${posterImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                >
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <BiImageAdd size={48} />
                    <span className="mt-2 font-medium">Update Poster</span>
                  </div>
                  {!posterImage && <BiImageAdd size={48} className="text-gray-500" />}
                </button>
            </div>
            
            <div className="col-span-1 lg:col-span-2">
               <p className="text-gray-400 text-sm mb-2 font-semibold">Movie Banner</p>
               <button
                  type="button"
                  onClick={() => bannerModalRef.current?.showModal()}
                  className="w-full aspect-video relative group overflow-hidden rounded-xl border-2 border-gray-700 bg-gray-800 flex items-center justify-center transition-all hover:border-blue-500"
                  style={bannerImage ? { backgroundImage: `url(${bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                >
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <BiImageAdd size={48} />
                    <span className="mt-2 font-medium">Update Banner</span>
                  </div>
                  {!bannerImage && <BiImageAdd size={48} className="text-gray-500" />}
                </button>
            </div>
          </div>

          {/* Basic Info Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TextField
              label="Movie Title"
              variant="outlined"
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={textFieldStyles}
            />
            <TextField
              label="Runtime (mins)"
              type="number"
              variant="outlined"
              {...register("runtime", { required: "Runtime is required" })}
              error={!!errors.runtime}
              helperText={errors.runtime?.message}
              sx={textFieldStyles}
            />
            <TextField
              select
              label="Certification"
              variant="outlined"
              value={certificationValue || ""}
              {...register("certification", { required: "Certification required" })}
              onChange={(e) => setValue("certification", e.target.value)}
              sx={textFieldStyles}
            >
              {certifications.map((cert) => (
                <MenuItem key={cert.value} value={cert.value}>{cert.label}</MenuItem>
              ))}
            </TextField>
          </div>

          {/* Info Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Description / Summary"
              multiline
              rows={3}
              variant="outlined"
              {...register("description", { required: "Summary required" })}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={textFieldStyles}
            />
            <div className="space-y-2">
               <label className="text-gray-400 text-sm pl-1">Genres</label>
               <Select
                  isMulti
                  options={genres}
                  value={genres.filter(g => currentGenres?.includes(g.value))}
                  onChange={(opts) => setValue("genre", opts ? opts.map(o => o.value) : [])}
                  styles={customStyles}
                  placeholder="Select genres..."
               />
            </div>
          </div>

          {/* Info Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
               <label className="text-gray-400 text-sm pl-1">Languages</label>
               <Select
                  isMulti
                  options={languages}
                  value={languages.filter(l => currentLanguages?.includes(l.value))}
                  onChange={(opts) => setValue("languages", opts ? opts.map(o => o.value) : [])}
                  styles={customStyles}
               />
             </div>
             <div className="space-y-2">
               <label className="text-gray-400 text-sm pl-1">Formats (Experiences)</label>
               <Select
                  isMulti
                  options={formats}
                  value={formats.filter(f => currentFormats?.includes(f.value))}
                  onChange={(opts) => setValue("formats", opts ? opts.map(o => o.value) : [])}
                  styles={customStyles}
               />
             </div>
             <div className="space-y-2 pt-1">
                <TextField
                  label="Release Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("releaseDate", { required: "Release date required" })}
                  error={!!errors.releaseDate}
                  helperText={errors.releaseDate?.message}
                  sx={textFieldStyles}
                />
             </div>
          </div>

          {/* Trailers Section */}
          <div className="bg-black/50 border border-gray-700 rounded-xl p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Trailers</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <TextField
                  select
                  label="Language"
                  value={trailerLang}
                  onChange={(e) => setTrailerLang(e.target.value)}
                  sx={textFieldStyles}
              >
                  {languages.map((l) => (
                    <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                  ))}
              </TextField>
              <TextField
                  label="YouTube URL"
                  value={trailerURL}
                  onChange={(e) => setTrailerURL(e.target.value)}
                  sx={textFieldStyles}
              />
              <button
                type="button"
                className="btn btn-primary md:w-48 whitespace-nowrap"
                onClick={handleAddTrailer}
                disabled={isAddTrailerDisabled}
              >
                + Add Trailer
              </button>
            </div>

            {trailers.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="table w-full">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th>Language</th>
                      <th>Thumbnail</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trailers.map((trailer) =>
                      trailer.trailerUrl.map((url, idx) => (
                        <tr key={`${trailer.language}-${idx}`} className="border-t border-gray-700">
                          <td>{trailer.language}</td>
                          <td>
                            <img
                              src={`https://img.youtube.com/vi/${getYouTubeVideoId(url)}/0.jpg`}
                              alt="Thumbnail"
                              className="w-24 h-auto rounded border border-gray-600"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </td>
                          <td>
                            <button type="button" className="btn btn-sm btn-error text-white" onClick={() => handleDeleteTrailer(trailer.language, url)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cast Section */}
          <div className="bg-black/50 border border-gray-700 rounded-xl p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Cast</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <TextField label="Actor Name" value={actor} onChange={(e) => setActor(e.target.value)} sx={textFieldStyles} />
              <TextField label="Character Name" value={char} onChange={(e) => setChar(e.target.value)} sx={textFieldStyles} />
              <button type="button" className="btn btn-primary md:w-48 whitespace-nowrap" onClick={handleAddCast} disabled={isAddCastDisabled}>
                + Add Cast
              </button>
            </div>
            {Object.keys(cast).length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="table w-full">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr><th>Actor</th><th>Character</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(cast).map(([act, chr], idx) => (
                      <tr key={idx} className="border-t border-gray-700">
                        <td>{act}</td>
                        <td>{chr}</td>
                        <td><button type="button" className="btn btn-sm btn-error text-white" onClick={() => handleRemoveItem(idx, "cast")}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Crew Section */}
          <div className="bg-black/50 border border-gray-700 rounded-xl p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Crew</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <TextField label="Crew Member Name" value={name} onChange={(e) => setName(e.target.value)} sx={textFieldStyles} />
              <div className="w-full">
                <MultiSelect options={CrewRoles} value={roles} onChange={(opts) => setRoles(opts.map(o => o.value))} labelField="label" valueField="value" />
              </div>
              <button type="button" className="btn btn-primary md:w-48 whitespace-nowrap" onClick={handleAddCrew} disabled={isAddCrewDisabled}>
                + Add Crew
              </button>
            </div>
            {crew.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="table w-full">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr><th>Name</th><th>Roles</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {crew.map((cr, idx) => (
                      <tr key={idx} className="border-t border-gray-700">
                        <td>{cr.name}</td>
                        <td>{cr.roles.join(", ")}</td>
                        <td><button type="button" className="btn btn-sm btn-error text-white" onClick={() => handleRemoveItem(idx, "crew")}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Toggles & Submit */}
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
              <div className={`flex items-center px-6 py-3 rounded-xl border-2 transition-colors ${bookingOpenValue ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}>
                <Checkbox {...register("bookingOpen")} sx={{ color: 'inherit', '&.Mui-checked': { color: '#4ade80' } }} />
                <span className="font-semibold text-lg ml-2">Bookings Open</span>
              </div>
              <div className={`flex items-center px-6 py-3 rounded-xl border-2 transition-colors ${promotedValue ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                <Checkbox {...register("promoted")} sx={{ color: 'inherit', '&.Mui-checked': { color: '#60a5fa' } }} />
                <span className="font-semibold text-lg ml-2">Promoted Status</span>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xl shadow-lg transform transition-all hover:scale-[1.01] active:scale-[0.99]">
              Save Movie Updates
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditMovie;