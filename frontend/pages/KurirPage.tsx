import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import type { Kurir, CreateKurirRequest } from "~backend/toko/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, UserCheck } from "lucide-react";
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

export default function KurirPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingKurir, setEditingKurir] = useState<Kurir | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["kurir"],
    queryFn: () => backend.toko.listKurir(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateKurirRequest) => backend.toko.createKurir(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kurir"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Kurir created successfully" });
    },
    onError: (error) => {
      console.error("Create kurir error:", error);
      toast({ title: "Error", description: "Failed to create kurir", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & Partial<CreateKurirRequest>) => 
      backend.toko.updateKurir(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kurir"] });
      setEditingKurir(null);
      toast({ title: "Success", description: "Kurir updated successfully" });
    },
    onError: (error) => {
      console.error("Update kurir error:", error);
      toast({ title: "Error", description: "Failed to update kurir", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.toko.deleteKurir({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kurir"] });
      toast({ title: "Success", description: "Kurir deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete kurir error:", error);
      toast({ title: "Error", description: "Failed to delete kurir", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nama_kurir: formData.get("nama_kurir") as string,
      telepon: formData.get("telepon") as string || undefined,
    };

    if (editingKurir) {
      updateMutation.mutate({ id: editingKurir.id_kurir, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kurir</h1>
          <p className="text-gray-600 mt-2">Manage your delivery couriers</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Kurir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Kurir</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama_kurir">Nama Kurir</Label>
                <Input id="nama_kurir" name="nama_kurir" required />
              </div>
              <div>
                <Label htmlFor="telepon">Telepon</Label>
                <Input id="telepon" name="telepon" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Kurir"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Courier List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kurir</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.kurir.map((courier) => (
                  <TableRow key={courier.id_kurir}>
                    <TableCell className="font-medium">{courier.nama_kurir}</TableCell>
                    <TableCell>{courier.telepon || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingKurir(courier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(courier.id_kurir)}
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
      <Dialog open={!!editingKurir} onOpenChange={() => setEditingKurir(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kurir</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_nama_kurir">Nama Kurir</Label>
              <Input 
                id="edit_nama_kurir" 
                name="nama_kurir" 
                defaultValue={editingKurir?.nama_kurir}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit_telepon">Telepon</Label>
              <Input 
                id="edit_telepon" 
                name="telepon" 
                defaultValue={editingKurir?.telepon || ""}
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Kurir"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
