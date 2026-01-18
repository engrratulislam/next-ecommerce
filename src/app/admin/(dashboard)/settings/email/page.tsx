'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Loader2, Mail, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailSettings {
  email: {
    fromName: string;
    fromEmail: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
  };
}

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState<EmailSettings>({
    email: {
      fromName: '',
      fromEmail: '',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();

      if (data.success) {
        setSettings({
          email: data.settings.email || {
            fromName: '',
            fromEmail: '',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Email settings saved successfully');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      // This would call a test email endpoint
      toast.info('Test email functionality not yet implemented');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
        <p className="text-gray-600 mt-1">Configure email delivery and SMTP settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>Configure sender information for outgoing emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name *</Label>
                <Input
                  id="fromName"
                  value={settings.email.fromName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, fromName: e.target.value },
                    })
                  }
                  placeholder="My Store"
                  required
                />
                <p className="text-sm text-gray-500">
                  The name that appears in the "From" field of emails
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email *</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, fromEmail: e.target.value },
                    })
                  }
                  placeholder="noreply@mystore.com"
                  required
                />
                <p className="text-sm text-gray-500">
                  The email address that appears in the "From" field
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SMTP Configuration</CardTitle>
            <CardDescription>
              Configure SMTP server for sending emails (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                If SMTP settings are not configured, the system will use the default email service.
                For production use, it's recommended to configure your own SMTP server.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={settings.email.smtpHost || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpHost: e.target.value },
                    })
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.email.smtpPort || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPort: parseInt(e.target.value) || undefined },
                    })
                  }
                  placeholder="587"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={settings.email.smtpUser || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpUser: e.target.value },
                    })
                  }
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.email.smtpPassword || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPassword: e.target.value },
                    })
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestEmail}
                disabled={testing}
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Common SMTP Providers */}
        <Card>
          <CardHeader>
            <CardTitle>Common SMTP Providers</CardTitle>
            <CardDescription>Quick reference for popular email services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Gmail</p>
                <p className="text-gray-600">Host: smtp.gmail.com | Port: 587 (TLS) or 465 (SSL)</p>
                <p className="text-xs text-gray-500 mt-1">
                  Note: You may need to enable "Less secure app access" or use an App Password
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">SendGrid</p>
                <p className="text-gray-600">Host: smtp.sendgrid.net | Port: 587</p>
                <p className="text-xs text-gray-500 mt-1">Username: apikey | Password: Your API Key</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Mailgun</p>
                <p className="text-gray-600">Host: smtp.mailgun.org | Port: 587</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Amazon SES</p>
                <p className="text-gray-600">Host: email-smtp.[region].amazonaws.com | Port: 587</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
