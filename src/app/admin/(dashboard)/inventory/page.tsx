'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SimplePagination } from '@/components/ui/simple-pagination';
import { Search, AlertCircle, Package, Edit } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  sku: string;
  thumbnail: string;
  stock: number;
  lowStockThreshold: number;
  category: {
    name: string;
  };
  price: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [updateStock, setUpdateStock] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, stockFilter]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(stockFilter === 'low' && { lowStock: 'true' }),
        ...(stockFilter === 'out' && { outOfStock: 'true' }),
      });

      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const res = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(updateStock) }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Stock updated successfully');
        setIsUpdateDialogOpen(false);
        setSelectedProduct(null);
        setUpdateStock('');
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const openUpdateDialog = (product: Product) => {
    setSelectedProduct(product);
    setUpdateStock(product.stock.toString());
    setIsUpdateDialogOpen(true);
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, color: 'bg-red-100 text-red-700' };
    }
    if (stock <= threshold) {
      return { label: 'Low Stock', variant: 'secondary' as const, color: 'bg-orange-100 text-orange-700' };
    }
    return { label: 'In Stock', variant: 'default' as const, color: 'bg-green-100 text-green-700' };
  };

  const getStockPercentage = (stock: number, threshold: number) => {
    if (stock === 0) return 0;
    const maxStock = threshold * 3; // Assume max is 3x threshold
    return Math.min((stock / maxStock) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage product stock levels</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">
            {pagination?.totalCount || 0}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {products.filter(p => p.stock > p.lowStockThreshold).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stock Filter */}
          <Select value={stockFilter || "all"} onValueChange={(value) => setStockFilter(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Stock Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Add products to start managing inventory.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const status = getStockStatus(product.stock, product.lowStockThreshold);
                  return (
                    <TableRow key={product._id}>
                      <TableCell>
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/admin/products/edit/${product._id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{product.sku}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {product.category?.name || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {product.stock}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          / {product.lowStockThreshold}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              product.stock === 0
                                ? 'bg-red-600'
                                : product.stock <= product.lowStockThreshold
                                ? 'bg-orange-600'
                                : 'bg-green-600'
                            }`}
                            style={{
                              width: `${getStockPercentage(product.stock, product.lowStockThreshold)}%`,
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUpdateDialog(product)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <SimplePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={fetchProducts}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Update Stock Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Product</p>
                <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Stock Level *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={updateStock}
                  onChange={(e) => setUpdateStock(e.target.value)}
                  placeholder="Enter new stock level"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Stock</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
