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

  function loginProcess(e) {
    e.preventDefault();
    const API_URL = "http://45.64.100.26:88/perpus-api/public/api";
    
    axios.post(`${API_URL}/login`, login)
      .then(res => {
        localStorage.setItem("access_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
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
    <form onSubmit={loginProcess} className="card w-50 d-block mx-auto mt-5 p-4">
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email address</label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={login.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={login.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary btn-block">
          Sign in
        </button>
      </div>

      {error && (
        <div className="text-danger mt-3">{error.message || "Terjadi kesalahan"}</div>
      )}
    </form>
  );
}
