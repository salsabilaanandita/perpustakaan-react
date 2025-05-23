import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";

export default function Member() {
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formModal, setFormModal] = useState({
        no_ktp: "",
        nama: "",
        alamat: "",
        tgl_lahir: "",
        detail: "",
    });

    const [error, setError] = useState();
    const [alert, setAlert] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        const token = localStorage.getItem("access_token");
        axios.get(`${API_URL}/member`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // jika menggunakan token
              }
        })
            .then((res) => {
                console.log('Data member:', res.data); // Debug: cek isi data
                setMembers(res.data); // pastikan ini array
            })
            .catch((err) => {
                console.log(err);
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError({ message: "Gagal mengambil data member" });
            });
    }


    function handleSubmitModal(e) {
        e.preventDefault();

        const token = localStorage.getItem("access_token");
        axios
            .post(`${API_URL}/member`, formModal, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                console.log('Response from API:', res.data);
                fetchData();
                setAlert("Member berhasil ditambahkan!");
                setIsModalOpen(false);
                setFormModal({
                    no_ktp: "",
                    nama: "",
                    alamat: "",
                    tgl_lahir: "",
                    detail: ""
                });
            })
            .catch((err) => {
                console.error('Error:', err.response?.data);
                setError(err.response?.data || { message: "Gagal menambahkan member" });
            });
    }


    function handleEditSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem("access_token");

        axios.put(`${API_URL}/member/${formModal.id}`, formModal, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(() => {
                setIsEditModalOpen(false);
                setAlert("Data member berhasil diperbarui.");
                setFormModal({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "", detail: "" });
                fetchData();
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response?.data || { message: "Gagal memperbarui data member." });
            });
    }

    function handleDelete() {
        const token = localStorage.getItem("access_token");
        axios.delete(`${API_URL}/member/${formModal.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(() => {
                setIsDeleteModalOpen(false);
                setAlert("Member berhasil dihapus!");
                fetchData();
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response?.data || { message: "Gagal menghapus member" });
            });
    }

    return (
        <div className="container mt-4">
            {alert && <div className="alert alert-success">{alert}</div>}
            <h2 className="mb-3">Daftar Member</h2>
            <button className="btn btn-primary mb-3" onClick={() => setIsModalOpen(true)}>
                Tambah Member
            </button>

            <table className="table table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>No KTP</th>
                        <th>Nama</th>
                        <th>Alamat</th>
                        <th>Tanggal Lahir</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {members.length === 0 ? (
                        <tr><td colSpan="6">Tidak ada member</td></tr>
                    ) : (
                        members.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.no_ktp}</td>
                                <td>{item.nama}</td>
                                <td>{item.alamat}</td>
                                <td>{item.tgl_lahir}</td>
                                <td className="w-25">
                                    <button className="btn btn-primary me-2" onClick={() => {
                                        setFormModal(item);  // pastikan item mengandung data detail
                                        setIsDetailModalOpen(true);
                                    }}>
                                        Detail
                                    </button>
                                    <button className="btn btn-info mx-2" onClick={() => {
                                        setFormModal(item);
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

            {/* Modal Tambah Member */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Member">
                <form onSubmit={handleSubmitModal}>
                    {error?.message && <div className="alert alert-danger">{error.message}</div>}
                    <div className="mb-3">
                        <label className="form-label">No KTP</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.no_ktp}
                            onChange={(e) => setFormModal({ ...formModal, no_ktp: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Nama</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.nama}
                            onChange={(e) => setFormModal({ ...formModal, nama: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Alamat</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.alamat}
                            onChange={(e) => setFormModal({ ...formModal, alamat: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tanggal Lahir</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formModal.tgl_lahir}
                            onChange={(e) => setFormModal({ ...formModal, tgl_lahir: e.target.value })}
                            required
                        />
                    </div>
                    {/* <div className="mb-3">
                        <label className="form-label">Detail</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={formModal.detail}
                            onChange={(e) => setFormModal({ ...formModal, detail: e.target.value })}
                            required
                        ></textarea>
                    </div> */}
                    <button type="submit" className="btn btn-primary">Simpan</button>
                </form>
            </Modal>

            {/* Modal Edit Member */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Member">
                <form onSubmit={handleEditSubmit}>
                    {error && (
                        <div className="alert alert-danger">
                            {error.data
                                ? Object.entries(error.data).map(([key, value]) => <div key={key}>{value}</div>)
                                : <div>{error.message || "Terjadi kesalahan."}</div>}
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label">No KTP</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.no_ktp}
                            onChange={(e) => setFormModal({ ...formModal, no_ktp: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Nama</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.nama}
                            onChange={(e) => setFormModal({ ...formModal, nama: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Alamat</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.alamat}
                            onChange={(e) => setFormModal({ ...formModal, alamat: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tanggal Lahir</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formModal.tgl_lahir}
                            onChange={(e) => setFormModal({ ...formModal, tgl_lahir: e.target.value })}
                            required
                        />
                    </div>
                    {/* <div className="mb-3">
                        <label className="form-label">Detail</label>
                        <input
                            className="form-control"
                            rows="3"
                            value={formModal.detail}
                            onChange={(e) => setFormModal({ ...formModal, detail: e.target.value })}
                            required
                        />
                    </div> */}
                    <button type="submit" className="btn btn-primary">Update</button>
                </form>
            </Modal>

            {/* Modal Delete */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Member">
                <p>Apakah kamu yakin ingin menghapus member ini?</p>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary me-2" onClick={() => setIsDeleteModalOpen(false)}>Batal</button>
                    <button className="btn btn-danger" onClick={handleDelete}>Hapus</button>
                </div>
            </Modal>

            {/* Modal Detail */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detail Member">
                <div>
                    <p><strong>No KTP:</strong> {formModal.no_ktp}</p>
                    <p><strong>Nama:</strong> {formModal.nama}</p>
                    <p><strong>Alamat:</strong> {formModal.alamat}</p>
                    <p><strong>Tanggal Lahir:</strong> {formModal.tgl_lahir}</p>
                    {/* <p><strong>Detail:</strong> {formModal.detail}</p> */}
                </div>
            </Modal>

        </div>
    );
}
