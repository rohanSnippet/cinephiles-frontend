import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosSecure from "../Hooks/AxiosSecure";

const Popstate2 = ({ fallback = "/" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const pushedRef = useRef(false);
  const isAlertOpen = useRef(false);

  const fallbackPath = location.state?.from ?? fallback;

  useEffect(() => {
    const handlePopState = () => {
      if (isAlertOpen.current) {
        // Prevent going back while alert is open
        window.history.pushState({ guard: true }, "", window.location.href);
        return;
      }

      isAlertOpen.current = true; // Mark alert as active

      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to go back? Your current changes might be lost.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, go back",
        cancelButtonText: "Stay here",
        confirmButtonColor: "#3085de",
        cancelButtonColor: "#d33",
        showLoaderOnConfirm: true,
        allowOutsideClick: false, // Prevent dismissing by clicking outside
        preConfirm: async () => {
          try {
            const { data } = await axiosSecure.get("/bookings/unlock");
            const ok = typeof data === "boolean" ? data : data?.success;
            if (!ok) throw new Error("Server declined unlock.");
            return true;
          } catch (err) {
            Swal.showValidationMessage(
              `Can't leave yet: ${err.message || "request failed"}`
            );
            return false;
          }
        },
      }).then((result) => {
        isAlertOpen.current = false; // Alert closed

        if (result.isConfirmed && result.value) {
          window.removeEventListener("popstate", handlePopState);

          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate(fallbackPath, { replace: true });
          }
        } else {
          // Re-arm back trap
          window.history.pushState({ guard: true }, "", window.location.href);
        }
      });
    };

    if (!pushedRef.current) {
      window.history.pushState({ guard: true }, "", window.location.href);
      pushedRef.current = true;
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate, fallbackPath, axiosSecure]);

  return <div>Popstate 2</div>;
};

export default Popstate2;
