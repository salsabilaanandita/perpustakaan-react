import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("access_token");

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/");
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top w-100">
            <div className="container-fluid px-4">
                <Link to="/dashboard" className="navbar-brand fw-bold">
                    Perpustakaan App
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {!isLoggedIn && (
                            <li className="nav-item">
                                <Link to="/login" className="nav-link">
                                    Login
                                </Link>
                            </li>
                        )}

                        {isLoggedIn && (
                            <>
                                <li className="nav-item">
                                    <Link to="/dashboard/books" className="nav-link">
                                        Book
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/dashboard/members" className='nav-link'>
                                        Member
                                    </Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <button className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                        Peminjaman
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link to="/dashboard/lendings" className="dropdown-item">
                                                Form Peminjaman
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/dashboard/lendings/data" className="dropdown-item">
                                                Data Peminjaman
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/dashboard/dendas">Denda</Link>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
