import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../constant';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export default function LendingIndex() {
  const [searchMember, setSearchMember] = useState('');
  const [lendings, setLendings] = useState([]);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLending, setSelectedLending] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedMemberHistory, setSelectedMemberHistory] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateFineModalOpen, setIsCreateFineModalOpen] = useState(false);
  const [fineType, setFineType] = useState('terlambat');
  const [fineAmount, setFineAmount] = useState('0');
  const [description, setDescription] = useState(''); 

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFine = (lending) => {
    setSelectedLending(lending);
    const today = new Date();
    const dueDate = new Date(lending.tgl_pengembalian);
    const diffTime = today - dueDate;
    const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setFineAmount((lateDays > 0 ? lateDays * 1000 : 0).toString());
    setDescription(`Terlambat ${lateDays} hari`);
    setIsCreateFineModalOpen(true);
  };

  function fetchData() {
    const token = localStorage.getItem('access_token');
    axios.get(`${API_URL}/peminjaman`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    })
      .then(res => {
        const lendingsData = res.data.data || res.data;
        setLendings(lendingsData);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/login");
        }
        setError("Gagal mengambil data peminjaman");
      });
  }

  const handleSubmitFine = () => {
    const token = localStorage.getItem("access_token");
    setError(null);



    const fineData = {
      id_peminjaman: selectedLending.id,
      id_member: selectedLending.id_member,
      id_buku: selectedLending.id_buku,
      jenis_denda: fineType,
      jumlah_denda: fineAmount,
      deskripsi: description || (fineType === 'terlambat' ?
        `Terlambat ${Math.ceil(fineAmount / 1000)} hari` :
        'Kerusakan buku')
    };


    axios.post(`${API_URL}/denda`, fineData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        setAlert('Denda berhasil ditambahkan!');
        setIsCreateFineModalOpen(false);
        setDescription('');
        // Update the lending status and show detail modal
        setLendings(prevLendings => 
          prevLendings.map(lending => 
            lending.id === selectedLending.id 
              ? { ...lending, hasDenda: true }
              : lending
          )
        );
        handleViewDetail(selectedLending); // Show detail modal after creating fine
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/login");
        }
        setError(err.response?.data?.message || "Gagal menambahkan denda");
      });
  };

  const handleViewDetail = (lending) => {
    setSelectedLending(lending);
    setIsDetailModalOpen(true);
  };

  const handleReturn = (lending) => {
    setSelectedLending(lending);
    setIsModalOpen(true);
  };

  const exportToExcel = () => {
    if (lendings.length === 0) {
      alert("Data kosong, tidak bisa export");
      return;
    }

    // Siapkan data untuk sheet (array objek atau array array)
    const dataToExport = lendings.map((item, index) => ({
      No: index + 1,
      'ID Buku': item.id_buku,
      'ID Member': item.id_member,
      'Tanggal Pinjam': item.tgl_pinjam,
      'Tanggal Pengembalian': item.tgl_pengembalian,
      'Status Pengembalian': item.status_pengembalian ? 'Pengembalian selesai' : 'Dalam masa peminjaman',
    }));

    // Buat worksheet dari data
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Buat workbook dan masukkan worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman");

    // Generate buffer file Excel
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Simpan file dengan file-saver
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'data_peminjaman.xlsx');
  };

  const confirmReturn = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const today = new Date();

    const returnData = {
      id_peminjaman: selectedLending.id,
      tanggal_kembali: today.toISOString().split('T')[0]
    };

    axios.put(`${API_URL}/peminjaman/pengembalian/${selectedLending.id}`, returnData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(() => {
      setAlert('Buku berhasil dikembalikan!');
      setIsModalOpen(false);
      setLendings(prevLendings => 
        prevLendings.map(lending => 
          lending.id === selectedLending.id 
            ? { ...lending, status_pengembalian: true, hasDenda: false }
            : lending
        )
      );
    })
    .catch(err => {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      setError(err.response?.data?.message || "Gagal mengembalikan buku");
    });
  };

  //fitur search by id_member
  const filteredLendings = lendings.filter(lending =>
    searchMember ? lending.id_member.toString().includes(searchMember) : true
  );

  //untuk melihat riwayat 
  const handleViewHistory = (memberId) => {
    const memberHistory = lendings.filter(lending =>
      lending.id_member.toString() === memberId.toString()
    );
    setSelectedMemberHistory({
      id: memberId,
      history: memberHistory
    });
    setIsHistoryModalOpen(true);
  };

  // Add the PDF export function for member history
  const exportMemberHistoryToPDF = () => {
    if (!selectedMemberHistory || selectedMemberHistory.history.length === 0) {
      alert("Data kosong, tidak bisa export");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`Riwayat Peminjaman - Member ID: ${selectedMemberHistory.id}`, 14, 15);
    
    // Prepare table data
    const tableColumn = ["No", "ID Buku", "Tanggal Pinjam", "Tanggal Pengembalian", "Status"];
    const tableRows = selectedMemberHistory.history.map((item, index) => [
      index + 1,
      item.id_buku,
      item.tgl_pinjam,
      item.tgl_pengembalian,
      item.status_pengembalian ? 'Selesai' : 'Dipinjam'
    ]);

    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    // Save the PDF
    doc.save(`riwayat_peminjaman_${selectedMemberHistory.id}.pdf`);
  };

  return (
    <div className="container mt-4">
      <h2>Data Peminjaman</h2>
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-info" onClick={exportToExcel}>
          Export Excel
        </button>
      </div>

      {alert && <div className="alert alert-success">{alert}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search by Member ID..."
          value={searchMember}
          onChange={(e) => setSearchMember(e.target.value)}
        />
      </div>

      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>ID Buku</th>
            <th>ID Member</th>
            <th>Tanggal Pinjam</th>
            <th>Tanggal Pengembalian</th>
            <th>Status Pengembalian</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredLendings.length > 0 ? (
            filteredLendings.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.id_buku}</td>
                <td>{item.id_member}</td>
                <td>{item.tgl_pinjam}</td>
                <td>{item.tgl_pengembalian}</td>
                <td>
                  {item.status_pengembalian ? (
                    <span className="text-success">Pengembalian selesai</span>
                  ) : (
                    <span className="text-danger">Dalam masa peminjaman</span>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {!item.status_pengembalian ? (
                      <button
                        className="btn btn-sm"
                        onClick={() => handleReturn(item)}
                        style={{  backgroundColor: '#198754',color: 'white',border: 'none',padding: '6px 12px',borderRadius: '4px'}}
                      >
                        Pengembalian
                      </button>
                    ) : !item.hasDenda ? (
                      new Date() > new Date(item.tgl_pengembalian) ? (
                        <button
                          className="btn btn-warning btn-sm"
                          style={{ backgroundColor: '#FFA500', border: 'none', color: 'white' }}
                          onClick={() => handleCreateFine(item)}
                        >
                          Create Denda
                        </button>
                      ) : (
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewDetail(item)}
                        >
                          Detail
                        </button>
                      )
                    ) : (
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewDetail(item)}
                      >
                        Detail
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleViewHistory(item.id_member)}
                    >
                      History
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">Tidak ada data peminjaman</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Peminjaman"
      >
        <div className="p-3" >
          {selectedLending && (
            <table className="table table-bordered">
              <tbody>
                <tr><th>ID Peminjaman</th><td>{selectedLending.id}</td></tr>
                <tr><th>ID Buku</th><td>{selectedLending.id_buku}</td></tr>
                <tr><th>ID Member</th><td>{selectedLending.id_member}</td></tr>
                <tr><th>Tanggal Pinjam</th><td>{selectedLending.tgl_pinjam}</td></tr>
                <tr><th>Tanggal Pengembalian</th><td>{selectedLending.tgl_pengembalian}</td></tr>
                <tr>
                  <th>Status</th>
                  <td>
                    {new Date() > new Date(selectedLending.tgl_pengembalian) ?
                      <span className="text-danger">Terlambat</span> :
                      <span className="text-danger">Kerusakan</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Konfirmasi Pengembalian"
      >
        <form onSubmit={confirmReturn}>
          <div className="p-3">
            {selectedLending && (
              <>
                <div className="mb-3">
                  <h5>Pengembalian Buku</h5>
                  <p>Tanggal Pinjam: {new Date(selectedLending.tgl_pinjam).toLocaleDateString('id-ID')}</p>
                  <p>Tanggal Jatuh Tempo: {new Date(selectedLending.tgl_pengembalian).toLocaleDateString('id-ID')}</p>
                  
                  {new Date() > new Date(selectedLending.tgl_pengembalian) && (
                    <div className="alert alert-warning">
                      <strong>Perhatian!</strong> Buku ini dikembalikan terlambat. 
                      Denda keterlambatan akan otomatis dibuat setelah pengembalian.
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Tutup</button>
                  <button type="submit" className="btn btn-success">Proses Pengembalian</button>
                </div>
              </>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal Riwayat */}
      <Modal 
      isOpen={isHistoryModalOpen} 
      onClose={() => setIsHistoryModalOpen(false)} 
      title={`Riwayat Peminjaman - Member ID: ${selectedMemberHistory?.id}`}
      >
        <div className="p-3">
          <div className="d-flex justify-content-end mb-3">
            {selectedMemberHistory?.history?.length > 0 && (
              <button 
                className="btn btn-danger"
                onClick={exportMemberHistoryToPDF}
              >
                Export PDF
              </button>
            )}
          </div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>ID Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Tanggal Pengembalian</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedMemberHistory?.history.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.id_buku}</td>
                  <td>{item.tgl_pinjam}</td>
                  <td>{item.tgl_pengembalian}</td>
                  <td>{item.status_pengembalian ? 'Selesai' : 'Dipinjam'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Modal Buat Denda */}
      <Modal
        isOpen={isCreateFineModalOpen}
        onClose={() => setIsCreateFineModalOpen(false)}
        title="Buat Denda"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmitFine();
        }}>
          <div className="p-3">
            <div className="mb-3">
              <label className="form-label">Jenis Denda</label>
              <select
                className="form-select"
                value={fineType}
                onChange={(e) => {
                  setFineType(e.target.value);
                  if (e.target.value === 'terlambat') {
                    const lateDays = Math.ceil((new Date() - new Date(selectedLending.tgl_pengembalian)) / (1000 * 60 * 60 * 24));
                    setFineAmount((lateDays * 1000).toString());
                    setDescription(`Terlambat ${lateDays} hari`);
                  } else {
                    setFineAmount('20000');
                    setDescription('Kerusakan buku');
                  }
                }}
              >
                <option value="terlambat">Keterlambatan</option>
                <option value="kerusakan">Kerusakan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Jumlah Denda</label>
              <input
                type="text"
                className="form-control"
                value={`Rp ${fineAmount.toLocaleString('id-ID')}`}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Deskripsi</label>
              <input className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreateFineModalOpen(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan Denda</button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}



