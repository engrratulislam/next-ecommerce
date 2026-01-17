'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    price: '',
    comparePrice: '',
    cost: '',
    category: '',
    sku: '',
    barcode: '',
    stock: '',
    lowStockThreshold: '10',
    tags: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    productType: 'physical',
    isFeatured: false,
    isActive: true,
    isTaxable: true,
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();

      if (data.success && data.product) {
        const product = data.product;
        setFormData({
          name: product.name || '',
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          comparePrice: product.comparePrice?.toString() || '',
          cost: product.cost?.toString() || '',
          category: product.category?._id || product.category || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          stock: product.stock?.toString() || '0',
          lowStockThreshold: product.lowStockThreshold?.toString() || '10',
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
          weight: product.weight?.toString() || '',
          length: product.dimensions?.length?.toString() || '',
          width: product.dimensions?.width?.toString() || '',
          height: product.dimensions?.height?.toString() || '',
          productType: product.productType || 'physical',
          isFeatured: product.isFeatured || false,
          isActive: product.isActive !== undefined ? product.isActive : true,
          isTaxable: product.isTaxable !== undefined ? product.isTaxable : true,
          metaTitle: product.seo?.metaTitle || '',
          metaDescription: product.seo?.metaDescription || '',
        });
        setImagePreviews(product.images || []);
      } else {
        toast.error('Product not found');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validation
      if (!formData.name || !formData.price || !formData.category || !formData.sku) {
        toast.error('Please fill in all required fields');
        setSaving(false);
        return;
      }

      // Prepare data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: formData.length && formData.width && formData.height
          ? {
              length: parseFloat(formData.length),
              width: parseFloat(formData.width),
              height: parseFloat(formData.height),
            }
          : undefined,
        images: imagePreviews,
        thumbnail: imagePreviews[0] || '',
        seo: {
          metaTitle: formData.metaTitle || formData.name,
          metaDescription: formData.metaDescription || formData.shortDescription,
        },
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Product updated successfully!');
        router.push('/admin/products');
      } else {
        toast.error(data.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600 mt-1">Update product information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Brief product description (160 characters)"
                    maxLength={160}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed product description"
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., electronics, featured, sale"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="comparePrice">Compare Price</Label>
                    <Input
                      id="comparePrice"
                      name="comparePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.comparePrice}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost">Cost per item</Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">
                      SKU <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="PROD-001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                      placeholder="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping (Physical Products)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (g)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.length}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.width}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>Search Engine Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="Leave blank to use product name"
                    maxLength={60}
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="Leave blank to use short description"
                    rows={3}
                    maxLength={160}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked as boolean }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured">Featured</Label>
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isFeatured: checked as boolean }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isTaxable">Taxable</Label>
                  <Checkbox
                    id="isTaxable"
                    checked={formData.isTaxable}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isTaxable: checked as boolean }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Product Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, productType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload images</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-1 left-1" variant="secondary">
                            Thumbnail
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button type="submit" className="w-full" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href="/admin/products" className="block">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
