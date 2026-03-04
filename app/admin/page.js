"use client";
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  // --- STATE UNTUK KEAMANAN (LOGIN) ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Ini adalah password rahasia kamu. Boleh diganti sesuai selera nanti!
  const PASSWORD_RAHASIA = "admin123";

  // --- STATE UNTUK DATA PESANAN ---
  const [pesanan, setPesanan] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- FUNGSI PROSES LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault(); // Biar web nggak kedip (refresh) pas tekan Enter
    
    if (passwordInput === PASSWORD_RAHASIA) {
      setIsAuthenticated(true); // Gembok terbuka!
      setLoginError('');
      fetchPesanan(); // Langsung tarik data pesanan dari Supabase
    } else {
      setLoginError('Duh, passwordnya salah! Coba ingat-ingat lagi.');
    }
  };

  // --- FUNGSI TARIK DATA (Sama kayak sebelumnya) ---
  const fetchPesanan = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('pesanan')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Gagal menarik data:", error);
      alert("Gagal menarik data pesanan.");
    } else {
      setPesanan(data);
    }
    setIsLoading(false);
  };

  // --- FUNGSI SELESAIKAN PESANAN (Sama kayak sebelumnya) ---
  const handleSelesaikan = async (id) => {
    const konfirmasi = window.confirm("Apakah pesanan ini sudah selesai diantar dan ingin dihapus dari daftar?");
    
    if (konfirmasi) {
      const { error } = await supabase
        .from('pesanan')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Gagal menyelesaikan pesanan.");
      } else {
        setPesanan(pesanan.filter((item) => item.id !== id));
      }
    }
  };

  // ==========================================
  // 1. TAMPILAN JIKA BELUM LOGIN (HALAMAN GEMBOK)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-slate-100 text-center">
          <div className="text-6xl mb-4 animate-bounce">🔐</div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Area Terbatas</h1>
          <p className="text-slate-500 text-sm mb-6">Silakan masukkan password admin untuk melihat data pesanan.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="Masukkan Password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none text-center font-bold tracking-widest transition-colors"
              />
              {loginError && (
                <p className="text-red-500 text-sm font-medium mt-2 animate-pulse">{loginError}</p>
              )}
            </div>
            <button 
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95"
            >
              Buka Gembok 🔓
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. TAMPILAN JIKA SUDAH LOGIN (DASHBOARD UTAMA)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER ADMIN --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              📦 Dashboard Admin
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Pantau dan kelola pesanan masuk di sini.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={fetchPesanan}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95"
            >
              🔄 Refresh Data
            </button>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95"
            >
              Keluar 🚪
            </button>
          </div>
        </div>

        {/* --- TABEL PESANAN --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-200">Waktu Pesan</th>
                  <th className="p-4 font-bold border-b border-slate-200">Pelanggan</th>
                  <th className="p-4 font-bold border-b border-slate-200">Pesanan</th>
                  <th className="p-4 font-bold border-b border-slate-200">Pengantaran</th>
                  <th className="p-4 font-bold border-b border-slate-200">Total Bayar</th>
                  <th className="p-4 font-bold border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl animate-spin">⏳</span>
                        Sedang menarik data dari database...
                      </div>
                    </td>
                  </tr>
                ) : pesanan.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-500 font-medium">
                      Yeay! Semua pesanan sudah diselesaikan hari ini 🍃
                    </td>
                  </tr>
                ) : (
                  pesanan.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      
                      <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })} WIB
                      </td>
                      
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{item.nama}</div>
                        <div className="text-xs text-slate-500 mt-1 max-w-[150px] md:max-w-[200px] truncate" title={item.alamat}>
                          📍 {item.alamat}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-blue-600">{item.jumlah} Galon</div>
                        <div className="text-xs text-slate-600 mt-1 font-medium">{item.jenis_air}</div>
                      </td>

                      <td className="p-4 text-sm text-slate-700 font-medium whitespace-nowrap">
                        ⏰ {item.waktu_pengantaran || "Secepatnya"}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800">
                          Rp {item.jumlah_bayar ? item.jumlah_bayar.toLocaleString('id-ID') : '0'}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase bg-slate-100 inline-block px-2 py-0.5 rounded">
                          💳 {item.metode_pembayaran || "Cash"}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleSelesaikan(item.id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors active:scale-95"
                        >
                          ✅ Selesaikan
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}