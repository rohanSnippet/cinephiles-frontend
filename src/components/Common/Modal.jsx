import { TextField } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";

const CustomModal = ({ path, theatreId }) => {
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
  const navigate = useNavigate();
  const [screen, setScreen] = useState({
    sname: "",
    tiers: [],
  });

  const [tierCount, setTierCount] = useState(0);
  const [currentTier, setCurrentTier] = useState({
    tiername: "",
    price: 0,
    rows: 0,
    columns: 0,
  });
  // console.log(theatreId);
  const [totalSeats, setTotalSeats] = useState(0);
  const [lastUsedRowLetter, setLastUsedRowLetter] = useState(65);

  // Handle changes for the screen name
  const handleChange = (e) => {
    const { name, value } = e.target;
    setScreen({ ...screen, [name]: value });
  };

  const handleTierChange = (e) => {
    const { name, value } = e.target;
    setCurrentTier({ ...currentTier, [name]: value });
  };

  const addTier = () => {
    const seatsInTier = currentTier.rows * currentTier.columns;

    const newLastUsedRowLetter =
      parseInt(lastUsedRowLetter) + parseInt(currentTier.rows);
    console.log(newLastUsedRowLetter);
    setScreen({
      ...screen,
      tiers: [
        ...screen.tiers,
        {
          ...currentTier,
          seats: generateSeats(currentTier.rows, currentTier.columns),
        },
      ],
    });

    setCurrentTier({ tiername: "", price: 0, rows: 0, columns: 0 });
    setTierCount(tierCount + 1);
    setTotalSeats((prev) => prev + seatsInTier);
    setLastUsedRowLetter(newLastUsedRowLetter);
  };

  const generateSeats = (rows, columns) => {
    const seats = [];
    let currentRowLetter = lastUsedRowLetter;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const seatId = `${String.fromCharCode(currentRowLetter)}${j + 1}`;
        seats.push({
          seatId,
          status: "AVAILABLE",
        });
      }
      currentRowLetter++;
    }
    return seats;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/owner/screen-Layout", {
      state: { screen, theatreId },
    });
  };
  const isTierValid =
    currentTier.tiername &&
    currentTier.price > 0 &&
    currentTier.rows > 0 &&
    currentTier.columns > 0;
  return (
  <dialog id="my_modal_2" className="modal">
  <div className="modal-box max-w-6xl">
    <h2 className="poppins-bold text-xl text-center">ADD SCREEN</h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-4 text-center">
        <label className="block text-white text-sm font-semibold mb-2 w-4/5">
          Screen Name
        </label>
        <TextField
          label="Screen Name"
          type="text"
          className="w-full md:w-[72vh] textarea"
          name="sname"
          variant="outlined"
          value={screen.sname}
          onChange={handleChange}
          required
          sx={textFieldStyles}
        />
      </div>

      {/* Add Tier UI */}
      <div className="grid grid-cols-1 md:flex md:items-center md:gap-x-5 ml-4 md:ml-14">
        <div className="mb-4 md:mb-0">
          <label className="block text-white text-sm font-semibold mb-2">
            Tier Name
          </label>
          <TextField
            label="Tier Name"
            type="text"
            className="w-full md:w-[30vh] textarea"
            name="tiername"
            variant="outlined"
            value={currentTier.tiername}
            onChange={handleTierChange}
            sx={textFieldStyles}
          />
        </div>
        <div className="mb-4 md:mb-0">
          <label className="block text-white text-sm font-semibold mb-2">
            Price
          </label>
          <TextField
            label="Price"
            type="number"
            name="price"
            className="w-full md:w-[20vh] textarea"
            variant="outlined"
            value={currentTier.price}
            onChange={handleTierChange}
            sx={textFieldStyles}
          />
        </div>
        <div className="mb-4 md:mb-0">
          <label className="block text-white text-sm font-semibold mb-2">
            Rows
          </label>
          <TextField
            label="Rows"
            type="number"
            name="rows"
            value={currentTier.rows}
            onChange={handleTierChange}
            className="w-full md:w-[20vh] textarea"
            variant="outlined"
            sx={textFieldStyles}
          />
        </div>
        <div className="mb-4 md:mb-0">
          <label className="block text-white text-sm font-semibold mb-2 ">
            Columns
          </label>
          <TextField
            type="number"
            name="columns"
            value={currentTier.columns}
            onChange={handleTierChange}
            className="w-full md:w-[20vh] textarea"
            variant="outlined"
            sx={textFieldStyles}
          />
        </div>
        <div className="mt-4 md:mt-7">
          <button
            type="button"
            className="btn btn-ghost border-2 border-gray-400 text-white bg-slate-800 hover:bg-opacity-90"
            onClick={addTier}
            disabled={!isTierValid}
          >
            Add Tier
          </button>
        </div>
      </div>

      <div className="flex justify-between mx-6 md:mx-24 mt-4">
        <div className="flex flex-wrap gap-x-3">
          {screen.tiers.map((tier, index) => (
            <div key={index} className="poppins-semibold text-md text-center mb-3">
              <h4 className="flex rounded-xl items-center bg-base-300 bg-opacity-85 border-2 text-gray-100 border-gray-100 justify-around p-2">
                {tier.tiername} - ₹{tier.price}
                <MdOutlineAirlineSeatReclineNormal size={20} className="text-orange-300" />
                <span className="text-orange-300">{tier.rows * tier.columns || "NO"}</span>
              </h4>
            </div>
          ))}
        </div>
        <h4 className="poppins-regular text-lg text-slate-50">
          Total Capacity: {totalSeats}
        </h4>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-4">
        <button
          className="hover:bg-teal-500 btn btn-ghost border-2 border-gray-400 text-white bg-teal-300 bg-opacity-30 px-6 py-2"
          type="submit"
          disabled={screen.tiers.length === 0}
        >
          Proceed to view
        </button>

        <button
          className="btn hover:bg-red-500 btn-ghost border-2 border-gray-400 text-white bg-red-500 bg-opacity-30 px-6 py-2"
          onClick={() => {
            document.getElementById("my_modal_2").close();
            setScreen({ sname: "", tiers: [] });
            setTotalSeats(0);
          }}
        >
          Close
        </button>
      </div>
    </form>
  </div>
</dialog>

  );
};

export default CustomModal;
