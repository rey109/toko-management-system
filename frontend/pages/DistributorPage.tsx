import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import type { Distributor, CreateDistributorRequest } from "~backend/toko/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Truck } from "lucide-react";
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

export default function DistributorPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["distributors"],
    queryFn: () => backend.toko.listDistributors(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDistributorRequest) => backend.toko.createDistributor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributors"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Distributor created successfully" });
    },
    onError: (error) => {
      console.error("Create distributor error:", error);
      toast({ title: "Error", description: "Failed to create distributor", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & Partial<CreateDistributorRequest>) => 
      backend.toko.updateDistributor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributors"] });
      setEditingDistributor(null);
      toast({ title: "Success", description: "Distributor updated successfully" });
    },
    onError: (error) => {
      console.error("Update distributor error:", error);
      toast({ title: "Error", description: "Failed to update distributor", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.toko.deleteDistributor({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributors"] });
      toast({ title: "Success", description: "Distributor deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete distributor error:", error);
      toast({ title: "Error", description: "Failed to delete distributor", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nama_distributor: formData.get("nama_distributor") as string,
      alamat: formData.get("alamat") as string || undefined,
      telepon: formData.get("telepon") as string || undefined,
    };

    if (editingDistributor) {
      updateMutation.mutate({ id: editingDistributor.id_distributor, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distributor</h1>
          <p className="text-gray-600 mt-2">Manage your suppliers and distributors</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Distributor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Distributor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama_distributor">Nama Distributor</Label>
                <Input id="nama_distributor" name="nama_distributor" required />
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
                {createMutation.isPending ? "Creating..." : "Create Distributor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Distributor List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Distributor</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.distributors.map((distributor) => (
                  <TableRow key={distributor.id_distributor}>
                    <TableCell className="font-medium">{distributor.nama_distributor}</TableCell>
                    <TableCell>{distributor.alamat || "-"}</TableCell>
                    <TableCell>{distributor.telepon || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDistributor(distributor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(distributor.id_distributor)}
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
      <Dialog open={!!editingDistributor} onOpenChange={() => setEditingDistributor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Distributor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_nama_distributor">Nama Distributor</Label>
              <Input 
                id="edit_nama_distributor" 
                name="nama_distributor" 
                defaultValue={editingDistributor?.nama_distributor}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit_alamat">Alamat</Label>
              <Textarea 
                id="edit_alamat" 
                name="alamat" 
                defaultValue={editingDistributor?.alamat || ""}
              />
            </div>
            <div>
              <Label htmlFor="edit_telepon">Telepon</Label>
              <Input 
                id="edit_telepon" 
                name="telepon" 
                defaultValue={editingDistributor?.telepon || ""}
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Distributor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
