"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  // --- STATE UNTUK LOGIN ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- STATE UNTUK DATA ---
  const [pesanan, setPesanan] = useState([]);
  const [pelanggan, setPelanggan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pesanan'); // Tab: pesanan, riwayat, pelanggan
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🔥 [BARU] STATE UNTUK STATUS TOKO
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    const checkLogin = localStorage.getItem('isRumahAlkalineAdmin');
    if (checkLogin === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('isRumahAlkalineAdmin', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    const confirm = window.confirm("Yakin ingin keluar dari Dashboard?");
    if (confirm) {
      setIsAuthenticated(false);
      localStorage.removeItem('isRumahAlkalineAdmin');
      setPasswordInput('');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 🔥 [BARU] Ambil status Buka/Tutup Toko dari Supabase
      const { data: storeData, error: storeError } = await supabase
        .from('store_settings')
        .select('is_open')
        .eq('id', 1)
        .single();
      
      if (storeError) console.error("Error ambil status toko:", storeError);
      else if (storeData) setIsStoreOpen(storeData.is_open);

      // Ambil data Pesanan
      const { data: dataPesanan, error: errPesanan } = await supabase
        .from('pesanan')
        .select('*')
        .order('created_at', { ascending: false });
      if (errPesanan) console.error("Error ambil pesanan:", errPesanan);
      else setPesanan(dataPesanan);

      // Ambil data Pelanggan
      const { data: dataPelanggan, error: errPelanggan } = await supabase
        .from('pelanggan')
        .select('*')
        .order('total_poin', { ascending: false });
      if (errPelanggan) console.error("Error ambil pelanggan:", errPelanggan);
      else setPelanggan(dataPelanggan);
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // 🔥 [BARU] Fungsi buat ganti status Toko (Buka/Tutup)
  const toggleStoreStatus = async () => {
    const newStatus = !isStoreOpen; // Kebalikan dari status sekarang
    const konfirmasi = window.confirm(newStatus ? "Yakin ingin MEMBUKA toko sekarang?" : "Yakin ingin MENUTUP toko sekarang? (Pembeli tidak akan bisa pesan)");
    
    if (konfirmasi) {
      const { error } = await supabase
        .from('store_settings')
        .update({ is_open: newStatus })
        .eq('id', 1);

      if (error) {
        alert("Gagal mengubah status toko! " + error.message);
      } else {
        setIsStoreOpen(newStatus);
        // Nggak perlu alert biar nggak berisik, tampilannya langsung berubah
      }
    }
  };

  // --- FUNGSI UPDATE STATUS PESANAN ---
  const updateStatusPesanan = async (id, statusBaru) => {
    let konfirmasi = true;
    if (statusBaru === 'Selesai') {
      konfirmasi = window.confirm("Tandai pesanan ini sudah selesai? (Akan dipindah ke tab Riwayat)");
    }

    if (konfirmasi) {
      const { error } = await supabase.from('pesanan').update({ status_pesanan: statusBaru }).eq('id', id);
      if (error) {
        alert("Gagal update status! Penyebab: " + error.message);
        console.error(error);
      } else {
        fetchData(); // Refresh data
      }
    } else {
      fetchData(); // Kembalikan dropdown ke awal jika batal
    }
  };

  // --- FILTERING DATA PENCARIAN & TAB ---
  const filteredPesananGlobal = pesanan.filter((p) => 
    p.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.no_wa?.includes(searchQuery)
  );

  const pesananAktif = filteredPesananGlobal.filter(p => p.status_pesanan !== 'Selesai');
  const pesananSelesai = filteredPesananGlobal.filter(p => p.status_pesanan === 'Selesai');

  const filteredPelanggan = pelanggan.filter((user) => 
    user.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.no_wa?.includes(searchQuery)
  );

  // --- EXPORT DATA ---
  const handleExportCSV = () => {
    let dataToExport = [];
    let fileName = '';

    if (activeTab === 'pesanan') {
      dataToExport = pesananAktif;
      fileName = 'Laporan_Pesanan_Aktif.csv';
    } else if (activeTab === 'riwayat') {
      dataToExport = pesananSelesai;
      fileName = 'Laporan_Riwayat_Selesai.csv';
    } else {
      dataToExport = filteredPelanggan;
      fileName = 'Laporan_Pelanggan.csv';
    }

    if (dataToExport.length === 0) {
      alert("Tidak ada data untuk di-export!");
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const csvRows = dataToExport.map(row => 
      Object.values(row).map(val => {
        let str = String(val !== null && val !== undefined ? val : '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // TAMPILAN JIKA BELUM LOGIN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">💧 Rumah Alkaline</h1>
            <p className="text-slate-500 text-sm">Silakan masukkan password untuk masuk ke Dashboard Admin.</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Password Admin</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
              {loginError && (
                <p className="text-red-500 text-xs font-bold mt-2">❌ Password salah! Coba lagi.</p>
              )}
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              Masuk Dashboard 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- KOMPONEN TABEL PESANAN ---
  const TabelPesanan = ({ dataPesanan }) => {
    if (dataPesanan.length === 0) {
      return (
        <div className="p-10 text-center text-slate-500 font-bold">
          Tidak ada data. 💤
        </div>
      );
    }

    return (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b">
            <th className="p-4 font-bold">Waktu Pesan</th>
            <th className="p-4 font-bold">Pelanggan</th>
            <th className="p-4 font-bold">Pesanan</th>
            <th className="p-4 font-bold">Total Bayar</th>
            <th className="p-4 font-bold text-center">Status Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dataPesanan.map((p) => {
            const tgl = new Date(p.created_at).toLocaleString('id-ID', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });
            
            return (
              <tr key={p.id} className={`transition-colors ${p.status_pesanan === 'Selesai' ? 'bg-green-50/30' : 'hover:bg-slate-50'}`}>
                <td className="p-4 text-sm text-slate-600">{tgl} WIB</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">{p.nama}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      p.tipe_pembeli === 'Member' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {p.tipe_pembeli || 'Baru'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">📍 {p.alamat}</p>
                  <p className="text-xs text-blue-500 font-medium mt-1">📱 {p.no_wa}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-blue-600">{p.jumlah} Galon</p>
                  <p className="text-xs text-slate-500">{p.jenis_air}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-slate-800">Rp {p.jumlah_bayar?.toLocaleString('id-ID') || 0}</p>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">
                    {p.metode_pembayaran || 'CASH'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <select
                    value={p.status_pesanan || 'Menunggu'}
                    onChange={(e) => updateStatusPesanan(p.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg shadow-sm border focus:outline-none cursor-pointer appearance-none text-center ${
                      p.status_pesanan === 'Selesai' ? 'bg-green-100 text-green-700 border-green-300' :
                      p.status_pesanan === 'Sedang Dikirim' ? 'bg-blue-100 text-blue-700 border-blue-300' : 
                      'bg-yellow-100 text-yellow-700 border-yellow-300'
                    }`}
                  >
                    <option value="Menunggu">⏳ Menunggu</option>
                    <option value="Sedang Dikirim">🛵 Sedang Dikirim</option>
                    <option value="Selesai">✅ Selesai</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // ==========================================
  // TAMPILAN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER ADMIN --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">📦 Dashboard Admin</h1>
            <p className="text-slate-500 text-sm mt-1">Pantau pesanan dan kelola poin pelanggan di sini.</p>
            
            {/* 🔥 [BARU] SAKLAR BUKA TUTUP TOKO */}
            <div className="mt-4 flex items-center gap-3 bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 inline-flex">
              <span className="text-sm font-bold text-slate-600">Status Toko:</span>
              <button 
                onClick={toggleStoreStatus}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${isStoreOpen ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isStoreOpen ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-black ${isStoreOpen ? 'text-green-600' : 'text-red-500'}`}>
                {isStoreOpen ? '✅ BUKA' : '❌ TUTUP'}
              </span>
            </div>

          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-green-50 text-green-600 font-bold rounded-lg border border-green-200 hover:bg-green-100 flex items-center gap-2">📥 Export Data</button>
            <button onClick={fetchData} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-200 hover:bg-blue-100 flex items-center gap-2">🔄 Refresh Data</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-200 hover:bg-red-100 flex items-center gap-2">🚪 Keluar</button>
          </div>
        </div>

        {/* --- NAVIGASI TAB --- */}
        <div className="flex flex-wrap gap-4 mb-4">
          <button 
            onClick={() => { setActiveTab('pesanan'); setSearchQuery(''); }}
            className={`px-6 py-3 rounded-xl font-bold shadow-sm ${activeTab === 'pesanan' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            📋 Pesanan Aktif ({pesananAktif.length})
          </button>
          <button 
            onClick={() => { setActiveTab('riwayat'); setSearchQuery(''); }}
            className={`px-6 py-3 rounded-xl font-bold shadow-sm ${activeTab === 'riwayat' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            ✅ Riwayat Selesai ({pesananSelesai.length})
          </button>
          <button 
            onClick={() => { setActiveTab('pelanggan'); setSearchQuery(''); }}
            className={`px-6 py-3 rounded-xl font-bold shadow-sm ${activeTab === 'pelanggan' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            👥 Data Pelanggan ({pelanggan.length})
          </button>
        </div>

        {/* --- KOLOM PENCARIAN --- */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="🔍 Cari nama atau no WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* --- KONTEN BAWAH --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-slate-500 font-bold">Memuat data... ⏳</div>
          ) : (
            <>
              {activeTab === 'pesanan' && <TabelPesanan dataPesanan={pesananAktif} />}
              {activeTab === 'riwayat' && <TabelPesanan dataPesanan={pesananSelesai} />}
              
              {activeTab === 'pelanggan' && (
                filteredPelanggan.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 font-bold">Tidak ada data pelanggan. 🕵️‍♂️</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b">
                        <th className="p-4 font-bold">Nomor WA</th>
                        <th className="p-4 font-bold">Nama Pelanggan</th>
                        <th className="p-4 font-bold text-center">Total Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPelanggan.map((user) => (
                        <tr key={user.no_wa} className="hover:bg-slate-50">
                          <td className="p-4 text-sm font-bold text-slate-700 font-mono">{user.no_wa}</td>
                          <td className="p-4 font-bold text-slate-800 uppercase">{user.nama}</td>
                          <td className="p-4 text-center">
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-bold">
                              ✨ {user.total_poin} Poin
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}