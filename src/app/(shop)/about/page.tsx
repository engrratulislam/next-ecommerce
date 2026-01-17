import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Eye, Award, Users, Heart, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Modern E-Commerce',
  description: 'Learn about our mission, values, and the team behind our e-commerce platform.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bringing Quality Products to Your Doorstep
            </h1>
            <p className="text-xl text-primary-100">
              We're dedicated to providing the best online shopping experience with quality products,
              competitive prices, and exceptional customer service.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded in 2026, our e-commerce platform was born from a simple idea: make quality products
              accessible to everyone. We started as a small team with a big vision, and today we serve
              thousands of satisfied customers worldwide.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our journey began when our founders recognized the need for a more personalized shopping
              experience. We wanted to create a platform where customers could find exactly what they need,
              backed by reliable service and genuine care for their satisfaction.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we continue to grow while staying true to our core values: quality, affordability,
              and customer-first service. Every product we offer is carefully selected, and every customer
              interaction is handled with care.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="border-t-4 border-t-primary-600">
            <CardContent className="pt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To revolutionize online shopping by combining cutting-edge technology with personalized
                service, making quality products accessible to everyone while building lasting relationships
                with our customers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-600">
            <CardContent className="pt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To become the most trusted e-commerce platform by setting new standards in product quality,
                customer service, and innovation, while creating a sustainable business that benefits our
                customers, partners, and communities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Values */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Quality */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality First</h3>
              <p className="text-gray-600">
                We carefully curate every product to ensure it meets our high standards of quality and value.
              </p>
            </div>

            {/* Customer Focus */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer-Centric</h3>
              <p className="text-gray-600">
                Our customers are at the heart of everything we do. Your satisfaction is our success.
              </p>
            </div>

            {/* Integrity */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-600">
                We believe in honest business practices, transparent pricing, and building trust through action.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
                    <p className="text-gray-600 text-sm">
                      Quick and reliable delivery to your doorstep with real-time tracking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
                    <p className="text-gray-600 text-sm">
                      All products are carefully inspected and backed by our quality guarantee.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                    <p className="text-gray-600 text-sm">
                      Our customer service team is always here to help you with any questions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
                    <p className="text-gray-600 text-sm">
                      Hassle-free returns within 30 days if you're not completely satisfied.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <CardContent className="pt-12 pb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">10K+</div>
                  <div className="text-primary-100">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">5K+</div>
                  <div className="text-primary-100">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">50+</div>
                  <div className="text-primary-100">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99%</div>
                  <div className="text-primary-100">Satisfaction Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
