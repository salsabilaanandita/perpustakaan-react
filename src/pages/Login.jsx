import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setLogin((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const API_URL = "http://45.64.100.26:88/perpus-api/public/api";
    
    axios.post(`${API_URL}/login`, login)
      .then(res => {
        localStorage.setItem("access_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.clear();
          setError({ message: "Email atau password salah" });
        } else {
          setError({ message: err.response?.data?.message || "Terjadi kesalahan" });
        }
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login Perpustakaan</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error.message || "Terjadi kesalahan"}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="email"
            name="email"
            value={login.email}
            onChange={handleChange}
            required
            autoFocus
            placeholder="Masukkan email"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="password"
            name="password"
            value={login.password}
            onChange={handleChange}
            required
            placeholder="Masukkan password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}