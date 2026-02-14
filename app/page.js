"use client";
import React, { useState } from 'react';

// --- DATA PRODUK ---
const products = [
  {
    id: 1,
    name: "Organik (RO)",
    price: 7000,
    category: "Ekonomis",
    rahasia: true, // <--- INI PENTING! (Supaya Tersembunyi)
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
    rahasia: false, // Ini muncul terus
    hasPoints: false,
    image: "/suli.jpg",
    desc: "Air murni TDS 0. Bantu detoks ginjal & kaya oksigen.",
    details: "Air murni (TDS 0) hasil filtrasi berteknologi tinggi bebas polutan."
  },
  {
    id: 3,
    name: "Deo (Oxy)",
    price: 15000,
    category: "Best Seller",
    rahasia: false, // Ini muncul terus
    hasPoints: true,
    image: "/deo.jpg",
    desc: "Air Oksigen TDS 0. Solusi sehat untuk ginjal.",
    details: "Air murni dengan kandungan oksigen tinggi dan TDS 0."
  },
  {
    id: 4,
    name: "S+ (Sehat)",
    price: 15000,
    category: "Keluarga",
    rahasia: true, // <--- INI JUGA PENTING!
    hasPoints: false,
    image: "/sehat.jpg",
    desc: "Air sehat seimbang untuk seluruh keluarga.",
    details: "Keseimbangan pH yang sempurna untuk tubuh. Aman dikonsumsi balita hingga lansia."
  },
  {
    id: 5,
    name: "Telaga 8+ (Alkaline)",
    price: 15000,
    category: "Kesehatan",
    rahasia: false, // Ini muncul terus
    hasPoints: false,
    image: "/telaga.jpg",
    desc: "pH Tinggi untuk detoksifikasi tubuh.",
    details: "Air Alkaline dengan pH 8+ yang membantu menetralkan asam lambung."
  }
];

export default function Home() {
  const [cart, setCart] = useState([]);
  
  // STATE PEMBAYARAN
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashNote, setCashNote] = useState("");
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- TAMBAHAN BARU ---
  const [bukaRahasia, setBukaRahasia] = useState(false); // Default terkunci

  // STATE JAM PENGANTARAN
  const [deliveryTime, setDeliveryTime] = useState("secepatnya"); 
  
  // --- BAGIAN BARU: STATE POIN ---
  const [klaimPoinUser, setKlaimPoinUser] = useState(0); // User isi sendiri
  const [isPakaiPoin, setIsPakaiPoin] = useState(false);  // Tombol ON/OFF

  // Fungsi Tambah ke Keranjang
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

  // Fungsi Kurangi/Hapus Item
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // --- LOGIKA HITUNG HARGA (YANG DISEMPURNAKAN) ---
  
  // 1. Hitung Subtotal
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // 2. Kumpulkan semua harga barang yang BISA ditukar poin
  let eligiblePrices = [];
  cart.forEach(item => {
    if (item.hasPoints) {
      // Masukkan harga per satu galon (kalau beli 2, masukkan harga 2 kali)
      for(let i=0; i < item.qty; i++) {
        eligiblePrices.push(item.price);
      }
    }
  });

  // Urutkan dari yang termahal supaya diskon maksimal
  eligiblePrices.sort((a, b) => b - a);

  // 3. Hitung berapa galon yang GRATIS berdasarkan input user
  // Rumus: Poin User dibagi 10 (dibulatkan ke bawah)
  const maxGalonGratis = Math.floor(klaimPoinUser / 10);
  
  // Ambil yang paling kecil: Jumlah Galon di keranjang ATAU Jumlah jatah gratis
  const jumlahYgBisaDitebus = Math.min(maxGalonGratis, eligiblePrices.length);

  // 4. Hitung Total Diskon
  let nilaiDiskon = 0;
  if (isPakaiPoin && jumlahYgBisaDitebus > 0) {
    for (let i = 0; i < jumlahYgBisaDitebus; i++) {
      nilaiDiskon += eligiblePrices[i];
    }
  }
  
  // 5. Total Akhir
  const totalAmount = subtotal - nilaiDiskon;

  // --- PENGATURAN TOKO ---
  const isLiburMendadak = false; 
  const jamSekarang = new Date().getHours();
  const jamBuka = 8;
  const jamTutup = 21;
  const isTokoBuka = !isLiburMendadak && (jamSekarang >= jamBuka && jamSekarang < jamTutup);

  // --- FUNGSI CHECKOUT / KIRIM WA ---
  const handleCheckout = () => {
    // 1. Susun Daftar Item
    const itemsText = cart
      .map((item) => `- ${item.name} (${item.qty}x) = Rp ${(item.price * item.qty).toLocaleString('id-ID')}`)
      .join('\n');

    // 2. Info Pembayaran
    let paymentInfo = "";
    if (paymentMethod === "cash") {
      paymentInfo = `Tunai/Cash ${cashNote ? `(Uang saya: ${cashNote})` : ""}`;
    } else if (paymentMethod === "transfer") {
      paymentInfo = "Transfer (Minta Rekening/QRIS)";
    } else if (paymentMethod === "tempo") {
      paymentInfo = "Tempo (Member)";
    }

    // 3. Info Diskon Poin (Diupdate)
    let pointsMsg = "";
    if (isPakaiPoin && nilaiDiskon > 0) {
       pointsMsg = `\n\n🎟️ *KLAIM POIN MEMBER*\nUser Input: ${klaimPoinUser} Poin\nPotong Poin: -${jumlahYgBisaDitebus * 10} Poin\n(Gratis ${jumlahYgBisaDitebus} Galon)`;
    } else if (eligiblePrices.length > 0) {
       pointsMsg = "\n\n(Simpan struk ini untuk poin digital saya)";
    }

    // 4. Gabungkan Pesan
    const timeInfo = deliveryTime === "secepatnya" ? "SECEPATNYA (Saat ini juga)" : `JAM ${deliveryTime}`;

    const message = `Halo Admin Rumah Alkaline, saya mau pesan:\n\n${itemsText}\n\n*Subtotal: Rp ${subtotal.toLocaleString()}*\n*Potongan Poin: -Rp ${nilaiDiskon.toLocaleString()}*\n*Total Bayar: Rp ${totalAmount.toLocaleString()}*\n\n----------------\n💳 Pembayaran: ${paymentMethod.toUpperCase()}\n⏰ Waktu Kirim: ${timeInfo}\n📝 Detail: ${paymentInfo}${pointsMsg}\n----------------\n\nMohon info ongkir ke alamat saya.`;

    window.open(`https://wa.me/6282114596083?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* --- LOGO TOMBOL RAHASIA --- */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none hover:opacity-80 transition-all"
            onClick={() => setBukaRahasia(!bukaRahasia)} 
          >
            {/* Icon (Berubah warna jadi ORANGE kalau rahasia terbuka) */}
            <div className={`p-2 rounded-lg shadow-lg transition-all duration-300 ${bukaRahasia ? 'bg-orange-500' : 'bg-gradient-to-br from-blue-500 to-cyan-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Rumah<span className="text-blue-500">Alkaline</span>
                {/* Bintang muncul kalau rahasia terbuka */}
                {bukaRahasia && <span className="text-orange-500 ml-1 text-sm animate-pulse">★</span>}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider">PREMIUM WATER STORE</p>
            </div>
          </div>

          <button 
            onClick={() => setIsCartOpen(!isCartOpen)} 
            className="relative p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>

        <div className="container mx-auto text-center max-w-4xl">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-4 animate-fade-in-up">
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

          {/* === BANNER PROMO === */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 mb-10 max-w-2xl mx-auto relative overflow-hidden shadow-lg animate-bounce-slow">
            <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-4 py-1 rounded-bl-xl shadow-sm">
              PROMO SPESIAL
            </div>
            <h3 className="text-2xl font-extrabold text-yellow-800 mb-2 flex justify-center items-center gap-2">
              🎉 Program Loyalitas Pelanggan
            </h3>
            {/* TEXT DIUPDATE SUPAYA TIDAK MENAMPILKAN PRODUK HIDDEN */}
            <p className="text-yellow-900 mb-4 font-medium">
              Dapatkan Poin Digital untuk setiap pembelian produk bertanda <strong>"🎟️ Dapat Poin"</strong> (seperti Deo Oxy).
            </p>
            <div className="inline-block bg-white px-8 py-3 rounded-full shadow-md border border-yellow-300">
              <span className="font-extrabold text-yellow-700 text-lg">10 Poin = Gratis 1 Galon! 🎁</span>
            </div>
          </div>

          <button 
            onClick={() => document.getElementById('produk').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all"
          >
            Lihat Pilihan Air 💧
          </button>
        </div>
      </header>

      {/* --- EDUKASI --- */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <img 
                src="/iklan.jpg" 
                alt="Air Sehat" 
                className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <p className="text-white font-medium text-lg">"Tubuh manusia 70% adalah air. Jangan isi dengan yang sembarangan."</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Kenapa Harus Rumah Alkaline?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">✨</div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Teknologi Filtrasi Terbaik</h3>
                    <p className="text-slate-600">Menyaring partikel berbahaya namun tetap mempertahankan mineral baik.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 flex-shrink-0">🛡️</div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Bebas Bakteri & Higienis</h3>
                    <p className="text-slate-600">Galon dicuci dengan sterilisasi tinggi sebelum pengisian.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">⚡</div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">pH Seimbang (Alkaline)</h3>
                    <p className="text-slate-600">Membantu menetralkan keasaman tubuh akibat makanan cepat saji.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRODUK --- */}
      <section id="produk" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Pilih Kesegaran Anda</h2>
            <p className="text-slate-500">Klik produk untuk melihat detail khasiatnya.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-center">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative">
                
                {product.hasPoints && (
                  <div className="absolute top-3 left-3 z-20 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                    🎟️ Dapat Poin
                  </div>
                )}

                <div 
                  className="relative h-48 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-700 shadow-sm">
                    {product.category}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 
                    className="font-bold text-lg text-slate-800 mb-1 cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.desc}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
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
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in relative" onClick={(e) => e.stopPropagation()}>
            
            {selectedProduct.hasPoints && (
                  <div className="absolute top-3 left-3 z-20 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    🎟️ Produk Ini Dapat Poin!
                  </div>
            )}

            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-56 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedProduct.name}</h3>
                  <span className="text-sm text-blue-600 font-medium">{selectedProduct.category}</span>
                </div>
                <span className="text-xl font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                  Rp {selectedProduct.price.toLocaleString()}
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <h4 className="font-bold text-blue-800 mb-1 text-sm">💡 Khasiat & Kandungan:</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedProduct.details}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors"
                >
                  + Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- KERANJANG (SIDEBAR) --- */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🛒 Keranjang Belanja
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* LIST ITEM */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center text-slate-400 mt-20">
                <p className="mb-2">Keranjang masih kosong 😔</p>
                <button onClick={() => setIsCartOpen(false)} className="text-blue-600 font-bold hover:underline">Yuk pilih produk dulu!</button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-white border p-3 rounded-lg shadow-sm relative overflow-hidden">
                  {item.hasPoints && (
                    <div className="absolute top-0 left-0 bg-yellow-400 w-1 h-full"></div>
                  )}
                  
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                      {item.name}
                      {item.hasPoints && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">🎟️ Poin</span>}
                    </h4>
                    <p className="text-blue-600 font-bold text-sm">Rp {(item.price * item.qty).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold text-sm">{item.qty}x</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* --- BAGIAN PEMBAYARAN & POIN (YANG DIUBAH) --- */}
          {cart.length > 0 && (
            <div className="p-5 border-t bg-slate-50">
              
              {/* 1. INPUT KLAIM POIN MANUAL (BARU) */}
              {eligiblePrices.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    🎟️ Punya Poin Member?
                  </label>
                  
                  <div className="flex gap-2 mb-2">
                      <input 
                        type="number" 
                        placeholder="0"
                        min="0"
                        value={klaimPoinUser > 0 ? klaimPoinUser : ''}
                        onChange={(e) => setKlaimPoinUser(Number(e.target.value))}
                        className="w-20 p-2 border rounded-md text-center font-bold text-slate-800"
                      />
                      <div className="flex-1 flex items-center text-sm text-slate-600 leading-tight">
                         Masukan sisa poin Anda untuk cek gratisan.
                      </div>
                  </div>

                  {/* Logic Feedback ke User */}
                  {klaimPoinUser > 0 && (
                      <div className="text-xs mb-2">
                          Status: <span className="font-bold text-blue-600">{maxGalonGratis} Galon Gratis</span> 
                          (Butuh {jumlahYgBisaDitebus * 10} poin)
                      </div>
                  )}

                  {/* Saklar Tukar Poin (Hanya muncul kalau Poin Cukup minimal 10) */}
                  {maxGalonGratis >= 1 && (
                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-yellow-300 hover:bg-yellow-100 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={isPakaiPoin}
                            onChange={(e) => setIsPakaiPoin(e.target.checked)}
                            className="w-5 h-5 text-blue-600 cursor-pointer"
                          />
                          <div className="text-sm">
                            <span className="font-bold block text-green-600">
                             Gunakan Diskon Sekarang!
                            </span>
                            <span className="text-xs text-slate-500">
                              Hemat Rp {nilaiDiskon.toLocaleString()} (Tukar {jumlahYgBisaDitebus} Item)
                            </span>
                          </div>
                      </label>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    *Admin akan memverifikasi saldo poin Anda via WhatsApp.
                  </p>
                </div>
              )}

              {/* 2. PILIHAN METODE PEMBAYARAN */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {totalAmount === 0 ? "Konfirmasi Pesanan:" : "Bayar Sisa Tagihan Pakai:"}
                </label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md mb-2 text-sm"
                >
                  <option value="cash">💵 Tunai (COD)</option>
                  <option value="transfer">💳 Transfer Bank / QRIS</option>
                  <option value="tempo">📒 Tempo (Khusus Member)</option>
                </select>
                
                {paymentMethod === 'cash' && (
                  <input 
                    type="text" 
                    placeholder="Uang pecahan berapa? (Misal: 50rb)" 
                    value={cashNote}
                    onChange={(e) => setCashNote(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm bg-slate-50"
                  />
                )}
              </div>

              {/* 3. PILIH JAM PENGANTARAN */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Mau Diantar Jam Berapa?</label>
                <select 
                  value={deliveryTime} 
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="secepatnya">🚀 Kirim 1 jam setelah pemesanan</option>
                  <option disabled>--- Pilih Jam ---</option>
                  {[...Array(13)].map((_, i) => {
                    const jam = 8 + i; 
                    if (jam > 20) return null; 
                    return (
                      <option key={jam} value={`${jam}.00 - ${jam + 1}.00`}>
                        {jam < 10 ? `0${jam}` : jam}.00 - {jam + 1 < 10 ? `0${jam + 1}` : jam + 1}.00
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="flex justify-between items-center mt-4 mb-4">
                <span className="text-slate-600 font-medium">Total Pembayaran</span>
                <span className="text-2xl font-bold text-slate-900">Rp {totalAmount.toLocaleString()}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={!isTokoBuka}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isTokoBuka 
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30"
                    : "bg-gray-400 cursor-not-allowed text-gray-200"
                }`}
              >
                {isTokoBuka ? (
                  <>
                    <span>Pesan via WhatsApp</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  </>
                ) : (
                  <span>{isLiburMendadak ? "Maaf, Toko Sedang Libur 🙏" : "Toko Tutup (Buka 08.00) 😴"}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-white pt-16 pb-8 rounded-t-[3rem] mt-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                Rumah Alkaline 💧
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Kami berkomitmen menyediakan air minum berkualitas tinggi dengan standar kebersihan terbaik untuk kesehatan keluarga Indonesia.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-4">📍 Lokasi Outlet</h3>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="font-medium text-white">Perumahan Buana Asri, Karawang Timur, Karawang, Jawa Barat</p>
                <p className="text-slate-400 text-sm">Pajajaran II, Blok A14 No 11</p>
                <a href="https://maps.app.goo.gl/Ffm77shNoZmqMjPE7" className="text-blue-400 text-sm mt-2 inline-block hover:underline">Lihat di Google Maps →</a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">🕒 Jam Operasional</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Senin - Sabtu</span>
                  <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold">08.00 - 20.00</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <span className="text-slate-300">Minggu</span>
                  <span className="bg-orange-500 px-3 py-1 rounded-full text-xs font-bold">09.00 - 17.00</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">
              © 2026 Rumah Alkaline. Solusi Air Sehat Keluarga.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}