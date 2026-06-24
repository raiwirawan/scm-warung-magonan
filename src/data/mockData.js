// ============================================================
// DATA MOCK REALISTIS — SCM WARUNG MAGONAN
// Semua data ini bisa diganti dengan API call di masa depan
// ============================================================

export const SUPPLIERS = [
  { id: 'S001', nama: 'Pak Budi Sayur', kontak: '081234567890', komoditas: ['Sayuran', 'Bumbu'], alamat: 'Pasar Badung Lt. 2', rating: 4.8, totalOrder: 24 },
  { id: 'S002', nama: 'Bu Sari Daging', kontak: '082345678901', komoditas: ['Daging', 'Unggas'], alamat: 'Pasar Kreneng Blok C', rating: 4.5, totalOrder: 18 },
  { id: 'S003', nama: 'UD Jaya Ikan', kontak: '083456789012', komoditas: ['Ikan', 'Seafood'], alamat: 'TPI Kedonganan', rating: 4.7, totalOrder: 31 },
  { id: 'S004', nama: 'CV Beras Nusantara', kontak: '084567890123', komoditas: ['Beras', 'Sembako'], alamat: 'Distributor Denpasar', rating: 4.9, totalOrder: 12 },
];

export const BAHAN_BAKU = [
  { id: 'B001', nama: 'Ayam Kampung', kategori: 'Unggas', satuan: 'Ekor', minStok: 10 },
  { id: 'B002', nama: 'Beras Ciherang', kategori: 'Sembako', satuan: 'Kg', minStok: 20 },
  { id: 'B003', nama: 'Cabai Rawit Merah', kategori: 'Bumbu', satuan: 'Kg', minStok: 2 },
  { id: 'B004', nama: 'Ikan Gurame', kategori: 'Ikan', satuan: 'Kg', minStok: 5 },
  { id: 'B005', nama: 'Udang Vaname', kategori: 'Seafood', satuan: 'Kg', minStok: 3 },
  { id: 'B006', nama: 'Santan Segar', kategori: 'Bumbu', satuan: 'Liter', minStok: 5 },
  { id: 'B007', nama: 'Sayur Bayam', kategori: 'Sayuran', satuan: 'Kg', minStok: 3 },
  { id: 'B008', nama: 'Tempe', kategori: 'Protein Nabati', satuan: 'Papan', minStok: 10 },
  { id: 'B009', nama: 'Daging Sapi', kategori: 'Daging', satuan: 'Kg', minStok: 3 },
  { id: 'B010', nama: 'Kelapa Parut', kategori: 'Bumbu', satuan: 'Btr', minStok: 10 },
];

export const PURCHASE_ORDERS_INITIAL = [
  {
    id: 'PO-2024-001',
    pemasokId: 'S001',
    pemasokNama: 'Pak Budi Sayur',
    tanggal: '2024-06-10',
    tanggalKirim: '2024-06-11',
    status: 'diterima',
    items: [
      { bahanId: 'B003', nama: 'Cabai Rawit Merah', qty: 5, hargaPerUnit: 42000, satuan: 'Kg' },
      { bahanId: 'B007', nama: 'Sayur Bayam', qty: 10, hargaPerUnit: 8000, satuan: 'Kg' },
    ],
    catatan: '',
  },
  {
    id: 'PO-2024-002',
    pemasokId: 'S002',
    pemasokNama: 'Bu Sari Daging',
    tanggal: '2024-06-12',
    tanggalKirim: '2024-06-13',
    status: 'diterima',
    items: [
      { bahanId: 'B001', nama: 'Ayam Kampung', qty: 20, hargaPerUnit: 75000, satuan: 'Ekor' },
    ],
    catatan: 'Minta dipotong bersih',
  },
  {
    id: 'PO-2024-003',
    pemasokId: 'S003',
    pemasokNama: 'UD Jaya Ikan',
    tanggal: '2024-06-15',
    tanggalKirim: '2024-06-16',
    status: 'dikirim',
    items: [
      { bahanId: 'B004', nama: 'Ikan Gurame', qty: 15, hargaPerUnit: 55000, satuan: 'Kg' },
      { bahanId: 'B005', nama: 'Udang Vaname', qty: 8, hargaPerUnit: 85000, satuan: 'Kg' },
    ],
    catatan: 'Konfirmasi kesegaran saat tiba',
  },
  {
    id: 'PO-2024-004',
    pemasokId: 'S001',
    pemasokNama: 'Pak Budi Sayur',
    tanggal: '2024-06-17',
    tanggalKirim: null,
    status: 'draft',
    items: [
      { bahanId: 'B003', nama: 'Cabai Rawit Merah', qty: 5, hargaPerUnit: 48000, satuan: 'Kg' },
      { bahanId: 'B010', nama: 'Kelapa Parut', qty: 20, hargaPerUnit: 5000, satuan: 'Btr' },
    ],
    catatan: '',
  },
];

// Stok gudang menggunakan FIFO batch — setiap batch menyimpan harga beli masing-masing
export const STOK_INITIAL = {
  'B001': { batches: [
    { batchId: 'BCH-002-001', poId: 'PO-2024-002', tanggalMasuk: '2024-06-13', hargaBeli: 75000, qtyAwal: 20, qtySisa: 14 }
  ]},
  'B002': { batches: [
    { batchId: 'BCH-000-002', poId: 'STOK-AWAL', tanggalMasuk: '2024-06-01', hargaBeli: 13000, qtyAwal: 50, qtySisa: 30 }
  ]},
  'B003': { batches: [
    { batchId: 'BCH-001-003', poId: 'PO-2024-001', tanggalMasuk: '2024-06-11', hargaBeli: 42000, qtyAwal: 5, qtySisa: 3.5 }
  ]},
  'B004': { batches: [
    { batchId: 'BCH-000-004', poId: 'STOK-AWAL', tanggalMasuk: '2024-06-05', hargaBeli: 52000, qtyAwal: 8, qtySisa: 8 }
  ]},
  'B005': { batches: [
    { batchId: 'BCH-000-005', poId: 'STOK-AWAL', tanggalMasuk: '2024-06-05', hargaBeli: 80000, qtyAwal: 5, qtySisa: 2 }
  ]},
  'B006': { batches: [
    { batchId: 'BCH-000-006', poId: 'STOK-AWAL', tanggalMasuk: '2024-06-14', hargaBeli: 15000, qtyAwal: 10, qtySisa: 6 }
  ]},
  'B007': { batches: [
    { batchId: 'BCH-001-007', poId: 'PO-2024-001', tanggalMasuk: '2024-06-11', hargaBeli: 8000, qtyAwal: 10, qtySisa: 1.5 }
  ]},
  'B008': { batches: [
    { batchId: 'BCH-000-008', poId: 'STOK-AWAL', tanggalMasuk: '2024-06-14', hargaBeli: 5000, qtyAwal: 20, qtySisa: 15 }
  ]},
  'B009': { batches: [
    { batchId: 'BCH-000-009', poId: 'STOK-AWAL', tanggalMasuk: '2024-06-12', hargaBeli: 120000, qtyAwal: 5, qtySisa: 4 }
  ]},
  'B010': { batches: [
    { batchId: 'BCH-000-010', poId: 'STOK-AWAL', tanggalMasuk: '2024-06-10', hargaBeli: 4500, qtyAwal: 20, qtySisa: 8 }
  ]},
};

// Menu dengan resep bahan baku
export const MENU = [
  {
    id: 'M001', nama: 'Udang Saus Mentega', kategori: 'Seafood', hargaJual: 65000, emoji: '🦐',
    resep: [
      { bahanId: 'B005', nama: 'Udang Vaname', qty: 0.25, satuan: 'Kg' },
      { bahanId: 'B002', nama: 'Beras Ciherang', qty: 0.2, satuan: 'Kg' },
    ]
  },
  {
    id: 'M002', nama: 'Ayam Goreng Magonan', kategori: 'Unggas', hargaJual: 45000, emoji: '🍗',
    resep: [
      { bahanId: 'B001', nama: 'Ayam Kampung', qty: 0.5, satuan: 'Ekor' },
      { bahanId: 'B002', nama: 'Beras Ciherang', qty: 0.2, satuan: 'Kg' },
      { bahanId: 'B003', nama: 'Cabai Rawit Merah', qty: 0.05, satuan: 'Kg' },
    ]
  },
  {
    id: 'M003', nama: 'Ikan Gurame Bakar', kategori: 'Ikan', hargaJual: 75000, emoji: '🐟',
    resep: [
      { bahanId: 'B004', nama: 'Ikan Gurame', qty: 0.5, satuan: 'Kg' },
      { bahanId: 'B002', nama: 'Beras Ciherang', qty: 0.2, satuan: 'Kg' },
      { bahanId: 'B003', nama: 'Cabai Rawit Merah', qty: 0.03, satuan: 'Kg' },
    ]
  },
  {
    id: 'M004', nama: 'Nasi Goreng Kampung', kategori: 'Nasi', hargaJual: 30000, emoji: '🍳',
    resep: [
      { bahanId: 'B002', nama: 'Beras Ciherang', qty: 0.25, satuan: 'Kg' },
      { bahanId: 'B003', nama: 'Cabai Rawit Merah', qty: 0.02, satuan: 'Kg' },
    ]
  },
  {
    id: 'M005', nama: 'Sayur Bayam Santan', kategori: 'Sayuran', hargaJual: 20000, emoji: '🥬',
    resep: [
      { bahanId: 'B007', nama: 'Sayur Bayam', qty: 0.2, satuan: 'Kg' },
      { bahanId: 'B006', nama: 'Santan Segar', qty: 0.2, satuan: 'Liter' },
    ]
  },
  {
    id: 'M006', nama: 'Tempe Goreng Crispy', kategori: 'Nabati', hargaJual: 15000, emoji: '🟫',
    resep: [
      { bahanId: 'B008', nama: 'Tempe', qty: 1, satuan: 'Papan' },
      { bahanId: 'B003', nama: 'Cabai Rawit Merah', qty: 0.01, satuan: 'Kg' },
    ]
  },
  {
    id: 'M007', nama: 'Sate Languan', kategori: 'Daging', hargaJual: 55000, emoji: '🍢',
    resep: [
      { bahanId: 'B009', nama: 'Daging Sapi', qty: 0.2, satuan: 'Kg' },
      { bahanId: 'B010', nama: 'Kelapa Parut', qty: 1, satuan: 'Btr' },
      { bahanId: 'B002', nama: 'Beras Ciherang', qty: 0.2, satuan: 'Kg' },
    ]
  },
  {
    id: 'M008', nama: 'Mujair Nyat-Nyat', kategori: 'Ikan', hargaJual: 60000, emoji: '🐡',
    resep: [
      { bahanId: 'B004', nama: 'Ikan Gurame', qty: 0.4, satuan: 'Kg' },
      { bahanId: 'B006', nama: 'Santan Segar', qty: 0.15, satuan: 'Liter' },
      { bahanId: 'B003', nama: 'Cabai Rawit Merah', qty: 0.04, satuan: 'Kg' },
    ]
  },
];

export const PESANAN_INITIAL = [
  {
    id: 'ORD-081',
    tanggal: '2024-06-17',
    waktu: '10:30',
    tipe: 'Dine-in',
    meja: 'Meja 3',
    items: [
      { menuId: 'M003', nama: 'Ikan Gurame Bakar', qty: 1, hargaJual: 75000, hpp: 33500 },
      { menuId: 'M005', nama: 'Sayur Bayam Santan', qty: 2, hargaJual: 20000, hpp: 4600 },
    ],
    status: 'selesai',
    totalHarga: 115000,
    totalHPP: 42700,
  },
  {
    id: 'ORD-082',
    tanggal: '2024-06-17',
    waktu: '11:15',
    tipe: 'Takeaway',
    meja: '-',
    items: [
      { menuId: 'M002', nama: 'Ayam Goreng Magonan', qty: 2, hargaJual: 45000, hpp: 42625 },
      { menuId: 'M004', nama: 'Nasi Goreng Kampung', qty: 1, hargaJual: 30000, hpp: 3775 },
    ],
    status: 'selesai',
    totalHarga: 120000,
    totalHPP: 89025,
  },
  {
    id: 'ORD-083',
    tanggal: '2024-06-17',
    waktu: '12:00',
    tipe: 'Dine-in',
    meja: 'Meja 7',
    items: [
      { menuId: 'M007', nama: 'Sate Languan', qty: 3, hargaJual: 55000, hpp: 34700 },
    ],
    status: 'diproses',
    totalHarga: 165000,
    totalHPP: 104100,
  },
];

export const WASTE_INITIAL = [
  { id: 'W001', tanggal: '2024-06-17', bahanId: 'B007', nama: 'Sayur Bayam', qty: 3.5, satuan: 'Kg', alasan: 'Layu / Tidak Segar', hargaBeli: 8000, nilaiKerugian: 28000 },
  { id: 'W002', tanggal: '2024-06-17', bahanId: 'B006', nama: 'Santan Cair', qty: 2.0, satuan: 'Liter', alasan: 'Melewati Masa Pakai', hargaBeli: 15000, nilaiKerugian: 30000 },
  { id: 'W003', tanggal: '2024-06-16', bahanId: 'B004', nama: 'Ikan Gurame', qty: 2, satuan: 'Kg', alasan: 'Kontaminasi Bau', hargaBeli: 52000, nilaiKerugian: 104000 },
];

// Riwayat harga untuk grafik fluktuasi harga
export const PRICE_HISTORY = {
  'B003': [
    { tanggal: '2024-04-15', harga: 38000, poId: 'PO-2024-hist-1' },
    { tanggal: '2024-05-01', harga: 40000, poId: 'PO-2024-hist-2' },
    { tanggal: '2024-05-20', harga: 39000, poId: 'PO-2024-hist-3' },
    { tanggal: '2024-06-10', harga: 42000, poId: 'PO-2024-001' },
    { tanggal: '2024-06-17', harga: 48000, poId: 'PO-2024-004' },
  ],
  'B001': [
    { tanggal: '2024-04-15', harga: 68000, poId: 'hist-1' },
    { tanggal: '2024-05-01', harga: 70000, poId: 'hist-2' },
    { tanggal: '2024-05-20', harga: 72000, poId: 'hist-3' },
    { tanggal: '2024-06-12', harga: 75000, poId: 'PO-2024-002' },
  ],
};
