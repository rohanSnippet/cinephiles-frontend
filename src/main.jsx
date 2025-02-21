import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Signup from "./components/Authentication/Signup";
import Login from "./components/Authentication/Login";
import Home from "./components/Home/Home";
import ScreenDetails from "./components/Owner/ScreenDetails";
import OwnerDashboardLayout from "../src/components/Owner/OwnerDashboardLayout";
import Owner from "../src/components/Owner/Owner";
import ScreenLayout from "./components/Owner/ScreenLayout";
import ShowDetails from "./components/Owner/Show/ShowDetails";
import AuthProvider from "./components/Context/AuthProvider";
import PrivateRouter from "./components/PrivateRouter/PrivateRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminDashboardLayout from "./components/Admin/AdminDashboard/AdminDashboardLayout";
import AdminPanel from "./components/Admin/AdminDashboard/AdminPanel";
import UpdateProfile from "./components/Common/UpdateProfile";
import SeatBookingLayout from "./components/MovieBooking/SeatBookingLayout";
import MovieDetails from "./components/MovieBooking/MovieDetails/MovieDetails";
import SaveMovie from "./components/Admin/MoviesInfo/SaveMovie";
import AdminMovieDashboard from "./components/Admin/MoviesInfo/AdminMovieDashboard";
import Location from "./components/Common/Location";
import Cities1 from "./components/Common/Cities1";
import Cities2 from "./components/Common/Cities2";
import Rough from "./components/Common/Rough";
import Theatre from "./components/Owner/Theatre/Theatre";
import TheatreRequest from "./components/User/TheatreRequest";
import TheatresInfo from "./components/Admin/TheatresInfo/TheatresInfo";
import TheatreEdit from "./components/Owner/Theatre/TheatreEdit";
import ScreenLayoutForShow from "./components/Owner/Show/ScreenLayoutForShow";
import AllShows from "./components/MovieBooking/AllShows";
import BookSeats from "./components/MovieBooking/BookSeats";
import BookingReview from "./components/MovieBooking/BookingReview";
import OwnersInfo from "./components/Admin/OwnersInfo/OwnersInfo";
import UsersInfo from "./components/Admin/UsersInfo/UsersInfo";
import AllMovies from "./components/User/AllMovies";
import EditMovie from "./components/Admin/MoviesInfo/EditMovie";
import Orders from "./components/User/Orders";
import Confirmation from "./components/MovieBooking/Confirmation";
import PaymentSuccess from "./components/MovieBooking/PaymentSuccess";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/Signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/location",
        element: <Location />,
      },
      {
        path: "/location/cities1/:id",
        element: <Cities1 />,
      },
      {
        path: "/rough",
        element: <Rough />,
      },
      {
        path: "/location/cities2/:id",
        element: <Cities2 />,
      },
      {
        path: "/bookSeats",
        element: <BookSeats />,
      },
      {
        path: "/update-profile",
        element: <UpdateProfile />,
      },
      {
        path: "/movie-details",
        element: <MovieDetails />,
      },
      {
        path: "/Orders",
        element: <Orders />,
      },
      {
        path: "/theatre-request",
        element: <TheatreRequest />,
      },
      {
        path: "/all-shows",
        element: <AllShows />,
      },
      {
        path: "/bookingReview",
        element: <BookingReview />,
      },
      {
        path: "/All-Movies",
        element: <AllMovies />,
      },
      {
        path: "/booking-confirmation",
        element: <Confirmation />,
      },
      {
        path: "/payment-success",
        element: <PaymentSuccess />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <PrivateRouter>
        <AdminDashboardLayout />
      </PrivateRouter>
    ),
    children: [
      {
        path: "",
        element: <AdminPanel />,
      },
      {
        path: "save-movie",
        element: <SaveMovie />,
      },
      {
        path: "OwnerInfo",
        element: <OwnersInfo />,
      },
      {
        path: "UsersInfo",
        element: <UsersInfo />,
      },
      {
        path: "movie-dashboard",
        element: <AdminMovieDashboard />,
      },
      {
        path: "theatres-info",
        element: <TheatresInfo />,
      },
      {
        path: "Edit-Movie",
        element: <EditMovie />,
      },
    ],
  },
  {
    path: "/owner",
    element: (
      <PrivateRouter>
        <OwnerDashboardLayout />
      </PrivateRouter>
    ),
    children: [
      {
        path: "",
        element: <Owner />,
      },
      {
        path: "screen-details",
        element: <ScreenDetails />,
      },
      {
        path: "screen-Layout",
        element: <ScreenLayout />,
      },
      {
        path: "show-details",
        element: <ShowDetails />,
      },
      {
        path: "manage-theatres",
        element: <Theatre />,
      },
      {
        path: "theatre-details/:id",
        element: <TheatreEdit />,
      },
      {
        path: "seatBookingLayout",
        element: <SeatBookingLayout />,
      },
      {
        path: "ScreenLayoutForShow",
        element: <ScreenLayoutForShow />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {" "}
    <AuthProvider>
      {" "}
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
