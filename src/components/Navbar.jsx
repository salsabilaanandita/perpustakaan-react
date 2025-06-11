import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // pastikan install `lucide-react` lewat npm/yarn

export default function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("access_token");
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/");
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link
                    to={isLoggedIn ? "/dashboard" : "/"}
                    className="text-2xl font-bold text-blue-700"
                >
                    Perpustakaan App
                </Link>

                {/* Hamburger button */}
                <button
                    className="md:hidden text-gray-700"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6">
                    {!isLoggedIn ? (
                        <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">
                            Login
                        </Link>
                    ) : (
                        <>
                            <Link to="/dashboard/books" className="text-gray-700 hover:text-blue-600 transition">
                                Book
                            </Link>
                            <Link to="/dashboard/members" className="text-gray-700 hover:text-blue-600 transition">
                                Member
                            </Link>

                            {/* Dropdown */}
                            <div className="relative group">
                                <button className="text-gray-700 hover:text-blue-600 transition">
                                    Peminjaman
                                </button>
                                <ul className="absolute hidden group-hover:block bg-white mt-2 w-48 rounded-md shadow-lg border border-gray-200 z-40">
                                    <li>
                                        <Link to="/dashboard/lendings" className="block px-4 py-2 text-sm hover:bg-gray-100 text-gray-700">
                                            Form Peminjaman
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard/lendings/data" className="block px-4 py-2 text-sm hover:bg-gray-100 text-gray-700">
                                            Data Peminjaman
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard/dendas" className="block px-4 py-2 text-sm hover:bg-gray-100 text-gray-700">
                                            Denda
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded transition"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileOpen && (
                <div className="md:hidden px-4 pb-4 space-y-2">
                    {!isLoggedIn ? (
                        <Link to="/login" className="block text-gray-700 hover:text-blue-600">
                            Login
                        </Link>
                    ) : (
                        <>
                            <Link to="/dashboard/books" className="block text-gray-700 hover:text-blue-600">
                                Book
                            </Link>
                            <Link to="/dashboard/members" className="block text-gray-700 hover:text-blue-600">
                                Member
                            </Link>
                            <details className="group">
                                <summary className="cursor-pointer text-gray-700 hover:text-blue-600">
                                    Peminjaman
                                </summary>
                                <ul className="pl-4 pt-2 space-y-1">
                                    <li>
                                        <Link to="/dashboard/lendings" className="block text-sm text-gray-700 hover:text-blue-600">
                                            Form Peminjaman
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard/lendings/data" className="block text-sm text-gray-700 hover:text-blue-600">
                                            Data Peminjaman
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard/dendas" className="block text-sm text-gray-700 hover:text-blue-600">
                                            Denda
                                        </Link>
                                    </li>
                                </ul>
                            </details>
                            <button
                                onClick={handleLogout}
                                className="w-full mt-2 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded transition"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
