import { React } from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function Template() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </>
  );
}