import React from "react";
import {Navigate, Outlet} from "react-router-dom";

export default function StaffRouter(){
    const user = JSON.parse(localStorage.getItem("user"));
    
        return (
            user.role == "staff" ? <Outlet /> : <Navigate to="/login" replace/>
        )
    }