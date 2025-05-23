// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// export default function LoginPage() {
//     let authentication = localStorage.getItem("access_token");

//     // Kalau SUDAH login, arahkan ke dashboard
//     return authentication ? <Navigate to="/dashboard" replace /> : <Outlet />;
// }

import React from "react";
import { Outlet } from "react-router-dom";

export default function LoginPage() {
  return <Outlet />;
}
