'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin, Check } from 'lucide-react';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  type: 'shipping' | 'billing' | 'both';
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false,
    type: 'both' as 'shipping' | 'billing' | 'both',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isDefault: address.isDefault,
        type: address.type,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        isDefault: false,
        type: 'both',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingAddress 
        ? `/api/addresses/${editingAddress._id}`
        : '/api/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingAddress ? 'Address updated' : 'Address added');
        handleCloseDialog();
        fetchAddresses();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to save address');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Address deleted');
        fetchAddresses();
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/set-default`, {
        method: 'PUT',
      });

      if (response.ok) {
        toast.success('Default address updated');
        fetchAddresses();
      } else {
        toast.error('Failed to update default address');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-600 mb-6">Add your first address to make checkout faster</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white rounded-lg shadow-sm p-6 relative ${
                address.isDefault ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    <Check className="h-3 w-3" />
                    Default
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">{address.fullName}</h3>
                <p className="text-sm text-gray-600">{address.phone}</p>
              </div>

              <div className="text-sm text-gray-700 mb-4">
                <p>{address.address}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                  {address.type}
                </span>
              </div>

              <div className="flex gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address._id)}
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(address)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Address Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              >
                <option value="both">Shipping & Billing</option>
                <option value="shipping">Shipping Only</option>
                <option value="billing">Billing Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
              />
              <label htmlFor="isDefault" className="text-sm cursor-pointer">
                Set as default address
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
