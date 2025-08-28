import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import type { Cart } from "~backend/toko/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import StoreLayout from "../components/StoreLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CartPage() {
  const [customerId] = useState(1); // In real app, this would come from auth
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart", customerId],
    queryFn: () => backend.toko.getCart({ id_pelanggan: customerId }),
  });

  const updateCartMutation = useMutation({
    mutationFn: (data: { id_cart: number; jumlah: number }) =>
      backend.toko.updateCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({ title: "Success", description: "Cart updated" });
    },
    onError: (error) => {
      console.error("Update cart error:", error);
      toast({ title: "Error", description: "Failed to update cart", variant: "destructive" });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (id: number) => backend.toko.removeFromCart({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({ title: "Success", description: "Item removed from cart" });
    },
    onError: (error) => {
      console.error("Remove from cart error:", error);
      toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => backend.toko.checkout({ id_pelanggan: customerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Success", description: "Order placed successfully!" });
    },
    onError: (error) => {
      console.error("Checkout error:", error);
      toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
    },
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const updateQuantity = (cartItem: Cart, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCartMutation.mutate(cartItem.id_cart);
    } else {
      updateCartMutation.mutate({
        id_cart: cartItem.id_cart,
        jumlah: newQuantity,
      });
    }
  };

  const calculateTotal = () => {
    if (!cartData?.cart) return 0;
    return cartData.cart.reduce((total, item) => {
      const price = (item.barang as any)?.harga_jual || 0;
      return total + (price * item.jumlah);
    }, 0);
  };

  const cartItems = cartData?.cart || [];
  const total = calculateTotal();

  return (
    <StoreLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">Review your items before checkout</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add some products to get started</p>
              <Button onClick={() => window.location.href = "/"}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => {
                        const product = item.barang as any;
                        const price = product?.harga_jual || 0;
                        const subtotal = price * item.jumlah;

                        return (
                          <TableRow key={item.id_cart}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product?.nama_barang}</p>
                                {product?.merk && (
                                  <p className="text-sm text-gray-600">{product.merk}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(price)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item, item.jumlah - 1)}
                                  disabled={updateCartMutation.isPending}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.jumlah}
                                  onChange={(e) => updateQuantity(item, Number(e.target.value))}
                                  className="w-20 text-center"
                                  min="1"
                                  max={product?.stok || 999}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item, item.jumlah + 1)}
                                  disabled={updateCartMutation.isPending || item.jumlah >= (product?.stok || 0)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(subtotal)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCartMutation.mutate(item.id_cart)}
                                disabled={removeFromCartMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <Button
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending || cartItems.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {checkoutMutation.isPending ? "Processing..." : "Checkout"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = "/"}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
