import {React, useEffect, useState} from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Loading from "../Common/Loading.jsx"

const Layout = () => {
const navigate = useNavigate();
const location = useLocation();
const [isRedirecting, setIsRedirecting] = useState(() => {
    return !!localStorage.getItem("oauth_redirect_path");
  });

  useEffect(() => {
    // 1. Check if we just returned from an OAuth login flow
    const redirectPath = localStorage.getItem("oauth_redirect_path");

    if (redirectPath) {
      // 2. Rehydrate the React Router state (movie details, selected seats, etc.)
      const redirectState = JSON.parse(localStorage.getItem("oauth_redirect_state") || "{}");

      // 3. Clean up storage so this only runs once
      localStorage.removeItem("oauth_redirect_path");
      localStorage.removeItem("oauth_redirect_state");

      // 4. Execute the redirect with the restored state
      navigate(`${redirectPath}${location.search}`, {
              state: redirectState,
              replace: true
      });

      setIsRedirecting(false);

    }
  }, [navigate, location.search]);

  if (isRedirecting) {
      return (
        <Loading/>
      );
    }

  return (
    <>
      <Outlet />
    </>
  );
};

export default Layout;
