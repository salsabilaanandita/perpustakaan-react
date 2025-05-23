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
    <div className="container mt-4">
      <h2 className="mb-4">Peminjaman Buku</h2>

      {alert && <div className="alert alert-success">{alert}</div>}

      {books.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Judul Buku</th>
                <th>Stok</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, index) => (
                <tr key={book.id}>
                  <td>{index + 1}</td>
                  <td>{book.judul || 'No Title'}</td>
                  <td>{book.stok || 0}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${book.stok > 0 ? 'btn-primary' : 'btn-secondary'}`}
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
        <div className="alert alert-info">
          Tidak ada buku tersedia
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Peminjaman Buku">
        {error && (
          <div className="alert alert-danger">{error.message}</div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="mb-3">
            <label className="form-label">ID Buku</label>
            <input
              type="text"
              className="form-control"
              value={formModal.id_buku}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Pilih Member</label>
            <select
              className="form-control"
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
          <div className="mb-3">
            <label className="form-label">Tanggal Pinjam</label>
            <input
              type="date"
              className="form-control"
              value={formModal.tgl_pinjam}
              onChange={(e) => setFormModal({ ...formModal, tgl_pinjam: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tanggal Pengembalian</label>
            <input
              type="date"
              className="form-control"
              value={formModal.tgl_pengembalian}
              onChange={(e) => setFormModal({ ...formModal, tgl_pengembalian: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Pinjam Buku</button>
        </form>
      </Modal>
    </div>
  );
}
