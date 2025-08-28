import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import type { User, CreateUserRequest } from "~backend/toko/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => backend.toko.listUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => backend.toko.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (error) => {
      console.error("Create user error:", error);
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & Partial<CreateUserRequest>) => 
      backend.toko.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast({ title: "Success", description: "User updated successfully" });
    },
    onError: (error) => {
      console.error("Update user error:", error);
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.toko.deleteUser({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete user error:", error);
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      nama_lengkap: formData.get("nama_lengkap") as string || undefined,
      level: formData.get("level") as "admin" | "kasir" | "gudang",
    };

    if (editingUser) {
      const updateData: any = { id: editingUser.id_user, ...data };
      if (!data.password) {
        delete updateData.password;
      }
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(data);
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      kasir: "bg-blue-100 text-blue-800",
      gudang: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        {level}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage system users and their access levels</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div>
                <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                <Input id="nama_lengkap" name="nama_lengkap" />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Select name="level" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="kasir">Kasir</SelectItem>
                    <SelectItem value="gudang">Gudang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.users.map((user) => (
                  <TableRow key={user.id_user}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.nama_lengkap || "-"}</TableCell>
                    <TableCell>{getLevelBadge(user.level)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(user.id_user)}
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
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_username">Username</Label>
              <Input 
                id="edit_username" 
                name="username" 
                defaultValue={editingUser?.username}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit_password">Password (leave empty to keep current)</Label>
              <Input id="edit_password" name="password" type="password" />
            </div>
            <div>
              <Label htmlFor="edit_nama_lengkap">Nama Lengkap</Label>
              <Input 
                id="edit_nama_lengkap" 
                name="nama_lengkap" 
                defaultValue={editingUser?.nama_lengkap || ""}
              />
            </div>
            <div>
              <Label htmlFor="edit_level">Level</Label>
              <Select name="level" defaultValue={editingUser?.level} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select user level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="kasir">Kasir</SelectItem>
                  <SelectItem value="gudang">Gudang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
