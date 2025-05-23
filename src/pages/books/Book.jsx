import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../constant";
import Modal from '../../components/Modal'; // Note the capital 'M'
import { useNavigate } from "react-router-dom";

export default function Book() {
    const [books, setBooks] = useState([]); // state untuk menyimpan data buku
    const [isModalOpen, setIsModalOpen] = useState(false); // state untuk menampilkan modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [formModal, setFormModal] = useState({
        judul: "",
        pengarang: "",
        penerbit: "",
        tahun_terbit: "",
        stok: "",
        detail: "",
        no_rak: "" // tambahkan no_rak di form
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [error, setError] = useState([]); // state untuk error
    const [alert, setAlert] = useState(""); // state untuk alert

    const navigate = useNavigate();

    // Mengambil data buku saat pertama kali komponen di-render
    useEffect(() => {
        fetchData();
    }, []); // Pastikan efek hanya dijalankan sekali

 function fetchData() {
  axios.get(`${API_URL}/buku`)
    .then((res) => {
      setBooks(res.data);
      console.log("Data buku:", res.data);
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      setError({ message: "Gagal mengambil data buku" });
      console.error("Error:", err);
    });
}

    // Handle submit form modal untuk menambahkan buku baru
    function handleSubmitModal(e) {
        e.preventDefault();
        const token = localStorage.getItem("access_token");
        axios
            .post(`${API_URL}/buku`, formModal, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((res) => {
                console.log(res); // Log response jika berhasil
                fetchData(); // Ambil data terbaru setelah buku berhasil ditambahkan
                setAlert("Buku berhasil ditambahkan!"); // Tampilkan alert
                setIsModalOpen(false); // Tutup modal
                setFormModal({
                    judul: "",
                    pengarang: "",
                    penerbit: "",
                    tahun_terbit: "",
                    stok: "",
                    detail: "",
                    no_rak: ""
                });
            })
            .catch((err) => {
                setError(err.response?.data || { message: "Gagal menambahkan buku" }); // Menangani error jika gagal
            });
    }

    // Add this function after handleSubmitModal
    function handleEditSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem("access_token");

        axios.put(`${API_URL}/buku/${formModal.id}`, formModal, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(() => {
                setIsEditModalOpen(false);
                setAlert("Data buku berhasil diperbarui.");
                setFormModal({
                    judul: "",
                    pengarang: "",
                    penerbit: "",
                    tahun_terbit: "",
                    stok: "",
                    detail: "",
                    no_rak: ""
                });
                fetchData();
            })
            .catch(err => {
                  if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response.data);
            });
    }


    function handleDelete() {
        const token = localStorage.getItem("access_token");
        axios.delete(`${API_URL}/buku/${formModal.id}`)
            .then(() => {
                setIsDeleteModalOpen(false);
                setAlert("Buku berhasil dihapus!");
                fetchData();
            })
            .catch(err => {
                 if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response.data);
            });
    }



    return (
        <div className="container mt-4">
            {alert && <div className="alert alert-success">{alert}</div>} {/* Tampilkan alert */}
            <h2 className="mb-3">Daftar Buku</h2>
            <button className="btn btn-primary mb-3" onClick={() => setIsModalOpen(true)}>
                Tambah Buku
            </button>

            <table className="table table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Judul</th>
                        <th>Pengarang</th>
                        <th>No Rak</th>
                        <th>Penerbit</th>
                        <th>Tahun Terbit</th>
                        <th>Stok</th>
                        <th>Detail</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {books.length === 0 ? (
                        <tr><td colSpan="9">Tidak ada buku</td></tr>
                    ) : (
                        books.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.judul}</td>
                                <td>{item.pengarang}</td>
                                <td>{item.no_rak}</td>
                                <td>{item.penerbit}</td>
                                <td>{item.tahun_terbit}</td>
                                <td>{item.stok}</td>
                                <td>{item.detail}</td>
                                <td className="w-25">
                                    <button className="btn btn-primary me-2" onClick={() => {
                                        setFormModal({
                                            id: item.id,
                                            judul: item.judul,
                                            pengarang: item.pengarang,
                                            penerbit: item.penerbit,
                                            tahun_terbit: item.tahun_terbit,
                                            stok: item.stok,
                                            detail: item.detail,
                                            no_rak: item.no_rak
                                        });
                                        setIsDetailModalOpen(true);
                                    }}>Detail</button>
                                    {/* <button className="btn btn-success" onClick={() => { handleInboundBtn(item.id) }}>Add Stock</button> */}
                                    <button className="btn btn-info mx-2" onClick={() => {
                                        setFormModal({
                                            id: item.id,
                                            judul: item.judul,
                                            pengarang: item.pengarang,
                                            penerbit: item.penerbit,
                                            tahun_terbit: item.tahun_terbit,
                                            stok: item.stok,
                                            detail: item.detail,
                                            no_rak: item.no_rak
                                        });
                                        setIsEditModalOpen(true);
                                        setError([]);
                                    }}>
                                        Edit

                                    </button>
                                    <button className="btn btn-danger" onClick={() => {
                                        setFormModal({ id: item.id });
                                        setIsDeleteModalOpen(true);
                                        setError([]);
                                    }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal untuk menambah buku baru */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Buku Baru">
                <form onSubmit={handleSubmitModal}>
                    {error?.message && (
                        <div className="alert alert-danger">{error.message}</div>
                    )}


                    <div className="mb-3">
                        <label className="form-label">Judul</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.judul}
                            onChange={(e) => setFormModal({ ...formModal, judul: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Pengarang</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.pengarang}
                            onChange={(e) => setFormModal({ ...formModal, pengarang: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">No Rak</label>
                        <input
                            type="text"
                            className="w-full border px-3 py-2"
                            value={formModal.no_rak}
                            onChange={(e) => setFormModal({ ...formModal, no_rak: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Penerbit</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.penerbit}
                            onChange={(e) => setFormModal({ ...formModal, penerbit: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tahun Terbit</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formModal.tahun_terbit}
                            onChange={(e) => setFormModal({ ...formModal, tahun_terbit: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Stok</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formModal.stok}
                            onChange={(e) => setFormModal({ ...formModal, stok: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Detail</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={formModal.detail}
                            onChange={(e) => setFormModal({ ...formModal, detail: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Simpan</button>
                </form>
            </Modal>


            {/* Modal untuk edit buku */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Buku">
                <form onSubmit={handleEditSubmit}>
                    {error && (
                        <div className="alert alert-danger text-danger m-2 p-2">
                            {error.data
                                ? Object.entries(error.data).map(([key, value]) => <div key={key}>{value}</div>)
                                : <div>{error.message || "Something went wrong."}</div>}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Judul <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.judul}
                            onChange={(e) => setFormModal({ ...formModal, judul: e.target.value })}
                        />
                    </div>
                    <div className="mb-3 d-flex flex-column justify-content-start">
                        <label className="form-label">Pengarang <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.pengarang}
                            onChange={(e) => setFormModal({ ...formModal, pengarang: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary mt-2">UPDATE</button>
                    </div>
                </form>
            </Modal>


            {/* Modal untuk delete */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Buku">
                <p>Apakah Anda yakin ingin menghapus buku ini?</p>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary mx-2" onClick={() => setIsDeleteModalOpen(false)}>Batal</button>
                    <button className="btn btn-danger" onClick={handleDelete}>Hapus</button>
                </div>
            </Modal>

            {/* Modal untuk detail buku */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detail Buku">
                <div className="p-3">
                    <div className="mb-3">
                        <strong>Judul:</strong>
                        <p>{formModal.judul}</p>
                    </div>
                    <div className="mb-3">
                        <strong>Pengarang:</strong>
                        <p>{formModal.pengarang}</p>
                    </div>
                    <div className="mb-3">
                        <strong>No Rak:</strong>
                        <p>{formModal.no_rak}</p>
                    </div>
                    <div className="mb-3">
                        <strong>Penerbit:</strong>
                        <p>{formModal.penerbit}</p>
                    </div>
                    <div className="mb-3">
                        <strong>Tahun Terbit:</strong>
                        <p>{formModal.tahun_terbit}</p>
                    </div>
                    <div className="mb-3">
                        <strong>Stok:</strong>
                        <p>{formModal.stok}</p>
                    </div>
                    <div className="mb-3">
                        <strong>Detail:</strong>
                        <p>{formModal.detail}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>Tutup</button>
                </div>
            </Modal>
        </div>
    );
}
