import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from '../../components/Modal';
import { API_URL } from '../../constant';

export default function Dendas() {
  const [dendas, setDendas] = useState([]);
  const [denda, setDenda] = useState([]);
  const [isDetailDenda, setIsDetailDenda] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id_member: "",
    id_buku: "",
    jumlah_denda: "",
    jenis_denda: "terlambat",
    deskripsi: ""
  });

  useEffect(() => {
    fetchDendas();
  }, []);

  const fetchDendas = () => {
    setIsLoading(true);
    setError(null);
    setIsError(false);
    const token = localStorage.getItem("access_token");

    axios
      .get(`${API_URL}/denda`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        // Cek kalau data memang ada di res.data.data atau res.data
        setDendas(res.data.data || res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setIsError(true);
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Gagal menambahkan denda");
      });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const token = localStorage.getItem("access_token");

  //   axios
  //     .post(`${API_URL}/denda`, formData, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     })
  //     .then((response) => {
  //       // Add response check
  //       if (response.data) {
  //         setAlert("Denda berhasil ditambahkan");
  //         setIsModalOpen(false);
  //         setFormData({
  //           id_member: "",
  //           id_buku: "",
  //           jumlah_denda: "",
  //           jenis_denda: "terlambat",
  //           deskripsi: ""
  //         });
  //       }
  //     })
  //     .catch((err) => {
  //       setError(err.response?.data?.message || "Gagal menambahkan denda");
  //     });
  // };

  const detailDenda = (id) => {
    const token = localStorage.getItem("access_token");
    axios.get(`${API_URL}/denda/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      setDenda(res.data.data);
      setIsDetailDenda(true);
    })
    .catch(err => {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
      setError(err.response?.data?.message || "Gagal mengambil detail denda");
    });
  };

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h2 className="mb-4 text-2xl font-bold">Data Denda</h2>

      {alert && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          {alert}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">ID Member</th>
              <th className="px-3 py-2">ID Buku</th>
              <th className="px-3 py-2">Jenis Denda</th>
              <th className="px-3 py-2">Jumlah Denda</th>
              <th className="px-3 py-2">Deskripsi</th>
              <th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dendas.length > 0 ? dendas.map((denda, index) => (
              <tr key={denda.id} className="border-t">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2">{denda.id_member}</td>
                <td className="px-3 py-2">{denda.id_buku}</td>
                <td className="px-3 py-2 capitalize">{denda.jenis_denda}</td>
                <td className="px-3 py-2">Rp {parseInt(denda.jumlah_denda).toLocaleString('id-ID')}</td>
                <td className="px-3 py-2">{denda.deskripsi}</td>
                <td className="px-3 py-2">{new Date(denda.created_at).toLocaleDateString('id-ID')}</td>
                <td className="px-3 py-2">
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    onClick={() => detailDenda(denda.id_member)}
                  >
                    Riwayat Denda
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="text-center py-4">Data kosong</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isDetailDenda} 
        onClose={() => setIsDetailDenda(false)} 
        title="Detail Denda"
      >
        <div className="p-3">
          {denda.map((item, index) => (
            <div key={index} className="border rounded shadow mb-4 p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-semibold">ID Member:</span> {item.id_member}</p>
                  <p><span className="font-semibold">ID Buku:</span> {item.id_buku}</p>
                  <p><span className="font-semibold">Jenis Denda:</span> {item.jenis_denda}</p>
                  <p><span className="font-semibold">Jumlah Denda:</span> Rp {parseInt(item.jumlah_denda).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Deskripsi:</span> {item.deskripsi}</p>
                  <p><span className="font-semibold">Tanggal:</span> {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-3">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              onClick={() => setIsDetailDenda(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
