import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import type { Penjualan, CreatePenjualanRequest } from "~backend/toko/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, ShoppingCart, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PenjualanPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["penjualan"],
    queryFn: () => backend.toko.listPenjualan(),
  });

  const { data: pelangganData } = useQuery({
    queryKey: ["pelanggan"],
    queryFn: () => backend.toko.listPelanggan(),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => backend.toko.listUsers(),
  });

  const { data: kurirData } = useQuery({
    queryKey: ["kurir"],
    queryFn: () => backend.toko.listKurir(),
  });

  const { data: detailsData } = useQuery({
    queryKey: ["penjualan-details", viewingDetails],
    queryFn: () => backend.toko.getDetailPenjualan({ id: viewingDetails! }),
    enabled: !!viewingDetails,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePenjualanRequest) => backend.toko.createPenjualan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penjualan"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Penjualan created successfully" });
    },
    onError: (error) => {
      console.error("Create penjualan error:", error);
      toast({ title: "Error", description: "Failed to create penjualan", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.toko.deletePenjualan({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penjualan"] });
      toast({ title: "Success", description: "Penjualan deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete penjualan error:", error);
      toast({ title: "Error", description: "Failed to delete penjualan", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id_pelanggan: formData.get("id_pelanggan") ? Number(formData.get("id_pelanggan")) : undefined,
      id_user: formData.get("id_user") ? Number(formData.get("id_user")) : undefined,
      id_kurir: formData.get("id_kurir") ? Number(formData.get("id_kurir")) : undefined,
      tanggal: formData.get("tanggal") ? new Date(formData.get("tanggal") as string) : undefined,
      total: formData.get("total") ? Number(formData.get("total")) : undefined,
    };

    createMutation.mutate(data);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penjualan</h1>
          <p className="text-gray-600 mt-2">Manage sales transactions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Penjualan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Penjualan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="id_pelanggan">Pelanggan</Label>
                <Select name="id_pelanggan">
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {pelangganData?.pelanggan.map((customer) => (
                      <SelectItem key={customer.id_pelanggan} value={customer.id_pelanggan.toString()}>
                        {customer.nama_pelanggan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="id_user">User</Label>
                <Select name="id_user">
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.users.map((user) => (
                      <SelectItem key={user.id_user} value={user.id_user.toString()}>
                        {user.username} - {user.nama_lengkap}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="id_kurir">Kurir</Label>
                <Select name="id_kurir">
                  <SelectTrigger>
                    <SelectValue placeholder="Select courier" />
                  </SelectTrigger>
                  <SelectContent>
                    {kurirData?.kurir.map((courier) => (
                      <SelectItem key={courier.id_kurir} value={courier.id_kurir.toString()}>
                        {courier.nama_kurir}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input id="tanggal" name="tanggal" type="date" />
              </div>
              <div>
                <Label htmlFor="total">Total</Label>
                <Input id="total" name="total" type="number" step="0.01" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Penjualan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Sales Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Kurir</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.penjualan.map((sale) => (
                  <TableRow key={sale.id_penjualan}>
                    <TableCell className="font-medium">{sale.id_penjualan}</TableCell>
                    <TableCell>{(sale as any).nama_pelanggan || "-"}</TableCell>
                    <TableCell>{(sale as any).username || "-"}</TableCell>
                    <TableCell>{(sale as any).nama_kurir || "-"}</TableCell>
                    <TableCell>{formatDate(sale.tanggal)}</TableCell>
                    <TableCell>{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingDetails(sale.id_penjualan)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(sale.id_penjualan)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!viewingDetails} onOpenChange={() => setViewingDetails(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sales Details - ID: {viewingDetails}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {detailsData?.details && detailsData.details.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailsData.details.map((detail) => (
                    <TableRow key={detail.id_detail_penjualan}>
                      <TableCell>{(detail as any).nama_barang || "-"}</TableCell>
                      <TableCell>{detail.jumlah || 0}</TableCell>
                      <TableCell>{formatCurrency(detail.harga)}</TableCell>
                      <TableCell>{formatCurrency((detail.jumlah || 0) * (detail.harga || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No details found for this sale
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
