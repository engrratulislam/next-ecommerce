'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Loader2, Plus, Trash2, Truck } from 'lucide-react';

interface ShippingZone {
  name: string;
  countries: string[];
  rate: number;
}

interface ShippingSettings {
  shipping: {
    freeShippingThreshold?: number;
    flatRate?: number;
    zones?: ShippingZone[];
  };
}

export default function ShippingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ShippingSettings>({
    shipping: {
      zones: [],
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
          shipping: data.settings.shipping || { zones: [] },
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
        toast.success('Shipping settings saved successfully');
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

  const addZone = () => {
    setSettings({
      ...settings,
      shipping: {
        ...settings.shipping,
        zones: [
          ...(settings.shipping.zones || []),
          { name: '', countries: [], rate: 0 },
        ],
      },
    });
  };

  const removeZone = (index: number) => {
    const zones = [...(settings.shipping.zones || [])];
    zones.splice(index, 1);
    setSettings({
      ...settings,
      shipping: { ...settings.shipping, zones },
    });
  };

  const updateZone = (index: number, field: keyof ShippingZone, value: any) => {
    const zones = [...(settings.shipping.zones || [])];
    zones[index] = { ...zones[index], [field]: value };
    setSettings({
      ...settings,
      shipping: { ...settings.shipping, zones },
    });
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
        <h1 className="text-2xl font-bold text-gray-900">Shipping Settings</h1>
        <p className="text-gray-600 mt-1">Configure shipping rates and zones</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Shipping */}
        <Card>
          <CardHeader>
            <CardTitle>General Shipping</CardTitle>
            <CardDescription>Configure basic shipping options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="freeShipping">Free Shipping Threshold ($)</Label>
              <Input
                id="freeShipping"
                type="number"
                step="0.01"
                min="0"
                value={settings.shipping.freeShippingThreshold || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: {
                      ...settings.shipping,
                      freeShippingThreshold: parseFloat(e.target.value) || undefined,
                    },
                  })
                }
                placeholder="100.00"
              />
              <p className="text-sm text-gray-500">
                Orders above this amount will have free shipping. Leave empty to disable.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flatRate">Flat Rate Shipping ($)</Label>
              <Input
                id="flatRate"
                type="number"
                step="0.01"
                min="0"
                value={settings.shipping.flatRate || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: {
                      ...settings.shipping,
                      flatRate: parseFloat(e.target.value) || undefined,
                    },
                  })
                }
                placeholder="10.00"
              />
              <p className="text-sm text-gray-500">
                Standard shipping rate for all orders. Leave empty to use zone-based rates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Zones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shipping Zones</CardTitle>
                <CardDescription>Configure shipping rates by region</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addZone}>
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {settings.shipping.zones && settings.shipping.zones.length > 0 ? (
              settings.shipping.zones.map((zone, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Zone {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeZone(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`zone-name-${index}`}>Zone Name</Label>
                      <Input
                        id={`zone-name-${index}`}
                        value={zone.name}
                        onChange={(e) => updateZone(index, 'name', e.target.value)}
                        placeholder="e.g., North America"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`zone-countries-${index}`}>Countries</Label>
                      <Input
                        id={`zone-countries-${index}`}
                        value={zone.countries.join(', ')}
                        onChange={(e) =>
                          updateZone(
                            index,
                            'countries',
                            e.target.value.split(',').map((c) => c.trim())
                          )
                        }
                        placeholder="US, CA, MX"
                      />
                      <p className="text-xs text-gray-500">Comma-separated country codes</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`zone-rate-${index}`}>Shipping Rate ($)</Label>
                      <Input
                        id={`zone-rate-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={zone.rate}
                        onChange={(e) => updateZone(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="15.00"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No shipping zones configured</p>
                <Button type="button" variant="outline" onClick={addZone}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Zone
                </Button>
              </div>
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
