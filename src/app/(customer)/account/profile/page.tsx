'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: (session.user as any).phone || '',
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await update();
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: session?.user?.name || '',
                    email: session?.user?.email || '',
                    phone: (session?.user as any)?.phone || '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{session?.user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{session?.user?.email}</p>
              </div>
            </div>

            {(session?.user as any)?.phone && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{(session?.user as any).phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date((session?.user as any)?.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">
            {(session?.user as any)?.orderCount || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-gray-900">
            ${((session?.user as any)?.totalSpent || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Loyalty Points</p>
          <p className="text-3xl font-bold text-gray-900">
            {(session?.user as any)?.loyaltyPoints || 0}
          </p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>
        <p className="text-gray-600 mb-4">
          Want to change your password? Click the button below to receive a password reset link.
        </p>
        <Button variant="outline">Send Reset Link</Button>
      </div>
    </div>
  );
}
