import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../constant';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal'; // Note the capital 'M'

export default function Lending() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formModal, setFormModal] = useState({
    id_buku: '',
    id_member: '',
    tgl_pinjam: '',
    tgl_pengembalian: ''
  });

  const navigate = useNavigate();

  const [members, setMembers] = useState([]);

    useEffect(() => {
      fetchData();
    }, []);

    const handleSelectBook = (book) => {
      setSelectedBook(book);
      setIsModalOpen(true);
      fetchMembers();
      setFormModal({
        ...formModal,
        id_buku: book.id
      });
    };

    function fetchMembers() {
      const token = localStorage.getItem("access_token");
      axios.get(`${API_URL}/member`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setMembers(res.data);
      })
      .catch(err => console.error('Error fetching members:', err));
    }

  function fetchData() {
    const token = localStorage.getItem("access_token");
    axios.get(`${API_URL}/buku`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setBooks(res.data);
    })
    .catch(err => {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      setError({ message: "Gagal mengambil data buku" });
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    // Convert string IDs to numbers
    const formData = {
      ...formModal,
      id_buku: parseInt(formModal.id_buku),
      id_member: parseInt(formModal.id_member),
      // Ensure dates are in YYYY-MM-DD format
      tgl_pinjam: new Date(formModal.tgl_pinjam).toISOString().split('T')[0],
      tgl_pengembalian: new Date(formModal.tgl_pengembalian).toISOString().split('T')[0]
    };

    axios.post(`${API_URL}/peminjaman`, formData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      if (response.data) {
        setIsModalOpen(false);
        setFormModal({
          id_buku: '',
          id_member: '',
          tgl_pinjam: '',
          tgl_pengembalian: ''
        });
        setAlert('Berhasil menambahkan peminjaman!');
        fetchData();
      }
    })
    .catch(err => {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      setError(err.response?.data || { message: "Gagal meminjam buku" });
      console.error('Error details:', err.response?.data);
    });
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="mb-6 text-2xl font-bold">Peminjaman Buku</h2>

      {alert && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          {alert}
        </div>
      )}

      {books.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Judul Buku</th>
                <th className="px-3 py-2">Stok</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, index) => (
                <tr key={book.id} className="border-t">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">{book.judul || 'No Title'}</td>
                  <td className="px-3 py-2">{book.stok || 0}</td>
                  <td className="px-3 py-2">
                    <button
                      className={`px-3 py-1 rounded text-white text-sm transition ${
                        book.stok > 0
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      disabled={book.stok <= 0}
                      onClick={() => handleSelectBook(book)}
                    >
                      {book.stok > 0 ? 'Pinjam' : 'Stok Habis'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded mb-4">
          Tidak ada buku tersedia
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Peminjaman Buku">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error.message}
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">ID Buku</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
              value={formModal.id_buku}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Pilih Member</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formModal.id_member}
              onChange={(e) => setFormModal({ ...formModal, id_member: e.target.value })}
              required
            >
              <option value="">-- Pilih Member --</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.nama} ({member.no_ktp})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Tanggal Pinjam</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formModal.tgl_pinjam}
              onChange={(e) => setFormModal({ ...formModal, tgl_pinjam: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium">Tanggal Pengembalian</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formModal.tgl_pengembalian}
              onChange={(e) => setFormModal({ ...formModal, tgl_pengembalian: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition"
          >
            Pinjam Buku
          </button>
        </form>
      </Modal>
    </div>
  );
}
