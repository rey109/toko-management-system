import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import type { Barang, CreateBarangRequest } from "~backend/toko/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BarangPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["barang"],
    queryFn: () => backend.toko.listBarang(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBarangRequest) => backend.toko.createBarang(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barang"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Barang created successfully" });
    },
    onError: (error) => {
      console.error("Create barang error:", error);
      toast({ title: "Error", description: "Failed to create barang", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & Partial<CreateBarangRequest>) => 
      backend.toko.updateBarang(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barang"] });
      setEditingBarang(null);
      toast({ title: "Success", description: "Barang updated successfully" });
    },
    onError: (error) => {
      console.error("Update barang error:", error);
      toast({ title: "Error", description: "Failed to update barang", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.toko.deleteBarang({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barang"] });
      toast({ title: "Success", description: "Barang deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete barang error:", error);
      toast({ title: "Error", description: "Failed to delete barang", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nama_barang: formData.get("nama_barang") as string,
      jenis_barang: formData.get("jenis_barang") as string || undefined,
      merk: formData.get("merk") as string || undefined,
      harga_beli: formData.get("harga_beli") ? Number(formData.get("harga_beli")) : undefined,
      harga_jual: formData.get("harga_jual") ? Number(formData.get("harga_jual")) : undefined,
      stok: formData.get("stok") ? Number(formData.get("stok")) : undefined,
      satuan: formData.get("satuan") as string || undefined,
    };

    if (editingBarang) {
      updateMutation.mutate({ id: editingBarang.id_barang, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Barang</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Barang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Barang</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama_barang">Nama Barang</Label>
                <Input id="nama_barang" name="nama_barang" required />
              </div>
              <div>
                <Label htmlFor="jenis_barang">Jenis Barang</Label>
                <Input id="jenis_barang" name="jenis_barang" />
              </div>
              <div>
                <Label htmlFor="merk">Merk</Label>
                <Input id="merk" name="merk" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="harga_beli">Harga Beli</Label>
                  <Input id="harga_beli" name="harga_beli" type="number" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="harga_jual">Harga Jual</Label>
                  <Input id="harga_jual" name="harga_jual" type="number" step="0.01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stok">Stok</Label>
                  <Input id="stok" name="stok" type="number" />
                </div>
                <div>
                  <Label htmlFor="satuan">Satuan</Label>
                  <Input id="satuan" name="satuan" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Barang"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Product List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Merk</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.barang.map((item) => (
                  <TableRow key={item.id_barang}>
                    <TableCell className="font-medium">{item.nama_barang}</TableCell>
                    <TableCell>{item.jenis_barang || "-"}</TableCell>
                    <TableCell>{item.merk || "-"}</TableCell>
                    <TableCell>{formatCurrency(item.harga_beli)}</TableCell>
                    <TableCell>{formatCurrency(item.harga_jual)}</TableCell>
                    <TableCell>{item.stok || "-"}</TableCell>
                    <TableCell>{item.satuan || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingBarang(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id_barang)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingBarang} onOpenChange={() => setEditingBarang(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Barang</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_nama_barang">Nama Barang</Label>
              <Input 
                id="edit_nama_barang" 
                name="nama_barang" 
                defaultValue={editingBarang?.nama_barang}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit_jenis_barang">Jenis Barang</Label>
              <Input 
                id="edit_jenis_barang" 
                name="jenis_barang" 
                defaultValue={editingBarang?.jenis_barang || ""}
              />
            </div>
            <div>
              <Label htmlFor="edit_merk">Merk</Label>
              <Input 
                id="edit_merk" 
                name="merk" 
                defaultValue={editingBarang?.merk || ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_harga_beli">Harga Beli</Label>
                <Input 
                  id="edit_harga_beli" 
                  name="harga_beli" 
                  type="number" 
                  step="0.01"
                  defaultValue={editingBarang?.harga_beli || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit_harga_jual">Harga Jual</Label>
                <Input 
                  id="edit_harga_jual" 
                  name="harga_jual" 
                  type="number" 
                  step="0.01"
                  defaultValue={editingBarang?.harga_jual || ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_stok">Stok</Label>
                <Input 
                  id="edit_stok" 
                  name="stok" 
                  type="number"
                  defaultValue={editingBarang?.stok || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit_satuan">Satuan</Label>
                <Input 
                  id="edit_satuan" 
                  name="satuan"
                  defaultValue={editingBarang?.satuan || ""}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Barang"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
