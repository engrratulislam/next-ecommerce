'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  Award,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  addresses: Array<{
    type: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  isVerified: boolean;
  isActive: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  orderCount: number;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  createdAt: string;
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      // Fetch customer details
      const customerRes = await fetch(`/api/customers/${customerId}`);
      const customerData = await customerRes.json();

      if (customerData.success && customerData.customer) {
        setCustomer(customerData.customer);
      } else {
        toast.error('Customer not found');
        router.push('/admin/customers');
        return;
      }

      // Fetch customer orders
      const ordersRes = await fetch(`/api/orders?customer=${customerId}&limit=10`);
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer');
      router.push('/admin/customers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary-600 text-white text-xl">
                {customer.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {customer.isVerified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Verified
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  {customer.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{customer.orderCount}</p>
                    <p className="text-sm text-gray-600">Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${customer.totalSpent.toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{customer.loyaltyPoints}</p>
                    <p className="text-sm text-gray-600">Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                          >
                            {order.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">${order.total.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {order.orderStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/orders/${order._id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.addresses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No addresses saved</p>
              ) : (
                <div className="space-y-4">
                  {customer.addresses.map((address, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {address.type}
                        </Badge>
                        {address.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>{address.street}</p>
                        <p>
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{customer.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Customer Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="font-semibold text-gray-900">
                  ${customer.orderCount > 0
                    ? (customer.totalSpent / customer.orderCount).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Loyalty Points</span>
                <span className="font-semibold text-gray-900">
                  {customer.loyaltyPoints}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Status</span>
                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email Verified</span>
                <Badge variant={customer.isVerified ? 'default' : 'secondary'}>
                  {customer.isVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
