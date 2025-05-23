import { React } from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function Template() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4">
        <Outlet />
      </div>
    </>
  );
}