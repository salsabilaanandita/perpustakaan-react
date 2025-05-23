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
    <div className="container mt-4">
      <h2 className="mb-3">Data Denda</h2>

      {alert && <div className="alert alert-success">{alert}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>ID Member</th>
              <th>ID Buku</th>
              <th>Jenis Denda</th>
              <th>Jumlah Denda</th>
              <th>Deskripsi</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dendas.length > 0 ? dendas.map((denda, index) => (
              <tr key={denda.id}>
                <td>{index + 1}</td>
                <td>{denda.id_member}</td>
                <td>{denda.id_buku}</td>
                <td>{denda.jenis_denda}</td>
                <td>Rp {parseInt(denda.jumlah_denda).toLocaleString('id-ID')}</td>
                <td>{denda.deskripsi}</td>
                <td>{new Date(denda.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                  <button 
                    className="btn btn-info btn-sm"
                    onClick={() => detailDenda(denda.id_member)}
                  >
                    Riwayat Denda
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="text-center">Data kosong</td></tr>
            )}
          </tbody>
        </table>

      <Modal 
        isOpen={isDetailDenda} 
        onClose={() => setIsDetailDenda(false)} 
        title="Detail Denda"
      >
        <div className="p-3">
          {denda.map((item, index) => (
            <div key={index} className="card mb-3">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>ID Member:</strong> {item.id_member}</p>
                    <p><strong>ID Buku:</strong> {item.id_buku}</p>
                    <p><strong>Jenis Denda:</strong> {item.jenis_denda}</p>
                    <p><strong>Jumlah Denda:</strong> Rp {parseInt(item.jumlah_denda).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Deskripsi:</strong> {item.deskripsi}</p>
                    <p><strong>Tanggal:</strong> {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="btn btn-secondary" onClick={() => setIsDetailDenda(false)}>
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
