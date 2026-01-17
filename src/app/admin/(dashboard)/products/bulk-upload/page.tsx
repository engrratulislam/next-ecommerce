'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface UploadResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/products/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: data.imported || 0,
          failed: data.failed || 0,
          errors: data.errors || [],
        });
        
        if (data.failed === 0) {
          toast.success(`Successfully imported ${data.imported} products!`);
        } else {
          toast.warning(`Imported ${data.imported} products with ${data.failed} errors`);
        }
      } else {
        toast.error(data.error || 'Failed to upload products');
      }
    } catch (error) {
      console.error('Error uploading products:', error);
      toast.error('Failed to upload products');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,sku,price,comparePrice,stock,category,description,tags,isActive,isFeatured
"Wireless Headphones",WH-001,99.99,149.99,50,electronics,"High-quality wireless headphones","audio,wireless,featured",true,true
"USB Cable",USB-001,9.99,14.99,200,accessories,"Premium USB-C cable","cable,accessory",true,false`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully');
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Bulk Product Upload</h1>
            <p className="text-gray-600 mt-1">Import multiple products using CSV or Excel</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Products File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Before you start:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Download the template file below</li>
                    <li>Fill in your product data following the format</li>
                    <li>Ensure all required fields are filled</li>
                    <li>Upload your completed CSV or Excel file</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* File Upload */}
              <div>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer">
                    {file ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 text-primary-600 mx-auto" />
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">CSV or Excel file (up to 10MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Products
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-700">{result.success}</p>
                        <p className="text-sm text-green-600">Successful</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                        <p className="text-sm text-red-600">Failed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Errors Table */}
                {result.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Errors Detail</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge variant="destructive">{error.row}</Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{error.data?.name || 'N/A'}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-red-600">{error.error}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href="/admin/products" className="flex-1">
                    <Button className="w-full">View Products</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                    }}
                  >
                    Upload Another File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Download Template */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Download our CSV template to ensure your data is formatted correctly.
              </p>
              <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* Required Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Required Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">*</span>
                  <span><strong>name</strong> - Product name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">*</span>
                  <span><strong>sku</strong> - Unique product code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">*</span>
                  <span><strong>price</strong> - Product price</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">*</span>
                  <span><strong>category</strong> - Category slug</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Optional Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Optional Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• comparePrice</li>
                <li>• stock</li>
                <li>• description</li>
                <li>• tags (comma-separated)</li>
                <li>• isActive (true/false)</li>
                <li>• isFeatured (true/false)</li>
                <li>• weight</li>
                <li>• lowStockThreshold</li>
              </ul>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use category slug, not name</li>
                <li>• Separate multiple tags with commas</li>
                <li>• Use true/false for boolean fields</li>
                <li>• Ensure SKU is unique</li>
                <li>• Maximum 1000 products per upload</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
