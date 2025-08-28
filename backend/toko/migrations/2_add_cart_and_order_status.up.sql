-- Add shopping cart table for customers
CREATE TABLE cart (
    id_cart BIGSERIAL PRIMARY KEY,
    id_pelanggan BIGINT NOT NULL,
    id_barang BIGINT NOT NULL,
    jumlah INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
    FOREIGN KEY (id_barang) REFERENCES barang(id_barang) ON DELETE CASCADE,
    UNIQUE(id_pelanggan, id_barang)
);

-- Update pemesanan table to have better status tracking
ALTER TABLE pemesanan ADD COLUMN IF NOT EXISTS total DOUBLE PRECISION;
ALTER TABLE pemesanan ALTER COLUMN status SET DEFAULT 'pending';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_pelanggan ON cart(id_pelanggan);
CREATE INDEX IF NOT EXISTS idx_pemesanan_status ON pemesanan(status);
CREATE INDEX IF NOT EXISTS idx_barang_stok ON barang(stok);
