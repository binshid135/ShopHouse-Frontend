export const metadata = {
  title: "About Shop House Al Ain – Household & Kitchen Store",
  description:
    "Shop House Al Ain is your trusted store for household items, kitchen accessories, restaurant tools, and home essentials. Affordable prices and quality products.",
  keywords: ["Shop House Al Ain", "household store Al Ain"],
  robots: { index: true, follow: true },
};

"use client";
import { useState } from 'react';
import { Users, Award, Clock, Shield, Truck, Heart } from 'lucide-react';
import Header from '../components/Header';
import FloatingElements from '../components/FloatingElements';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import Image from 'next/image';

export default function About() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const router = useRouter();

  const handleOrderNow = () => {
    router.push("/products");
  };

  const handleContactUs = () => {
    // Replace with your actual phone number
    window.open('tel:+971507191804');
  };

  const handleViewLocation = () => {
    // Replace with your actual business coordinates or address
    // Using coordinates for more precise location
    window.open('https://maps.app.goo.gl/jGW3mBkYN4oUXA9z8', '_blank');
    
    // Alternative using address:
    // window.open('https://www.google.com/maps/search/?api=1&query=Your+Business+Name+Your+Address+City+State', '_blank');
  };

  const values = [
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We source only the finest professional-grade equipment trusted by chefs worldwide.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Get your kitchen equipped before service with our morning delivery guarantee.'
    },
    {
      icon: Heart,
      title: 'Chef-Centric',
      description: 'Every product is tested and approved by professional culinary experts.'
    },
    {
      icon: Shield,
      title: 'Durability',
      description: 'Built to withstand the demands of commercial kitchen environments.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Hero Section */}
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Our <span className="text-orange-600">Story</span> of Excellence
              </h1>
              <p className="text-lg text-amber-800">
                Shop House is dedicated to providing the highest quality
                kitchen equipment to culinary professionals and passionate home cooks alike.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={handleViewLocation}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all"
                >
                  View our location
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl w-full aspect-square overflow-hidden shadow-2xl">
                <Image
                  src="/shopphoto.jpeg"
                  alt="Shop House Store"
                  fill
                  className="object-cover"
                  priority
                />
                {/* <div className="absolute -top-4 right-8 bg-white px-6 py-3 rounded-full shadow-lg">
                  <span className="text-sm font-semibold text-amber-900">Since 2025</span>
                </div>

                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg">
                  <span className="text-xl font-bold text-amber-900">Shop House</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-900 mb-4">Our Values</h2>
            <p className="text-lg text-amber-800 max-w-2xl mx-auto">
              What sets us apart in the world of professional kitchen equipment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-3">{value.title}</h3>
                <p className="text-amber-700 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-amber-900 mb-6">
            Ready to Elevate Your Kitchen?
          </h2>
          <p className="text-lg text-amber-800 mb-8 max-w-2xl mx-auto">
            Join thousands of professional chefs who trust Shop House for their kitchen equipment needs
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleOrderNow} className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all">
              Shop Now
            </button>
            <button 
              onClick={handleContactUs}
              className="border-2 border-orange-500 text-orange-600 px-8 py-3 rounded-full font-medium hover:bg-orange-50 transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}