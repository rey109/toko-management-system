import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Users, UserCheck, ShoppingCart } from "lucide-react";

export default function Dashboard() {
  const { data: barangData } = useQuery({
    queryKey: ["barang"],
    queryFn: () => backend.toko.listBarang(),
  });

  const { data: distributorData } = useQuery({
    queryKey: ["distributors"],
    queryFn: () => backend.toko.listDistributors(),
  });

  const { data: pelangganData } = useQuery({
    queryKey: ["pelanggan"],
    queryFn: () => backend.toko.listPelanggan(),
  });

  const { data: kurirData } = useQuery({
    queryKey: ["kurir"],
    queryFn: () => backend.toko.listKurir(),
  });

  const { data: penjualanData } = useQuery({
    queryKey: ["penjualan"],
    queryFn: () => backend.toko.listPenjualan(),
  });

  const stats = [
    {
      title: "Total Barang",
      value: barangData?.barang.length || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Distributor",
      value: distributorData?.distributors.length || 0,
      icon: Truck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Pelanggan",
      value: pelangganData?.pelanggan.length || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Kurir",
      value: kurirData?.kurir.length || 0,
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Penjualan",
      value: penjualanData?.penjualan.length || 0,
      icon: ShoppingCart,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your store management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No recent activity to display.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• Add new products to inventory</p>
              <p className="text-sm text-gray-600">• Process new sales orders</p>
              <p className="text-sm text-gray-600">• Manage customer information</p>
              <p className="text-sm text-gray-600">• Track delivery status</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
