import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import BarangPage from "./pages/BarangPage";
import DistributorPage from "./pages/DistributorPage";
import PelangganPage from "./pages/PelangganPage";
import KurirPage from "./pages/KurirPage";
import UsersPage from "./pages/UsersPage";
import PenjualanPage from "./pages/PenjualanPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/barang" element={<BarangPage />} />
            <Route path="/distributors" element={<DistributorPage />} />
            <Route path="/pelanggan" element={<PelangganPage />} />
            <Route path="/kurir" element={<KurirPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/penjualan" element={<PenjualanPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}
