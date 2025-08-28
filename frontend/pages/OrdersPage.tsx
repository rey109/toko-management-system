import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import type { Pemesanan, DetailPemesanan } from "~backend/toko/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package } from "lucide-react";
import StoreLayout from "../components/StoreLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrdersPage() {
  const [customerId] = useState(1); // In real app, this would come from auth
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => backend.toko.getCustomerOrders({ id_pelanggan: customerId }),
  });

  const { data: orderDetailsData } = useQuery({
    queryKey: ["order-details", selectedOrderId],
    queryFn: () => backend.toko.getOrderDetails({ id_pemesanan: selectedOrderId! }),
    enabled: !!selectedOrderId,
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const color = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";

    return (
      <Badge className={color}>
        {status || "pending"}
      </Badge>
    );
  };

  const orders = ordersData?.orders || [];

  return (
    <StoreLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track your order history and status</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
              <Button onClick={() => window.location.href = "/"}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id_pemesanan}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id_pemesanan}
                      </CardTitle>
                      <p className="text-gray-600">
                        Placed on {formatDate(order.tanggal)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-semibold mt-1">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Status: <span className="capitalize">{order.status || "pending"}</span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrderId(order.id_pemesanan)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrderId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {orderDetailsData?.details && orderDetailsData.details.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetailsData.details.map((detail) => {
                      const product = detail.barang as any;
                      const subtotal = (detail.jumlah || 0) * (detail.harga || 0);

                      return (
                        <TableRow key={detail.id_detail_pemesanan}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product?.nama_barang || "-"}</p>
                              {product?.satuan && (
                                <p className="text-sm text-gray-600">Unit: {product.satuan}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{detail.jumlah || 0}</TableCell>
                          <TableCell>{formatCurrency(detail.harga)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(subtotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No details found for this order
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StoreLayout>
  );
}
