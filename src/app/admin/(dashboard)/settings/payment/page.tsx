'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Loader2, CreditCard } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface PaymentSettings {
  paymentGateways: {
    stripe: {
      enabled: boolean;
      publicKey?: string;
      secretKey?: string;
    };
    paypal: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
    };
    sslcommerz: {
      enabled: boolean;
      storeId?: string;
      storePassword?: string;
    };
    cod: {
      enabled: boolean;
    };
  };
  tax: {
    enabled: boolean;
    rate: number;
    includeInPrice: boolean;
  };
}

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>({
    paymentGateways: {
      stripe: { enabled: false },
      paypal: { enabled: false },
      sslcommerz: { enabled: false },
      cod: { enabled: true },
    },
    tax: {
      enabled: false,
      rate: 0,
      includeInPrice: false,
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
          paymentGateways: data.settings.paymentGateways || {
            stripe: { enabled: false },
            paypal: { enabled: false },
            sslcommerz: { enabled: false },
            cod: { enabled: true },
          },
          tax: data.settings.tax || {
            enabled: false,
            rate: 0,
            includeInPrice: false,
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
        toast.success('Payment settings saved successfully');
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
        <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
        <p className="text-gray-600 mt-1">Configure payment gateways and tax settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stripe */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Stripe</CardTitle>
                <CardDescription>Accept credit card payments via Stripe</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stripe-enabled"
                  checked={settings.paymentGateways.stripe.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        stripe: { ...settings.paymentGateways.stripe, enabled: !!checked },
                      },
                    })
                  }
                />
                <Label htmlFor="stripe-enabled" className="cursor-pointer">
                  Enable Stripe
                </Label>
              </div>
            </div>
          </CardHeader>
          {settings.paymentGateways.stripe.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-public">Publishable Key</Label>
                <Input
                  id="stripe-public"
                  value={settings.paymentGateways.stripe.publicKey || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        stripe: { ...settings.paymentGateways.stripe, publicKey: e.target.value },
                      },
                    })
                  }
                  placeholder="pk_test_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Secret Key</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  value={settings.paymentGateways.stripe.secretKey || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        stripe: { ...settings.paymentGateways.stripe, secretKey: e.target.value },
                      },
                    })
                  }
                  placeholder="sk_test_..."
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* PayPal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>PayPal</CardTitle>
                <CardDescription>Accept payments via PayPal</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paypal-enabled"
                  checked={settings.paymentGateways.paypal.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        paypal: { ...settings.paymentGateways.paypal, enabled: !!checked },
                      },
                    })
                  }
                />
                <Label htmlFor="paypal-enabled" className="cursor-pointer">
                  Enable PayPal
                </Label>
              </div>
            </div>
          </CardHeader>
          {settings.paymentGateways.paypal.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paypal-client">Client ID</Label>
                <Input
                  id="paypal-client"
                  value={settings.paymentGateways.paypal.clientId || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        paypal: { ...settings.paymentGateways.paypal, clientId: e.target.value },
                      },
                    })
                  }
                  placeholder="AYSq3RDGsmBLJE-otTkBtM-jBRd1TCQwFf9RGfwddNXWz0uFU9ztymylOhRS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paypal-secret">Client Secret</Label>
                <Input
                  id="paypal-secret"
                  type="password"
                  value={settings.paymentGateways.paypal.clientSecret || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        paypal: { ...settings.paymentGateways.paypal, clientSecret: e.target.value },
                      },
                    })
                  }
                  placeholder="EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* SSLCommerz */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SSLCommerz</CardTitle>
                <CardDescription>Accept payments via SSLCommerz (Bangladesh)</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sslcommerz-enabled"
                  checked={settings.paymentGateways.sslcommerz.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        sslcommerz: { ...settings.paymentGateways.sslcommerz, enabled: !!checked },
                      },
                    })
                  }
                />
                <Label htmlFor="sslcommerz-enabled" className="cursor-pointer">
                  Enable SSLCommerz
                </Label>
              </div>
            </div>
          </CardHeader>
          {settings.paymentGateways.sslcommerz.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ssl-store">Store ID</Label>
                <Input
                  id="ssl-store"
                  value={settings.paymentGateways.sslcommerz.storeId || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        sslcommerz: { ...settings.paymentGateways.sslcommerz, storeId: e.target.value },
                      },
                    })
                  }
                  placeholder="your_store_id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssl-password">Store Password</Label>
                <Input
                  id="ssl-password"
                  type="password"
                  value={settings.paymentGateways.sslcommerz.storePassword || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        sslcommerz: { ...settings.paymentGateways.sslcommerz, storePassword: e.target.value },
                      },
                    })
                  }
                  placeholder="your_store_password"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Cash on Delivery */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cash on Delivery (COD)</CardTitle>
                <CardDescription>Allow customers to pay on delivery</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cod-enabled"
                  checked={settings.paymentGateways.cod.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        cod: { enabled: !!checked },
                      },
                    })
                  }
                />
                <Label htmlFor="cod-enabled" className="cursor-pointer">
                  Enable COD
                </Label>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
            <CardDescription>Configure tax rates for your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tax-enabled"
                checked={settings.tax.enabled}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    tax: { ...settings.tax, enabled: !!checked },
                  })
                }
              />
              <Label htmlFor="tax-enabled" className="cursor-pointer">
                Enable Tax
              </Label>
            </div>

            {settings.tax.enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.tax.rate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        tax: { ...settings.tax, rate: parseFloat(e.target.value) || 0 },
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tax-include"
                    checked={settings.tax.includeInPrice}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        tax: { ...settings.tax, includeInPrice: !!checked },
                      })
                    }
                  />
                  <Label htmlFor="tax-include" className="cursor-pointer">
                    Include tax in product prices
                  </Label>
                </div>
              </>
            )}
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
