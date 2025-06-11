import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";

export default function Book() {
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [formModal, setFormModal] = useState({
        id: "",
        judul: "",
        pengarang: "",
        penerbit: "",
        tahun_terbit: "",
        stok: "",
        detail: "",
        no_rak: "",
    });

    const [error, setError] = useState([]);
    const [alert, setAlert] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        axios.get(`${API_URL}/buku`)
            .then((res) => setBooks(res.data))
            .catch((err) => {
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError({ message: "Gagal mengambil data buku" });
            });
    }

    function handleSortByTitle() {
        const sortedBooks = [...books].sort((a, b) =>
            a.judul.localeCompare(b.judul)
        );
        setBooks(sortedBooks);
    }

    function handleSubmitModal(e) {
        e.preventDefault();
        const token = localStorage.getItem("access_token");
        axios.post(`${API_URL}/buku`, formModal, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }).then(() => {
            fetchData();
            setAlert("Buku berhasil ditambahkan!");
            setIsModalOpen(false);
            resetForm();
        }).catch((err) => {
            setError(err.response?.data || { message: "Gagal menambahkan buku" });
        });
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem("access_token");
        axios.put(`${API_URL}/buku/${formModal.id}`, formModal, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }).then(() => {
            setIsEditModalOpen(false);
            setAlert("Data buku berhasil diperbarui.");
            resetForm();
            fetchData();
        }).catch(err => {
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
            setError(err.response?.data);
        });
    }

    function handleDelete() {
        const token = localStorage.getItem("access_token");
        axios.delete(`${API_URL}/buku/${formModal.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }).then(() => {
            setIsDeleteModalOpen(false);
            setAlert("Buku berhasil dihapus!");
            fetchData();
        }).catch(err => {
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
            setError(err.response?.data);
        });
    }

    function resetForm() {
        setFormModal({
            id: "",
            judul: "",
            pengarang: "",
            penerbit: "",
            tahun_terbit: "",
            stok: "",
            detail: "",
            no_rak: "",
        });
        setError([]);
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {alert && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{alert}</div>}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Daftar Buku</h2>
                <div className="flex gap-3">
                    <button
                        onClick={handleSortByTitle}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    >
                        Sort Judul A-Z
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Tambah Buku
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold">
                            <th className="p-3 border">#</th>
                            <th className="p-3 border">Judul</th>
                            <th className="p-3 border">Pengarang</th>
                            <th className="p-3 border">No Rak</th>
                            <th className="p-3 border">Penerbit</th>
                            <th className="p-3 border">Tahun</th>
                            <th className="p-3 border">Stok</th>
                            <th className="p-3 border">Detail</th>
                            <th className="p-3 border">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center p-4">Tidak ada buku</td>
                            </tr>
                        ) : (
                            books.map((item, index) => (
                                <tr key={item.id} className="text-sm hover:bg-gray-50">
                                    <td className="p-3 border">{index + 1}</td>
                                    <td className="p-3 border">{item.judul}</td>
                                    <td className="p-3 border">{item.pengarang}</td>
                                    <td className="p-3 border">{item.no_rak}</td>
                                    <td className="p-3 border">{item.penerbit}</td>
                                    <td className="p-3 border">{item.tahun_terbit}</td>
                                    <td className="p-3 border">{item.stok}</td>
                                    <td className="p-3 border">{item.detail}</td>
                                    <td className="p-3 border">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setFormModal({ ...item });
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Detail
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFormModal({ ...item });
                                                    setIsEditModalOpen(true);
                                                    setError([]);
                                                }}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFormModal({ id: item.id });
                                                    setIsDeleteModalOpen(true);
                                                    setError([]);
                                                }}
                                                className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL TAMBAH */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Buku">
                <form onSubmit={handleSubmitModal}>
                    <InputField label="Judul" value={formModal.judul} onChange={e => setFormModal({ ...formModal, judul: e.target.value })} />
                    <InputField label="Pengarang" value={formModal.pengarang} onChange={e => setFormModal({ ...formModal, pengarang: e.target.value })} />
                    <InputField label="Penerbit" value={formModal.penerbit} onChange={e => setFormModal({ ...formModal, penerbit: e.target.value })} />
                    <InputField label="Tahun Terbit" value={formModal.tahun_terbit} onChange={e => setFormModal({ ...formModal, tahun_terbit: e.target.value })} />
                    <InputField label="Stok" value={formModal.stok} onChange={e => setFormModal({ ...formModal, stok: e.target.value })} />
                    <InputField label="No Rak" value={formModal.no_rak} onChange={e => setFormModal({ ...formModal, no_rak: e.target.value })} />
                    <InputField label="Detail" value={formModal.detail} onChange={e => setFormModal({ ...formModal, detail: e.target.value })} />
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Batal</button>
                    </div>
                </form>
            </Modal>

            {/* MODAL EDIT */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Buku">
                <form onSubmit={handleEditSubmit}>
                    <InputField label="Judul" value={formModal.judul} onChange={e => setFormModal({ ...formModal, judul: e.target.value })} />
                    <InputField label="Pengarang" value={formModal.pengarang} onChange={e => setFormModal({ ...formModal, pengarang: e.target.value })} />
                    <InputField label="Penerbit" value={formModal.penerbit} onChange={e => setFormModal({ ...formModal, penerbit: e.target.value })} />
                    <InputField label="Tahun Terbit" value={formModal.tahun_terbit} onChange={e => setFormModal({ ...formModal, tahun_terbit: e.target.value })} />
                    <InputField label="Stok" value={formModal.stok} onChange={e => setFormModal({ ...formModal, stok: e.target.value })} />
                    <InputField label="No Rak" value={formModal.no_rak} onChange={e => setFormModal({ ...formModal, no_rak: e.target.value })} />
                    <InputField label="Detail" value={formModal.detail} onChange={e => setFormModal({ ...formModal, detail: e.target.value })} />
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">Update</button>
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Batal</button>
                    </div>
                </form>
            </Modal>

            {/* MODAL DETAIL */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detail Buku">
                <div className="space-y-2 text-sm">
                    <p><strong>Judul:</strong> {formModal.judul}</p>
                    <p><strong>Pengarang:</strong> {formModal.pengarang}</p>
                    <p><strong>Penerbit:</strong> {formModal.penerbit}</p>
                    <p><strong>Tahun Terbit:</strong> {formModal.tahun_terbit}</p>
                    <p><strong>Stok:</strong> {formModal.stok}</p>
                    <p><strong>No Rak:</strong> {formModal.no_rak}</p>
                    <p><strong>Detail:</strong> {formModal.detail}</p>
                </div>
            </Modal>

            {/* MODAL DELETE */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Buku">
                <p>Yakin ingin menghapus buku ini?</p>
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Hapus</button>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Batal</button>
                </div>
            </Modal>
        </div>
    );
}

function InputField({ label, value, onChange }) {
    return (
        <div className="mb-3">
            <label className="block mb-1 font-medium text-sm">{label}</label>
            <input
                type="text"
                value={value}
                onChange={onChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
        </div>
    );
}
