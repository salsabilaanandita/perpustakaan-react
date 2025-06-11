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

    const [searchKtp, setSearchKtp] = useState(""); // Tambahkan state search
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
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                setMembers(res.data);
            })
            .catch((err) => {
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
        axios.post(`${API_URL}/member`, formModal, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                fetchData();
                setAlert("Member berhasil ditambahkan!");
                setIsModalOpen(false);
                setFormModal({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "", detail: "" });
            })
            .catch((err) => {
                setError(err.response?.data || { message: "Gagal menambahkan member" });
            });
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem("access_token");
        axios.put(`${API_URL}/member/${formModal.id}`, formModal, {
            headers: { Authorization: `Bearer ${token}` }
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
            headers: { Authorization: `Bearer ${token}` }
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

    // Filter members berdasarkan semua kolom
    const filteredMembers = members.filter(item => {
        const search = searchKtp.toLowerCase();
        return (
            item.no_ktp.toLowerCase().includes(search) ||
            item.nama.toLowerCase().includes(search) ||
            item.alamat.toLowerCase().includes(search) ||
            (item.tgl_lahir && item.tgl_lahir.toLowerCase().includes(search))
        );
    });

    return (
        <div className="container mx-auto mt-6 px-4">
            {alert && <div className="bg-green-100 text-green-700 border border-green-400 rounded p-3 mb-4">{alert}</div>}

            <h2 className="text-2xl font-semibold mb-4">Daftar Member</h2>

            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
                    Tambah Member
                </button>
                <input
                    type="text"
                    className="border rounded px-3 py-2 w-full sm:w-64"
                    placeholder="Cari ..."
                    value={searchKtp}
                    onChange={e => setSearchKtp(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2">#</th>
                            <th className="border px-3 py-2">No KTP</th>
                            <th className="border px-3 py-2">Nama</th>
                            <th className="border px-3 py-2">Alamat</th>
                            <th className="border px-3 py-2">Tanggal Lahir</th>
                            <th className="border px-3 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-3">Tidak ada member</td>
                            </tr>
                        ) : (
                            filteredMembers.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border px-3 py-2">{index + 1}</td>
                                    <td className="border px-3 py-2">{item.no_ktp}</td>
                                    <td className="border px-3 py-2">{item.nama}</td>
                                    <td className="border px-3 py-2">{item.alamat}</td>
                                    <td className="border px-3 py-2">{item.tgl_lahir}</td>
                                    <td className="border px-3 py-2 space-x-2">
                                        <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => { setFormModal(item); setIsDetailModalOpen(true); }}>Detail</button>
                                        <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => { setFormModal(item); setIsEditModalOpen(true); setError([]); }}>Edit</button>
                                        <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => { setFormModal({ id: item.id }); setIsDeleteModalOpen(true); setError([]); }}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Member">
                <form onSubmit={handleSubmitModal} className="space-y-4">
                    {error?.message && <div className="text-red-600 bg-red-100 p-2 rounded">{error.message}</div>}

                    <div>
                        <label className="block text-sm font-medium">No KTP</label>
                        <input type="text" className="mt-1 w-full border rounded px-3 py-2" value={formModal.no_ktp} onChange={(e) => setFormModal({ ...formModal, no_ktp: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Nama</label>
                        <input type="text" className="mt-1 w-full border rounded px-3 py-2" value={formModal.nama} onChange={(e) => setFormModal({ ...formModal, nama: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Alamat</label>
                        <input type="text" className="mt-1 w-full border rounded px-3 py-2" value={formModal.alamat} onChange={(e) => setFormModal({ ...formModal, alamat: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tanggal Lahir</label>
                        <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={formModal.tgl_lahir} onChange={(e) => setFormModal({ ...formModal, tgl_lahir: e.target.value })} required />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
                </form>
            </Modal>

            {/* Modal Edit */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Member">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    {error && (
                        <div className="text-red-600 bg-red-100 p-2 rounded">
                            {error.data ? Object.entries(error.data).map(([key, value]) => <div key={key}>{value}</div>) : <div>{error.message}</div>}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium">No KTP</label>
                        <input type="text" className="mt-1 w-full border rounded px-3 py-2" value={formModal.no_ktp} onChange={(e) => setFormModal({ ...formModal, no_ktp: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Nama</label>
                        <input type="text" className="mt-1 w-full border rounded px-3 py-2" value={formModal.nama} onChange={(e) => setFormModal({ ...formModal, nama: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Alamat</label>
                        <input type="text" className="mt-1 w-full border rounded px-3 py-2" value={formModal.alamat} onChange={(e) => setFormModal({ ...formModal, alamat: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tanggal Lahir</label>
                        <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={formModal.tgl_lahir} onChange={(e) => setFormModal({ ...formModal, tgl_lahir: e.target.value })} required />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                </form>
            </Modal>

            {/* Modal Delete */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Member">
                <p className="mb-4">Apakah kamu yakin ingin menghapus member ini?</p>
                <div className="flex justify-end space-x-2">
                    <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setIsDeleteModalOpen(false)}>Batal</button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Hapus</button>
                </div>
            </Modal>

            {/* Modal Detail */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detail Member">
                <div className="space-y-2">
                    <p><strong>No KTP:</strong> {formModal.no_ktp}</p>
                    <p><strong>Nama:</strong> {formModal.nama}</p>
                    <p><strong>Alamat:</strong> {formModal.alamat}</p>
                    <p><strong>Tanggal Lahir:</strong> {formModal.tgl_lahir}</p>
                </div>
            </Modal>
        </div>
    );
}
