"use client";

import React from 'react';

export default function Home() {
  // Data Produk (Aku tandain mana yang dapet kupon/poin)
  const products = [
    {
      id: 1,
      name: "Organik (RO)",
      description: "Air minum ekonomis untuk kebutuhan harian.",
      price: 7000,
      tag: "Ekonomis",
      hasPoints: true, // INI DAPAT POIN
      image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      name: "Suli (Pegunungan)",
      description: "Kesegaran alami langsung dari sumber pegunungan.",
      price: 19000,
      tag: "Premium",
      hasPoints: false,
      image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      name: "Deo (Oxy)",
      description: "Air beroksigen tinggi untuk energi ekstra.",
      price: 15000,
      tag: "Best Seller",
      hasPoints: true, // INI DAPAT POIN
      image: "https://images.unsplash.com/photo-1523362628408-3c2601a0d057?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 4,
      name: "S+ (Sehat)",
      description: "Air sehat seimbang untuk seluruh keluarga.",
      price: 15000,
      tag: "Keluarga",
      hasPoints: false,
      image: "https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 5,
      name: "Telaga 8+ (Alkaline)",
      description: "pH Tinggi untuk detoksifikasi tubuh.",
      price: 15000,
      tag: "Kesehatan",
      hasPoints: false,
      image: "https://images.unsplash.com/photo-1589365278144-96e3a94149a7?auto=format&fit=crop&q=80&w=800"
    }
  ];

  // Fungsi untuk kirim pesan WhatsApp
  const handleOrder = (product) => {
    const phoneNumber = "6282258521615"; // Nomor HP dari kupon
    
    let message = `Halo Rumah Alkaline, saya mau pesan *${product.name}* seharga Rp ${product.price.toLocaleString('id-ID')}.`;

    // Kalau produk ini ada poinnya, tambah pesan khusus
    if (product.hasPoints) {
      message += `\n\n(🎟️ Tolong catat poin kupon digital saya ya kak)`;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Navbar Sederhana */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-blue-600">Rumah Alkaline 💧</h1>
          </div>
          <div className="flex gap-4 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-blue-600">Beranda</a>
            <a href="#produk" className="hover:text-blue-600">Harga</a>
            <a href="#lokasi" className="hover:text-blue-600">Lokasi</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-white py-16 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">
            Selamat Datang di Rumah Alkaline
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Pilihan air minum sehat terlengkap untuk keluarga Anda.<br/>
            <strong>Segar, Sehat, dan Terjangkau.</strong>
          </p>

          {/* === INI BAGIAN BARU: INFO KUPON DIGITAL === */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-10 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              PROMO
            </div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">🎉 Program Loyalitas Pelanggan</h3>
            <p className="text-yellow-900 mb-4">
              Setiap pembelian <strong>Organik (RO)</strong> & <strong>Deo (Oxy)</strong> akan mendapatkan Poin Digital!
            </p>
            <div className="inline-block bg-white px-6 py-2 rounded-full shadow-sm border border-yellow-200">
              <span className="font-bold text-yellow-700">10 Poin = Gratis 1 Galon! 🎁</span>
            </div>
          </div>
          {/* =========================================== */}

        </div>
      </header>

      {/* Product List */}
      <section id="produk" className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-center mb-2 text-gray-800">Pilih Kesegaran Anda</h3>
        <p className="text-center text-gray-500 mb-10">Klik tombol (+) untuk pesan & dapatkan poinnya.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border border-gray-100 relative">
              
              {/* Badge Poin (Muncul kalau hasPoints = true) */}
              {product.hasPoints && (
                <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                  🎟️ Dapat Poin
                </div>
              )}

              {/* Tag di pojok kanan */}
              <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur text-gray-700 text-xs font-bold px-2 py-1 rounded shadow-sm">
                {product.tag}
              </div>

              <div className="h-48 overflow-hidden relative bg-gray-100">
                 <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h4 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-500 mb-4 flex-grow">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-blue-600">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <button 
                    onClick={() => handleOrder(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-blue-200 shadow-lg"
                  >
                    <span className="text-2xl font-light mb-1">+</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / Lokasi */}
      <footer id="lokasi" className="bg-gray-900 text-white py-12 mt-12 rounded-t-[3rem]">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4 text-blue-400">Rumah Alkaline 💧</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kami berkomitmen menyediakan air minum berkualitas tinggi dengan standar kebersihan terbaik untuk kesehatan keluarga Indonesia.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 text-green-400">📍 Lokasi Outlet</h4>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <p className="font-bold text-white mb-1">JL Contoh Raya No. 123</p>
              <p className="text-gray-400 text-sm mb-3">Kecamatan Air Bersih, Kota Sejahtera</p>
              <a href="#" className="text-blue-400 text-sm hover:underline flex items-center gap-1">
                Lihat di Google Maps &rarr;
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-yellow-400">🕒 Jam Operasional</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex justify-between">
                <span>Senin - Sabtu</span>
                <span className="font-bold bg-blue-600 px-2 rounded">08.00 - 20.00</span>
              </li>
              <li className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span>Minggu</span>
                <span className="font-bold bg-orange-500 px-2 rounded">09.00 - 17.00</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-600 text-xs mt-12 pt-8 border-t border-gray-800">
          &copy; 2026 Rumah Alkaline. Solusi Air Sehat Keluarga.
        </div>
      </footer>
    </div>
  );
}