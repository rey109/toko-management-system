import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import type { Barang } from "~backend/toko/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Search, Package } from "lucide-react";
import StoreLayout from "../components/StoreLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Barang | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerId, setCustomerId] = useState(1); // In real app, this would come from auth
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["store-products"],
    queryFn: () => backend.toko.listProducts(),
  });

  const { data: searchResults } = useQuery({
    queryKey: ["search-products", searchQuery],
    queryFn: () => backend.toko.searchProducts({ q: searchQuery }),
    enabled: searchQuery.length > 0,
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: { id_pelanggan: number; id_barang: number; jumlah: number }) =>
      backend.toko.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setSelectedProduct(null);
      setQuantity(1);
      toast({ title: "Success", description: "Product added to cart" });
    },
    onError: (error) => {
      console.error("Add to cart error:", error);
      toast({ title: "Error", description: "Failed to add product to cart", variant: "destructive" });
    },
  });

  const displayProducts = searchQuery ? searchResults?.products : productsData?.products;

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const handleAddToCart = (product: Barang) => {
    setSelectedProduct(product);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    
    addToCartMutation.mutate({
      id_pelanggan: customerId,
      id_barang: selectedProduct.id_barang,
      jumlah: quantity,
    });
  };

  return (
    <StoreLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <p className="text-gray-600 mt-2">Discover our wide range of quality products</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : displayProducts && displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <Card key={product.id_barang} className="transition-shadow hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{product.nama_barang}</CardTitle>
                    <Badge variant={product.stok && product.stok > 0 ? "default" : "destructive"}>
                      {product.stok && product.stok > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  {product.merk && (
                    <p className="text-sm text-gray-600">{product.merk}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.jenis_barang && (
                      <Badge variant="outline">{product.jenis_barang}</Badge>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(product.harga_jual)}
                        </p>
                        {product.satuan && (
                          <p className="text-sm text-gray-500">per {product.satuan}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Stock: {product.stok || 0}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.stok || product.stok <= 0}
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchQuery ? "No products found matching your search." : "No products available."}
            </p>
          </div>
        )}

        {/* Add to Cart Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Cart</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedProduct.nama_barang}</h3>
                  <p className="text-gray-600">{selectedProduct.merk}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(selectedProduct.harga_jual)}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.stok || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available: {selectedProduct.stok} {selectedProduct.satuan}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="flex-1"
                  >
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StoreLayout>
  );
}
