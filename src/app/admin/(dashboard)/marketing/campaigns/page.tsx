'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SimplePagination } from '@/components/ui/simple-pagination';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  Mail,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  _id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  recipientType: 'all' | 'subscribers' | 'customers' | 'custom';
  recipientEmails?: string[];
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    recipientType: 'subscribers' as 'all' | 'subscribers' | 'customers' | 'custom',
    recipientEmails: '',
    scheduledAt: '',
    status: 'draft' as 'draft' | 'scheduled',
  });

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const fetchCampaigns = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/campaigns?${params}`);
      const data = await res.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCampaign
        ? `/api/admin/campaigns/${editingCampaign._id}`
        : '/api/admin/campaigns';

      const method = editingCampaign ? 'PUT' : 'POST';

      const payload: any = {
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        recipientType: formData.recipientType,
        status: formData.status,
      };

      if (formData.recipientType === 'custom') {
        payload.recipientEmails = formData.recipientEmails
          .split(',')
          .map((email) => email.trim())
          .filter((email) => email);
      }

      if (formData.scheduledAt) {
        payload.scheduledAt = new Date(formData.scheduledAt).toISOString();
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingCampaign
            ? 'Campaign updated successfully'
            : 'Campaign created successfully'
        );
        setIsDialogOpen(false);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to save campaign');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      recipientType: campaign.recipientType,
      recipientEmails: campaign.recipientEmails?.join(', ') || '',
      scheduledAt: campaign.scheduledAt
        ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
        : '',
      status: campaign.status === 'sent' ? 'draft' : campaign.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleSend = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to send campaign "${name}" now?`)) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/send`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          `Campaign sent successfully! ${data.stats.successCount} emails sent.`
        );
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Campaign cancelled successfully');
        fetchCampaigns();
      } else {
        toast.error('Failed to cancel campaign');
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      toast.error('Failed to cancel campaign');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      recipientType: 'subscribers',
      recipientEmails: '',
      scheduledAt: '',
      status: 'draft',
    });
    setEditingCampaign(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: <Badge variant="secondary">Draft</Badge>,
      scheduled: (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Scheduled
        </Badge>
      ),
      sent: (
        <Badge variant="default" className="bg-green-100 text-green-700">
          Sent
        </Badge>
      ),
      cancelled: <Badge variant="destructive">Cancelled</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  const getRecipientTypeLabel = (type: string) => {
    const labels = {
      all: 'All Users',
      subscribers: 'Newsletter Subscribers',
      customers: 'Customers Only',
      custom: 'Custom List',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and manage email marketing campaigns</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {pagination?.totalCount || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {campaigns.filter((c) => c.status === 'sent').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {campaigns.filter((c) => c.status === 'scheduled').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {campaigns.reduce((sum, c) => sum + c.successCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
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
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first email campaign.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-500">{campaign.subject}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {campaign.totalRecipients.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getRecipientTypeLabel(campaign.recipientType)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      {campaign.status === 'sent' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-900">
                              {campaign.successCount} sent
                            </span>
                          </div>
                          {campaign.failureCount > 0 && (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-gray-900">
                                {campaign.failureCount} failed
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {campaign.sentAt ? (
                          <>
                            <p className="text-gray-900">Sent</p>
                            <p className="text-gray-500">
                              {new Date(campaign.sentAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </>
                        ) : campaign.scheduledAt ? (
                          <>
                            <p className="text-gray-900">Scheduled</p>
                            <p className="text-gray-500">
                              {new Date(campaign.scheduledAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-900">Created</p>
                            <p className="text-gray-500">
                              {new Date(campaign.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={sending}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {campaign.status !== 'sent' && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSend(campaign._id, campaign.name)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Now
                              </DropdownMenuItem>
                            </>
                          )}
                          {campaign.status === 'scheduled' && (
                            <DropdownMenuItem onClick={() => handleCancel(campaign._id)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          {(campaign.status === 'draft' ||
                            campaign.status === 'cancelled') && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(campaign._id, campaign.name)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <SimplePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={fetchCampaigns}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Sale 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject *
              </label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Don't miss our summer sale!"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Content (HTML) *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="<h1>Hello!</h1><p>Check out our amazing deals...</p>"
                rows={10}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use HTML to format your email content
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipients *
              </label>
              <Select
                value={formData.recipientType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, recipientType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="subscribers">Newsletter Subscribers</SelectItem>
                  <SelectItem value="customers">Customers Only</SelectItem>
                  <SelectItem value="custom">Custom Email List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.recipientType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Addresses *
                </label>
                <Textarea
                  value={formData.recipientEmails}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientEmails: e.target.value })
                  }
                  placeholder="email1@example.com, email2@example.com"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple emails with commas
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
