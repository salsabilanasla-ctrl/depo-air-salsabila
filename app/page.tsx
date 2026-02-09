import Link from "next/link";

export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      
      {/* 1. NAVIGASI ATAS */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
        <h2 style={{ color: '#0284c7', fontWeight: 'bold', fontSize: '24px', margin: 0 }}>
          Rumah Alkaline 💧
        </h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ color: '#555', cursor: 'pointer' }}>Beranda</span>
          <span style={{ color: '#555', cursor: 'pointer' }}>Harga</span>
          <span style={{ color: '#555', cursor: 'pointer' }}>Lokasi</span>
        </div>
      </nav>

      {/* 2. BAGIAN TENGAH (HERO) */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#0369a1', marginBottom: '15px', maxWidth: '800px' }}>
          Selamat Datang di Rumah Alkaline
        </h1>
        
        <p style={{ fontSize: '18px', color: '#475569', maxWidth: '600px', lineHeight: '1.6', marginBottom: '40px' }}>
          Pilihan air minum sehat terlengkap untuk keluarga Anda.
          <br/><strong>Segar, Sehat, dan Terjangkau.</strong>
        </p>

        {/* 3. DAFTAR HARGA 5 PRODUK */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'center', marginBottom: '40px', width: '100%', maxWidth: '1200px' }}>
          
          {/* Produk 1: ORGANIK */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '220px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: '#0284c7', fontSize: '20px', marginBottom: '5px', fontWeight: 'bold' }}>Organik</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Air Minum Ekonomis</p>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>Rp 7.000</p>
          </div>

          {/* Produk 2: SULI */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '220px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
               <h3 style={{ color: '#0284c7', fontSize: '20px', marginBottom: '5px', fontWeight: 'bold' }}>Suli</h3>
               <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Air Pegunungan Segar</p>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>Rp 19.000</p>
          </div>

          {/* Produk 3: DEO (Highlight Tengah) */}
          <div style={{ background: '#0284c7', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 20px rgba(2, 132, 199, 0.3)', width: '240px', transform: 'scale(1.05)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid white' }}>
            <div>
               <h3 style={{ fontSize: '22px', marginBottom: '5px', fontWeight: 'bold' }}>Deo</h3>
               <p style={{ fontSize: '13px', color: '#e0f2fe', marginBottom: '15px' }}>Oxy Water Segar</p>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Rp 15.000</p>
          </div>

          {/* Produk 4: S+ */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '220px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
               <h3 style={{ color: '#0284c7', fontSize: '20px', marginBottom: '5px', fontWeight: 'bold' }}>S+</h3>
               <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Air Sehat Keluarga</p>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>Rp 15.000</p>
          </div>

          {/* Produk 5: TELAGA 8+ */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '220px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
               <h3 style={{ color: '#0284c7', fontSize: '20px', marginBottom: '5px', fontWeight: 'bold' }}>Telaga 8+</h3>
               <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>pH Tinggi Alkaline</p>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>Rp 15.000</p>
          </div>

        </div>

        {/* Tombol Pesan */}
        <a 
          // JANGAN LUPA GANTI NOMOR HP DI BAWAH INI
          href="https://wa.me/6281234567890?text=Halo%20Rumah%20Alkaline,%20saya%20mau%20pesan%20galon"
          target="_blank"
          style={{ 
            padding: '15px 40px', 
            background: '#25D366', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '50px', 
            fontSize: '20px', 
            fontWeight: 'bold', 
            boxShadow: '0 4px 10px rgba(37, 211, 102, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '60px'
          }}
        >
          Pesan Galon Sekarang 📱
        </a>

        {/* 4. BAGIAN BARU: LOKASI & JAM BUKA */}
        <div style={{ width: '100%', maxWidth: '800px', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#334155', marginBottom: '30px' }}>📍 Kunjungi Outlet Kami</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', textAlign: 'left' }}>
            
            {/* Kolom Alamat */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h4 style={{ color: '#0284c7', marginBottom: '10px', fontSize: '18px' }}>Alamat</h4>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Jl. Contoh Raya No. 123<br/>
                Kecamatan Air Bersih<br/>
                Kota Sejahtera
              </p>
            </div>

            {/* Kolom Jam Buka */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h4 style={{ color: '#0284c7', marginBottom: '10px', fontSize: '18px' }}>Jam Operasional</h4>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Senin - Sabtu: 08.00 - 20.00 WIB<br/>
                Minggu: 09.00 - 17.00 WIB
              </p>
            </div>
            
          </div>
        </div>

      </main>

      <footer style={{ padding: '30px', textAlign: 'center', background: '#fff', borderTop: '1px solid #eee', color: '#94a3b8', fontSize: '14px' }}>
        &copy; 2024 Rumah Alkaline. Solusi Air Sehat Keluarga.
      </footer>

    </div>
  );
}