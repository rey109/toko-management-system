-- ======================
-- Tabel barang
-- ======================
CREATE TABLE barang (
    id_barang BIGSERIAL PRIMARY KEY,
    nama_barang VARCHAR(100) NOT NULL,
    jenis_barang VARCHAR(50),
    merk VARCHAR(50),
    harga_beli DOUBLE PRECISION,
    harga_jual DOUBLE PRECISION,
    stok INTEGER,
    satuan VARCHAR(20)
);

-- ======================
-- Tabel distributor
-- ======================
CREATE TABLE distributor (
    id_distributor BIGSERIAL PRIMARY KEY,
    nama_distributor VARCHAR(100) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(15)
);

-- ======================
-- Tabel pelanggan
-- ======================
CREATE TABLE pelanggan (
    id_pelanggan BIGSERIAL PRIMARY KEY,
    nama_pelanggan VARCHAR(100) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(15)
);

-- ======================
-- Tabel kurir
-- ======================
CREATE TABLE kurir (
    id_kurir BIGSERIAL PRIMARY KEY,
    nama_kurir VARCHAR(100) NOT NULL,
    telepon VARCHAR(15)
);

-- ======================
-- Tabel user
-- ======================
CREATE TABLE users (
    id_user BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100),
    level VARCHAR(20) NOT NULL CHECK (level IN ('admin', 'kasir', 'gudang'))
);

-- ======================
-- Tabel pemesanan
-- ======================
CREATE TABLE pemesanan (
    id_pemesanan BIGSERIAL PRIMARY KEY,
    id_pelanggan BIGINT,
    id_user BIGINT,
    tanggal DATE,
    status VARCHAR(50),
    FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan),
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);

-- ======================
-- Tabel detail_pemesanan
-- ======================
CREATE TABLE detail_pemesanan (
    id_detail_pemesanan BIGSERIAL PRIMARY KEY,
    id_pemesanan BIGINT,
    id_barang BIGINT,
    jumlah INTEGER,
    harga DOUBLE PRECISION,
    FOREIGN KEY (id_pemesanan) REFERENCES pemesanan(id_pemesanan),
    FOREIGN KEY (id_barang) REFERENCES barang(id_barang)
);

-- ======================
-- Tabel pembelian
-- ======================
CREATE TABLE pembelian (
    id_pembelian BIGSERIAL PRIMARY KEY,
    id_distributor BIGINT,
    id_user BIGINT,
    tanggal DATE,
    total DOUBLE PRECISION,
    FOREIGN KEY (id_distributor) REFERENCES distributor(id_distributor),
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);

-- ======================
-- Tabel detail_pembelian
-- ======================
CREATE TABLE detail_pembelian (
    id_detail_pembelian BIGSERIAL PRIMARY KEY,
    id_pembelian BIGINT,
    id_barang BIGINT,
    jumlah INTEGER,
    harga DOUBLE PRECISION,
    FOREIGN KEY (id_pembelian) REFERENCES pembelian(id_pembelian),
    FOREIGN KEY (id_barang) REFERENCES barang(id_barang)
);

-- ======================
-- Tabel penjualan
-- ======================
CREATE TABLE penjualan (
    id_penjualan BIGSERIAL PRIMARY KEY,
    id_pelanggan BIGINT,
    id_user BIGINT,
    id_kurir BIGINT,
    tanggal DATE,
    total DOUBLE PRECISION,
    FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan),
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_kurir) REFERENCES kurir(id_kurir)
);

-- ======================
-- Tabel detail_penjualan
-- ======================
CREATE TABLE detail_penjualan (
    id_detail_penjualan BIGSERIAL PRIMARY KEY,
    id_penjualan BIGINT,
    id_barang BIGINT,
    jumlah INTEGER,
    harga DOUBLE PRECISION,
    FOREIGN KEY (id_penjualan) REFERENCES penjualan(id_penjualan),
    FOREIGN KEY (id_barang) REFERENCES barang(id_barang)
);
