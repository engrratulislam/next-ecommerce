'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import { SimplePagination } from '@/components/ui/simple-pagination';
import {
  ShoppingCart,
  Mail,
  DollarSign,
  Clock,
  Package,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface AbandonedCart {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  sessionId?: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      thumbnail: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  itemCount: number;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [daysFilter, setDaysFilter] = useState('7');
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchAbandonedCarts();
  }, [daysFilter]);

  const fetchAbandonedCarts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        days: daysFilter,
      });

      const res = await fetch(`/api/cart/abandoned?${params}`);
      const data = await res.json();

      if (data.success) {
        setCarts(data.carts || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      toast.error('Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setIsDetailsOpen(true);
  };

  const handleSendReminder = async (cart: AbandonedCart) => {
    if (!cart.user) {
      toast.error('Cannot send reminder to guest users');
      return;
    }

    // This would integrate with your email system
    toast.info('Email reminder feature coming soon!');
  };

  const getDaysAgo = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalRevenuePotential = () => {
    return carts.reduce((sum, cart) => sum + cart.total, 0);
  };

  const getAverageCartValue = () => {
    if (carts.length === 0) return 0;
    return getTotalRevenuePotential() / carts.length;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
          <p className="text-gray-600 mt-1">
            Track and recover abandoned shopping carts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abandoned Carts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {pagination?.totalCount || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Potential</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${getTotalRevenuePotential().toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Cart Value</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ${getAverageCartValue().toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {carts.reduce((sum, cart) => sum + cart.itemCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Abandoned for:
          </label>
          <Select value={daysFilter} onValueChange={setDaysFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="3">Last 3 days</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading abandoned carts...</p>
          </div>
        ) : carts.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No abandoned carts found
            </h3>
            <p className="text-gray-600">
              Great! There are no abandoned carts in the selected time period.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Cart Value</TableHead>
                  <TableHead>Abandoned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carts.map((cart) => {
                  const daysAgo = getDaysAgo(cart.updatedAt);
                  return (
                    <TableRow key={cart._id}>
                      <TableCell>
                        {cart.user ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {cart.user.name}
                            </p>
                            <p className="text-sm text-gray-500">{cart.user.email}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-gray-900">Guest User</p>
                            <p className="text-sm text-gray-500">
                              Session: {cart.sessionId?.slice(0, 8)}...
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          ${cart.total.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {daysAgo === 0
                              ? 'Today'
                              : daysAgo === 1
                              ? '1 day ago'
                              : `${daysAgo} days ago`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {daysAgo <= 1 ? (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-700"
                          >
                            Recent
                          </Badge>
                        ) : daysAgo <= 7 ? (
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-700"
                          >
                            Recoverable
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            Old
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(cart)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {cart.user && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendReminder(cart)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Remind
                            </Button>
                          )}
                        </div>
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
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={fetchAbandonedCarts}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cart Details</DialogTitle>
          </DialogHeader>
          {selectedCart && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                {selectedCart.user ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Name:</span> {selectedCart.user.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span>{' '}
                      {selectedCart.user.email}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Guest user - No contact information available</span>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Cart Items</h3>
                <div className="space-y-3">
                  {selectedCart.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                    >
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total Cart Value:</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${selectedCart.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Abandoned Info */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <Clock className="h-4 w-4" />
                  <span>
                    Abandoned {getDaysAgo(selectedCart.updatedAt)} days ago on{' '}
                    {new Date(selectedCart.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedCart.user && (
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={() => handleSendReminder(selectedCart)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Recovery Email
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
