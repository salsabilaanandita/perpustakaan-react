// src/main.jsx
import React from 'react';
import {createRoot} from 'react-dom/client';
import {StrictMode} from 'react';
import './index.css'
// src/main.jsx
// import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { RouterProvider } from "react-router-dom";
import { router } from './routes/index.jsx'
import axios from 'axios';

//default header authorizationn agar setiap memanggil axios tidak perlu mendefinisikan {header: {Authorization: ....}}
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error =>  {
    return Promise.reject(error);
  }
);
//default header authorizationn agar setiap memanggil axios tidak perlu mendefinisikan {header: {Authorization: ....}}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
)