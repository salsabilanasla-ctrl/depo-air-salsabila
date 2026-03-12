"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // INI KURIR SUPABASE-NYA

// --- DATA PRODUK ---
const products = [
  {
    id: 1,
    name: "Organik (RO)",
    price: 7000,
    category: "Ekonomis",
    rahasia: true,
    hasPoints: true,
    image: "/organik.jpg",
    desc: "Air minum ekonomis untuk kebutuhan harian.",
    details: "Air Organik diproses melalui filtrasi mikro yang menyaring partikel kasar. Cocok untuk memasak dan kebutuhan harian."
  },
  {
    id: 2,
    name: "Suli (Pegunungan)",
    price: 19000,
    category: "Premium",
    rahasia: false,
    hasPoints: false,
    image: "/suli.jpg",
    desc: "Air murni TDS 0. Bantu detoks ginjal & kaya oksigen.",
    details: "Air murni (TDS 0) hasil filtrasi berteknologi tinggi bebas polutan.Bantu detoks ginjal & kaya oksigen."
  },
  {
    id: 3,
    name: "Deo (Oxy)",
    price: 15000,
    category: "Best Seller",
    rahasia: false,
    hasPoints: true,
    image: "/deo.jpg",
    desc: "Air Oksigen TDS 0. Solusi sehat untuk ginjal.",
    details: "Air murni dengan kandungan oksigen tinggi dan TDS 0.Solusi sehat untuk ginjal."
  },
  {
    id: 4,
    name: "S+ (Sehat)",
    price: 15000,
    category: "Keluarga",
    rahasia: true,
    hasPoints: false,
    image: "/Splus.jpg",
    desc: "Air sehat seimbang untuk seluruh keluarga.",
    details: "Keseimbangan pH yang sempurna untuk tubuh. Air sehat seimbang untuk seluruh keluarga. Aman dikonsumsi balita hingga lansia."
  },
  {
    id: 5,
    name: "Telaga 8+ (Alkaline)",
    price: 15000,
    category: "Kesehatan",
    rahasia: false,
    hasPoints: false,
    image: "/Telaga8plus.jpg",
    desc: "pH Tinggi untuk detoksifikasi tubuh.",
    details: "Air Alkaline dengan pH 8+ yang membantu menetralkan asam lambung."
  }
];

export default function Home() {
  // === STATE KERANJANG & LOGIC UTAMA ===
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // STATE SLIDER GAMBAR
  const [slideIndex, setSlideIndex] = useState(0);

  // STATE PEMBAYARAN & PENGANTARAN
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashNote, setCashNote] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("Satu Jam Setelah Pemesanan");
  const [jadwalTempo, setJadwalTempo] = useState("Akhir Minggu (Sabtu/Minggu)"); // <-- STATE BARU: Jadwal Tempo

  // STATE FITUR AGEN & POIN
  const [bukaRahasia, setBukaRahasia] = useState(false);
  const [klaimPoinUser, setKlaimPoinUser] = useState(0);
  const [isPakaiPoin, setIsPakaiPoin] = useState(false);

  // STATE FORM SUPABASE
  const [namaPemesan, setNamaPemesan] = useState("");
  const [alamatPemesan, setAlamatPemesan] = useState("");
  const [noWaPemesan, setNoWaPemesan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPoints, setUserPoints] = useState(0); 
  const [statusPembeli, setStatusPembeli] = useState("Baru"); // <-- STATE BARU: Deteksi Pelanggan Baru / Member

  // STATUS TOKO
  const isTokoBuka = true;

  // === DATA GAMBAR SLIDER ===
  const slideImages = [
    "/gambar1.jpg",
    "/gambar2.jpg",
    "/gambar3.jpg",
  ];

  // --- EFEK CEK POIN OTOMATIS BERDASARKAN NO WA ---
  useEffect(() => {
    const cekPoinPelanggan = async () => {
      if (noWaPemesan.length >= 10) {
        const { data, error } = await supabase
          .from('pelanggan')
          .select('total_poin')
          .eq('no_wa', noWaPemesan)
          .single();

        if (data) {
          // Kalau nomor WA udah ada di database
          setUserPoints(data.total_poin || 0);
          setStatusPembeli("Member"); 
        } else {
          // Kalau nomor WA belum ada, TAPI dia udah masukin password rahasia
          setUserPoints(0);
          setStatusPembeli(bukaRahasia ? "Member" : "Baru"); 
        }
      } else {
        setUserPoints(0);
        setStatusPembeli(bukaRahasia ? "Member" : "Baru");
      }
    };

    const jedaNgetik = setTimeout(() => {
      cekPoinPelanggan();
    }, 500);

    return () => clearTimeout(jedaNgetik);
  }, [noWaPemesan, bukaRahasia]); 

  // --- EFEK BARU: RESET TEMPO KALAU KETAHUAN BUKAN MEMBER ---
  useEffect(() => {
    if (statusPembeli === "Baru" && paymentMethod === "tempo") {
      setPaymentMethod("cash"); // Otomatis balik ke cash
    }
  }, [statusPembeli, paymentMethod]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev === slideImages.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [slideImages.length]);

  // Fungsi Tambah/Kurang Item
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // --- CEK APAKAH ADA PRODUK YANG BISA TUKAR POIN DI KERANJANG ---
  const bisaTukarPoin = cart.some((item) => item.hasPoints);

  // --- LOGIKA HITUNG HARGA & POIN ---
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  let eligiblePrices = [];
  cart.forEach(item => {
    if (item.hasPoints) {
      for(let i=0; i < item.qty; i++) {
        eligiblePrices.push(item.price);
      }
    }
  });
  eligiblePrices.sort((a, b) => b - a);

  let nilaiDiskon = 0;
  let poinYangAkanDipotong = 0;

  if (isPakaiPoin && klaimPoinUser >= 10 && bisaTukarPoin) {
    const jumlahGalonGratis = Math.floor(klaimPoinUser / 10);
    poinYangAkanDipotong = jumlahGalonGratis * 10; 
    nilaiDiskon = jumlahGalonGratis * 15000;
  }

  const totalAmount = subtotal > nilaiDiskon ? subtotal - nilaiDiskon : 0;

  // --- FUNGSI CHECKOUT DENGAN SUPABASE (VERSI UPGRADE) ---
  const handleCheckout = async () => {
    if (!namaPemesan || !noWaPemesan || !alamatPemesan) {
      alert("Halo! Tolong isi Nama, Nomor WhatsApp, dan Alamat pengiriman dulu ya biar pesanan dan poinnya aman! 🚚💨");
      return;
    }

    if (isPakaiPoin && klaimPoinUser > userPoints) {
      alert("Waduh, poin yang ingin ditukar melebihi saldo poin Anda nih! Kurangi jumlahnya ya. 🛑");
      return;
    }

    setIsSubmitting(true);

    const namaAir = cart.map((item) => item.name).join(", ");
    const totalGalon = cart.reduce((total, item) => total + item.qty, 0);

    try {
      // 3. Simpan Pesanan ke Supabase
      const { data: dataPesanan, error: errorPesanan } = await supabase
        .from('pesanan')
        .insert([
          {
            no_wa: noWaPemesan,
            nama: namaPemesan,
            jenis_air: namaAir,
            jumlah: totalGalon,
            alamat: alamatPemesan,
            tukar_poin: poinYangAkanDipotong,
            metode_pembayaran: paymentMethod === "tempo" ? `Tempo (${jadwalTempo})` : paymentMethod, // <-- Jadwal Tempo Masuk Sini
            jumlah_bayar: totalAmount,
            waktu_pengantaran: deliveryTime,
            tipe_pembeli: statusPembeli
          }
        ])
        .select();

      if (errorPesanan) {
        setIsSubmitting(false);
        alert(`❌ Gagal masukin data pesanan nih! Error dari Supabase: ${errorPesanan.message}`);
        console.error("DETAIL ERROR PESANAN:", errorPesanan);
        return;
      }

      // 4. Hitung dan Update Poin ke Tabel 'pelanggan'
      let poinBaruDidapat = 0;
      if (!isPakaiPoin) {
        poinBaruDidapat = cart.reduce((total, item) => item.hasPoints ? total + item.qty : total, 0);
      }
      const sisaPoinAkhir = userPoints - poinYangAkanDipotong + poinBaruDidapat;

      if (poinBaruDidapat > 0 || statusPembeli === "Member") {
        const { data: dataPelanggan, error: errorPelanggan } = await supabase
          .from('pelanggan')
          .upsert([
            {
              no_wa: noWaPemesan,
              nama: namaPemesan,
              total_poin: sisaPoinAkhir,
              status_pelanggan: statusPembeli
            }
          ], { onConflict: 'no_wa' })
          .select();

        if (errorPelanggan) {
          setIsSubmitting(false);
          alert(`❌ Gagal update Poin Pelanggan! Error: ${errorPelanggan.message}`);
          console.error("DETAIL ERROR PELANGGAN:", errorPelanggan);
          return;
        }
      }

      // 5. Buat pesan WhatsApp
      const itemsText = cart
        .map((item) => `- ${item.name} (${item.qty}x) = Rp ${(item.price * item.qty).toLocaleString('id-ID')}`)
        .join('\n');

      let paymentInfo = "";
      if (paymentMethod === "cash") paymentInfo = `Tunai/Cash ${cashNote ? `(Uang saya: ${cashNote})` : ""}`;
      else if (paymentMethod === "transfer") paymentInfo = "Transfer (Minta Rekening/QRIS)";
      else if (paymentMethod === "tempo") paymentInfo = `Tempo (Member)\n🗓️ Jadwal Bayar: ${jadwalTempo}`; // <-- Update ke WA Papah

      let pointsMsg = "";
      if (isPakaiPoin && nilaiDiskon > 0) {
         pointsMsg = `\n\n🎟️ *INFO POIN MEMBER*\nSisa Saldo Awal: ${userPoints} Poin\nPotong Poin: -${poinYangAkanDipotong} Poin\n(Setara Potongan Rp ${nilaiDiskon.toLocaleString('id-ID')})\n*Sisa Saldo Sekarang: ${sisaPoinAkhir} Poin*`;
      } else if (poinBaruDidapat > 0) {
         pointsMsg = `\n\n🎟️ *INFO POIN MEMBER*\nPoin Didapat Hari ini: +${poinBaruDidapat} Poin\n*Total Tabungan Poin: ${sisaPoinAkhir} Poin*`;
      }

      const timeInfo = deliveryTime === "Satu Jam Setelah Pemesanan" ? "🚀 1 Jam Setelah Pemesanan" : `JAM ${deliveryTime}`;
      const badgePembeli = statusPembeli === "Baru" ? "🆕 [PELANGGAN BARU]" : "👑 [MEMBER LAMA]";

      const message = `Halo Admin Rumah Alkaline, saya mau pesan:\n\n${badgePembeli}\n*👤 Nama:* ${namaPemesan}\n*📱 No. WA:* ${noWaPemesan}\n*📍 Alamat:* ${alamatPemesan}\n\n${itemsText}\n\n*Subtotal: Rp ${subtotal.toLocaleString()}*\n*Potongan Poin: -Rp ${nilaiDiskon.toLocaleString()}*\n*Total Bayar: Rp ${totalAmount.toLocaleString()}*\n\n----------------\n💳 Pembayaran: ${paymentMethod.toUpperCase()}\n⏰ Waktu Kirim: ${timeInfo}\n📝 Detail: ${paymentInfo}${pointsMsg}\n----------------\n\nTerima Kasih.`;

      setCart([]);
      setKlaimPoinUser(0);
      setIsPakaiPoin(false);
      setIsSubmitting(false);

      alert("✅ Hore! Pesanan berhasil dicatat di database. Klik OK untuk lanjut kirim pesan di WhatsApp ya! 🎉");
      window.location.href = `https://wa.me/6282114596083?text=${encodeURIComponent(message)}`;

    } catch (err) {
      alert("⚠️ Ada masalah koneksi ke server. Coba lagi atau hubungi admin.");
      console.error("FATAL ERROR:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-40 border-b border-slate-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <div className={`p-2 rounded-lg shadow-sm transition-all duration-300 ${bukaRahasia ? 'bg-orange-500' : 'bg-blue-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-tight">
                Rumah<span className="text-blue-500">Alkaline</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-medium tracking-wider">PREMIUM WATER STORE</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (bukaRahasia) {
                  const confirmLogout = confirm("Mau keluar dari Mode Member?");
                  if (confirmLogout) setBukaRahasia(false);
                } else {
                  const sandi = prompt("Masukkan Kode Khusus Member:");
                  if (sandi === "Rumah alkaline aja") {
                    setBukaRahasia(true);
                    alert("✅ Berhasil! Produk S+ & Organik sudah muncul.");
                  } else if (sandi !== null) {
                    alert("❌ Kode salah.");
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${bukaRahasia ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
            >
              {bukaRahasia ? "🔓 Agen Aktif" : "🔐 Masuk Member"}
            </button>

            <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-all" onClick={() => setIsCartOpen(true)}>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                    {cart.reduce((total, item) => total + item.qty, 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-10 px-4 overflow-hidden">
        <div className="container mx-auto text-center max-w-4xl">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-4">
            👋 Selamat Datang, Sahabat Sehat!
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Mulai Hidup Sehat dari <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Setetes Air Berkualitas
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Kami menyediakan berbagai pilihan air mineral terbaik untuk menjaga pH tubuh, meningkatkan energi, dan memastikan keluarga Anda terhidrasi dengan sempurna.
          </p>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 max-w-2xl mx-auto relative overflow-hidden shadow-lg">
            <h3 className="text-2xl font-extrabold text-yellow-800 mb-2">🎉 Program Loyalitas Pelanggan</h3>
            <p className="text-yellow-900 mb-4 font-medium">
              Dapatkan Poin Digital untuk setiap pembelian produk bertanda <strong>"🎟️ Dapat Poin"</strong>
              {bukaRahasia ? <span> (seperti Deo Oxy <span className="font-bold text-orange-600">& Organik RO</span>).</span> : <span> (seperti Deo Oxy).</span>}
            </p>
            <div className="inline-block bg-white px-8 py-3 rounded-full shadow-md border border-yellow-300">
              <span className="font-extrabold text-yellow-700 text-lg">10 Poin = Potongan Rp 15.000! 🎁</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- TUTORIAL CARA PESAN --- */}
      <div className="container mx-auto px-4 mb-16 mt-4">
        <div className="max-w-4xl mx-auto p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
          <h3 className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-6">✨ Cara Mudah Pesan Air ✨</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">👆</div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">1. Pilih Air</h4>
              <p className="text-sm text-slate-600">Gulir ke bawah, pilih air kesukaan Anda lalu klik <b>tombol biru (+)</b> di kotak produk.</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-3xl mb-4">🛒</div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">2. Atur Pesanan</h4>
              <p className="text-sm text-slate-600">Buka ikon keranjang di pojok kanan atas. Atur jumlah galon dan tulis info pengiriman.</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">📱</div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">3. Kirim via WA</h4>
              <p className="text-sm text-slate-600">Klik tombol <b>Pesan via WA</b>. Pesanan otomatis tercatat dan terkirim ke WhatsApp!</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- KENAPA RUMAH ALKALINE --- */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="w-full md:w-1/2">
            <img src="/iklan.jpg" alt="Rumah Alkaline" className="w-full h-auto object-contain rounded-3xl shadow-xl border border-slate-100" />
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Kenapa Harus Rumah Alkaline?</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Teknologi Filtrasi Terbaik</h3>
                  <p className="text-slate-600 text-sm md:text-base">Teknologi filtrasi terbaik yang membuang zat berbahaya namun tetap mempertahankan mineral baik.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Bebas Bakteri & Higienis</h3>
                  <p className="text-slate-600 text-sm md:text-base">Galon dicuci dengan sterilisasi tinggi sebelum pengisian untuk menjamin kebersihan.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">pH Seimbang (Alkaline)</h3>
                  <p className="text-slate-600 text-sm md:text-base">Membantu menetralkan keasaman tubuh akibat pola makan dan gaya hidup.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- PRODUK & SLIDER SECTION --- */}
      <section id="produk" className="py-10 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto px-4 mb-16">
            <h2 className="text-xl font-bold text-center mb-4 text-slate-700">Galeri Kami</h2>
            <div className="relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 group">
              {slideImages.map((img, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === slideIndex ? "opacity-100" : "opacity-0"}`}>
                  <img src={img} alt={`Slide ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              ))}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                {slideImages.map((_, index) => (
                  <div key={index} onClick={() => setSlideIndex(index)} className={`h-2 rounded-full cursor-pointer transition-all duration-300 shadow-sm ${index === slideIndex ? "bg-white w-6" : "bg-white/40 w-2"}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Pilih Kesegaran Anda</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-center">
            {products.filter(product => !product.rahasia || bukaRahasia).map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative">
                {product.hasPoints && (
                  <div className="absolute top-3 left-3 z-20 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                    🎟️ Dapat Poin
                  </div>
                )}
                <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-700 shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-slate-800 mb-1 cursor-pointer hover:text-blue-600" onClick={() => setSelectedProduct(product)}>{product.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.desc}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg">Rp {product.price.toLocaleString('id-ID')}</span>
                    <button onClick={() => addToCart(product)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- POPUP DETAIL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-56 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedProduct.name}</h3>
                  <span className="text-sm text-blue-600 font-medium">{selectedProduct.category}</span>
                </div>
                <span className="text-xl font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">Rp {selectedProduct.price.toLocaleString()}</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <h4 className="font-bold text-blue-800 mb-1 text-sm">💡 Khasiat & Kandungan:</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedProduct.details}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedProduct(null)} className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50">Tutup</button>
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                  + Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- KERANJANG (SIDEBAR) --- */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full relative">
          
          <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">🛒 Keranjang Belanja</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="text-center text-slate-400 mt-20">
                <p className="mb-2">Keranjang masih kosong 😔</p>
                <button onClick={() => setIsCartOpen(false)} className="text-blue-600 font-bold hover:underline">Yuk pilih produk dulu!</button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Daftar Produk yang Dipilih */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center bg-white border p-3 rounded-lg shadow-sm relative overflow-hidden">
                      {item.hasPoints && <div className="absolute top-0 left-0 bg-yellow-400 w-1 h-full"></div>}
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                          {item.name}
                          {item.hasPoints && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">🎟️ Poin</span>}
                        </h4>
                        <p className="text-blue-600 font-bold text-sm">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-bold text-sm">{item.qty}x</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Form NAMA, WA, & ALAMAT */}
                <div className="bg-white p-4 border rounded-xl shadow-sm border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="font-bold text-sm text-gray-800">👤 Data Pengiriman:</label>
                    {/* Badge Info Member/Baru */}
                    {noWaPemesan.length >= 10 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPembeli === "Member" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {statusPembeli === "Member" ? "👑 Member" : "🆕 Baru"}
                      </span>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={namaPemesan}
                    onChange={(e) => setNamaPemesan(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full border p-2 rounded-lg mb-3 text-sm outline-none focus:border-blue-500 bg-slate-50"
                    required
                  />
                  <input
                    type="tel"
                    value={noWaPemesan}
                    onChange={(e) => setNoWaPemesan(e.target.value)}
                    placeholder="Nomor WhatsApp (Cth: 081234...)"
                    className="w-full border p-2 rounded-lg mb-1 text-sm outline-none focus:border-blue-500 bg-slate-50"
                    required
                  />
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] text-blue-600 italic">*WA ini jadi identitas poin Anda.</p>
                    {noWaPemesan.length >= 10 && (
                      <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded shadow-sm border border-green-100">
                        ✨ Saldo: {userPoints} Poin
                      </p>
                    )}
                  </div>
                  
                  <textarea
                    value={alamatPemesan}
                    onChange={(e) => setAlamatPemesan(e.target.value)}
                    placeholder="Alamat Lengkap (Contoh: Blok A No 12)"
                    className="w-full border p-2 rounded-lg text-sm outline-none focus:border-blue-500 bg-slate-50"
                    rows="2"
                    required
                  ></textarea>
                </div>

                {/* 3. Form Poin Member */}
                <div className={`p-4 rounded-xl border ${bisaTukarPoin ? "bg-[#FFFCE8] border-yellow-200" : "bg-gray-100 border-gray-300"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`font-bold text-sm flex items-center gap-2 ${bisaTukarPoin ? "text-gray-800" : "text-gray-400"}`}>
                      🎟️ Tukar Poin Member?
                    </label>
                    <input 
                      type="checkbox" 
                      checked={isPakaiPoin && bisaTukarPoin} 
                      onChange={(e) => setIsPakaiPoin(e.target.checked)} 
                      disabled={!bisaTukarPoin}
                      className={`w-4 h-4 ${bisaTukarPoin ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`} 
                    />
                  </div>
                  
                  {!bisaTukarPoin && (
                    <p className="text-[11px] text-red-500 font-medium leading-tight mt-1 mb-2">
                      *Maaf, tukar poin hanya berlaku untuk pembelian produk Deo (Oxy) atau Organik.
                    </p>
                  )}

                  {isPakaiPoin && bisaTukarPoin && (
                    <div className="flex gap-3 items-center mt-3 bg-white p-2 rounded border border-yellow-100">
                      <input
                        type="number"
                        value={klaimPoinUser || ""}
                        onChange={(e) => {
                          let val = Number(e.target.value);
                          if (val > userPoints) val = userPoints;
                          setKlaimPoinUser(val);
                        }}
                        max={userPoints}
                        placeholder="0"
                        className="border p-2 rounded-lg w-20 text-center outline-none focus:border-blue-500"
                      />
                      <span className="text-xs text-gray-600 leading-tight">Masukan poin (Maks: {userPoints}).<br/>10 Poin = Diskon Rp 15.000!</span>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mt-2 italic">*Poin otomatis dipotong/ditambah dari database.</p>
                </div>

                {/* 4. Form Metode Pembayaran */}
                <div className="bg-white p-4 border rounded-xl shadow-sm">
                  <label className="font-bold text-sm text-gray-800 block mb-2">Pilih Pembayaran:</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border p-2 rounded-lg mb-3 text-sm outline-none focus:border-blue-500">
                    <option value="cash">💵 Tunai (COD)</option>
                    <option value="transfer">💳 Transfer Bank / QRIS</option>
                    
                    {/* INI KUNCINYA: Opsi Tempo cuma muncul kalau statusnya Member */}
                    {statusPembeli === "Member" && (
                      <option value="tempo">📝 Tempo (Khusus Agen)</option>
                    )}
                  </select>

                  {/* Input kembalian kalau pilih Cash */}
                  {paymentMethod === "cash" && (
                    <input type="text" value={cashNote} onChange={(e) => setCashNote(e.target.value)} placeholder="Butuh kembalian dari uang berapa? (Misal: 50rb)" className="w-full border p-2 rounded-lg text-sm outline-none focus:border-blue-500" />
                  )}

                  {/* KOTAK SUB-PILIHAN KHUSUS JADWAL TEMPO */}
                  {paymentMethod === "tempo" && statusPembeli === "Member" && (
                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <label className="font-bold text-xs text-orange-800 block mb-2">🗓️ Pilih Jadwal Bayar:</label>
                      <select value={jadwalTempo} onChange={(e) => setJadwalTempo(e.target.value)} className="w-full border p-2 rounded-lg text-sm outline-none focus:border-orange-500 bg-white">
                        <option value="Akhir Minggu (Sabtu/Minggu)">Mingguan (Akhir Minggu - Sabtu/Minggu)</option>
                        <option value="Sebulan Sekali (Awal/Akhir Bulan)">Bulanan (Sebulan Sekali - Awal/Akhir Bulan)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 5. Form Jam Pengantaran */}
                <div className="bg-white p-4 border rounded-xl shadow-sm">
                  <label className="font-bold text-sm text-gray-800 block mb-2">Mau Diantar Kapan?</label>
                  <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="w-full border p-2 rounded-lg text-sm outline-none focus:border-blue-500">
                    <option value="Satu Jam Setelah Pemesanan">🚀 Satu Jam Setelah Pemesanan</option>
                    <option value="08.00 - 09.00">☀️ 08.00 - 09.00</option>
                    <option value="09.00 - 10.00">☀️ 09.00 - 10.00</option>
                    <option value="10.00 - 11.00">☀️ 10.00 - 11.00</option>
                    <option value="11.00 - 12.00">☀️ 11.00 - 12.00</option>
                    <option value="12.00 - 13.00">☀️ 12.00 - 13.00</option>
                    <option value="13.00 - 14.00">☀️ 13.00 - 14.00</option>
                    <option value="14.00 - 15.00">☀️ 14.00 - 15.00</option>
                    <option value="15.00 - 16.00">🌅 15.00 - 16.00</option>
                    <option value="16.00 - 17.00">🌅 16.00 - 17.00</option>
                    <option value="17.00 - 18.00">🌅 17.00 - 18.00</option>
                    <option value="18.00 - 19.00">🌅 18.00 - 19.00</option>
                    <option value="19.00 - 20.00">🌅 19.00 - 20.00</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* --- BAGIAN CHECKOUT --- */}
          {cart.length > 0 && (
            <div className="p-5 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] relative z-10">
              {/* Tampilkan info diskon */}
              {isPakaiPoin && nilaiDiskon > 0 && bisaTukarPoin && (
                <div className="mb-3 text-xs font-bold text-green-600 bg-green-50 p-2 rounded-lg text-center border border-green-200">
                  ✨ Selamat! Anda hemat Rp {nilaiDiskon.toLocaleString('id-ID')}
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 text-sm font-medium">Total ({cart.length} item)</span>
                <span className="text-xl font-bold text-slate-800">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!isTokoBuka || cart.length === 0 || isSubmitting}
                className={`w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                  isTokoBuka && cart.length > 0 && !isSubmitting
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30"
                    : "bg-gray-400 cursor-not-allowed text-gray-200"
                }`}
              >
                {!isSubmitting && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                {isSubmitting ? "Mencatat Pesanan..." : (isTokoBuka ? "Lanjut Pesan via WA" : "Toko Tutup")}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* --- FOOTER LENGKAP --- */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-20 rounded-t-[3rem] relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Kolom 1: Tentang */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                Rumah Alkaline <span className="text-blue-500">💧</span>
              </h3>
              <p className="leading-relaxed text-slate-400">
                Kami berkomitmen menyediakan air minum berkualitas tinggi dengan standar kebersihan terbaik untuk kesehatan keluarga Indonesia.
              </p>
            </div>

            {/* Kolom 2: Lokasi Outlet */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-red-500">📍</span> Lokasi Outlet
              </h3>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="font-bold text-white mb-2">Perumahan Buana Asri, Karawang Timur</p>
                <p className="text-sm mb-4">Pajajaran II, Blok A14 No 11</p>
                <a href="https://maps.app.goo.gl/DGDNrqNAcW4q25fN7" target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm font-bold hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Lihat di Google Maps →
                </a>
              </div>
            </div>

            {/* Kolom 3: Jam Operasional */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-yellow-500">🕒</span> Jam Operasional
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span>Senin - Jumat</span>
                  <span className="bg-blue-600 text-white text-xs py-1 px-3 rounded-full font-bold">09.00 - 20.00</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span>Sabtu - Minggu</span>
                  <span className="bg-orange-500 text-white text-xs py-1 px-3 rounded-full font-bold">08.00 - 20.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            © 2026 Rumah Alkaline. Solusi Air Sehat Keluarga.
          </div>
        </div>
      </footer>
    </div>
  );
}