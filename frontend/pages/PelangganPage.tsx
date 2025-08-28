import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import type { Pelanggan, CreatePelangganRequest } from "~backend/toko/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Users } from "lucide-react";
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

export default function PelangganPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPelanggan, setEditingPelanggan] = useState<Pelanggan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pelanggan"],
    queryFn: () => backend.toko.listPelanggan(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePelangganRequest) => backend.toko.createPelanggan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelanggan"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Pelanggan created successfully" });
    },
    onError: (error) => {
      console.error("Create pelanggan error:", error);
      toast({ title: "Error", description: "Failed to create pelanggan", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & Partial<CreatePelangganRequest>) => 
      backend.toko.updatePelanggan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelanggan"] });
      setEditingPelanggan(null);
      toast({ title: "Success", description: "Pelanggan updated successfully" });
    },
    onError: (error) => {
      console.error("Update pelanggan error:", error);
      toast({ title: "Error", description: "Failed to update pelanggan", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.toko.deletePelanggan({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelanggan"] });
      toast({ title: "Success", description: "Pelanggan deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete pelanggan error:", error);
      toast({ title: "Error", description: "Failed to delete pelanggan", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nama_pelanggan: formData.get("nama_pelanggan") as string,
      alamat: formData.get("alamat") as string || undefined,
      telepon: formData.get("telepon") as string || undefined,
    };

    if (editingPelanggan) {
      updateMutation.mutate({ id: editingPelanggan.id_pelanggan, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pelanggan</h1>
          <p className="text-gray-600 mt-2">Manage your customers</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Pelanggan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Pelanggan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama_pelanggan">Nama Pelanggan</Label>
                <Input id="nama_pelanggan" name="nama_pelanggan" required />
              </div>
              <div>
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea id="alamat" name="alamat" />
              </div>
              <div>
                <Label htmlFor="telepon">Telepon</Label>
                <Input id="telepon" name="telepon" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Pelanggan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Customer List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pelanggan</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.pelanggan.map((customer) => (
                  <TableRow key={customer.id_pelanggan}>
                    <TableCell className="font-medium">{customer.nama_pelanggan}</TableCell>
                    <TableCell>{customer.alamat || "-"}</TableCell>
                    <TableCell>{customer.telepon || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPelanggan(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(customer.id_pelanggan)}
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
      <Dialog open={!!editingPelanggan} onOpenChange={() => setEditingPelanggan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pelanggan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_nama_pelanggan">Nama Pelanggan</Label>
              <Input 
                id="edit_nama_pelanggan" 
                name="nama_pelanggan" 
                defaultValue={editingPelanggan?.nama_pelanggan}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit_alamat">Alamat</Label>
              <Textarea 
                id="edit_alamat" 
                name="alamat" 
                defaultValue={editingPelanggan?.alamat || ""}
              />
            </div>
            <div>
              <Label htmlFor="edit_telepon">Telepon</Label>
              <Input 
                id="edit_telepon" 
                name="telepon" 
                defaultValue={editingPelanggan?.telepon || ""}
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Pelanggan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
