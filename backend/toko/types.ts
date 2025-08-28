export interface Barang {
  id_barang: number;
  nama_barang: string;
  jenis_barang?: string;
  merk?: string;
  harga_beli?: number;
  harga_jual?: number;
  stok?: number;
  satuan?: string;
}

export interface CreateBarangRequest {
  nama_barang: string;
  jenis_barang?: string;
  merk?: string;
  harga_beli?: number;
  harga_jual?: number;
  stok?: number;
  satuan?: string;
}

export interface UpdateBarangRequest {
  id: number;
  nama_barang?: string;
  jenis_barang?: string;
  merk?: string;
  harga_beli?: number;
  harga_jual?: number;
  stok?: number;
  satuan?: string;
}

export interface Distributor {
  id_distributor: number;
  nama_distributor: string;
  alamat?: string;
  telepon?: string;
}

export interface CreateDistributorRequest {
  nama_distributor: string;
  alamat?: string;
  telepon?: string;
}

export interface UpdateDistributorRequest {
  id: number;
  nama_distributor?: string;
  alamat?: string;
  telepon?: string;
}

export interface Pelanggan {
  id_pelanggan: number;
  nama_pelanggan: string;
  alamat?: string;
  telepon?: string;
}

export interface CreatePelangganRequest {
  nama_pelanggan: string;
  alamat?: string;
  telepon?: string;
}

export interface UpdatePelangganRequest {
  id: number;
  nama_pelanggan?: string;
  alamat?: string;
  telepon?: string;
}

export interface Kurir {
  id_kurir: number;
  nama_kurir: string;
  telepon?: string;
}

export interface CreateKurirRequest {
  nama_kurir: string;
  telepon?: string;
}

export interface UpdateKurirRequest {
  id: number;
  nama_kurir?: string;
  telepon?: string;
}

export interface User {
  id_user: number;
  username: string;
  nama_lengkap?: string;
  level: "admin" | "kasir" | "gudang";
}

export interface CreateUserRequest {
  username: string;
  password: string;
  nama_lengkap?: string;
  level: "admin" | "kasir" | "gudang";
}

export interface UpdateUserRequest {
  id: number;
  username?: string;
  password?: string;
  nama_lengkap?: string;
  level?: "admin" | "kasir" | "gudang";
}

export interface Cart {
  id_cart: number;
  id_pelanggan: number;
  id_barang: number;
  jumlah: number;
  created_at: Date;
  barang?: Barang;
}

export interface AddToCartRequest {
  id_pelanggan: number;
  id_barang: number;
  jumlah: number;
}

export interface Pemesanan {
  id_pemesanan: number;
  id_pelanggan?: number;
  id_user?: number;
  tanggal?: Date;
  status?: string;
  total?: number;
  pelanggan?: Pelanggan;
  user?: User;
}

export interface CreatePemesananRequest {
  id_pelanggan?: number;
  id_user?: number;
  tanggal?: Date;
  status?: string;
  total?: number;
}

export interface DetailPemesanan {
  id_detail_pemesanan: number;
  id_pemesanan: number;
  id_barang: number;
  jumlah?: number;
  harga?: number;
  barang?: Barang;
}

export interface CreateDetailPemesananRequest {
  id_pemesanan: number;
  id_barang: number;
  jumlah?: number;
  harga?: number;
}

export interface Pembelian {
  id_pembelian: number;
  id_distributor?: number;
  id_user?: number;
  tanggal?: Date;
  total?: number;
  distributor?: Distributor;
  user?: User;
}

export interface CreatePembelianRequest {
  id_distributor?: number;
  id_user?: number;
  tanggal?: Date;
  total?: number;
}

export interface DetailPembelian {
  id_detail_pembelian: number;
  id_pembelian: number;
  id_barang: number;
  jumlah?: number;
  harga?: number;
  barang?: Barang;
}

export interface CreateDetailPembelianRequest {
  id_pembelian: number;
  id_barang: number;
  jumlah?: number;
  harga?: number;
}

export interface Penjualan {
  id_penjualan: number;
  id_pelanggan?: number;
  id_user?: number;
  id_kurir?: number;
  tanggal?: Date;
  total?: number;
  pelanggan?: Pelanggan;
  user?: User;
  kurir?: Kurir;
}

export interface CreatePenjualanRequest {
  id_pelanggan?: number;
  id_user?: number;
  id_kurir?: number;
  tanggal?: Date;
  total?: number;
}

export interface DetailPenjualan {
  id_detail_penjualan: number;
  id_penjualan: number;
  id_barang: number;
  jumlah?: number;
  harga?: number;
  barang?: Barang;
}

export interface CreateDetailPenjualanRequest {
  id_penjualan: number;
  id_barang: number;
  jumlah?: number;
  harga?: number;
}

export interface CheckoutRequest {
  id_pelanggan: number;
  alamat_pengiriman?: string;
  catatan?: string;
}
