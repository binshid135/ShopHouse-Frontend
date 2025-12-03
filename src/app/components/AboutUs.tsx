// components/AboutUs.tsx
import React, { useState, useEffect } from 'react';
import { Users, Target, Award, Heart, ChevronLeft, ChevronRight, CheckCircle, Shield, Truck, Headphones, MapPin } from 'lucide-react';
import Image from "next/image";

const AboutUs: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const storePhotos = [
    {
      id: 1,
      title: "Store Front - Al Ain",
      description: "Visit our modern kitchen equipment store in Al Ain",
      placeholder: "bg-gradient-to-br from-orange-200 to-amber-300",
      image: "/shopphoto.jpeg"
    },
    {
      id: 2,
      title: "Showroom Display",
      description: "Explore our extensive kitchen equipment collection in Al Ain",
      placeholder: "bg-gradient-to-br from-amber-200 to-orange-300",
      image: "/instore1.jpg"
    },
    {
      id: 3,
      title: "Showroom Display",
      description: "Explore our extensive kitchen equipment collection in Al Ain",
      placeholder: "bg-gradient-to-br from-amber-200 to-orange-300",
      image: "/instore2.jpg"
    }, {
      id: 4,
      title: "Showroom Display",
      description: "Explore our extensive kitchen equipment collection in Al Ain",
      placeholder: "bg-gradient-to-br from-amber-200 to-orange-300",
      image: "/instore3.jpg"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === storePhotos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? storePhotos.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <section className="relative px-6 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            About Shop House General Trading - Al Ain's Premier Kitchen Equipment Supplier
          </h1>
          <p className="text-lg text-amber-700 max-w-3xl mx-auto">
            Empowering culinary professionals in Al Ain with premium kitchen equipment since 2024.
            We're Al Ain's trusted partner for professional kitchen supplies, restaurant equipment,
            and commercial cooking solutions.
          </p>

          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-100 rounded-full">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span className="text-amber-800 font-medium">
              Based in Al Ain, UAE - Serving the Entire Region
            </span>
          </div>
        </div>

        {/* Main Content Section - Description Left, Carousel Right */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Products & Services Description - Left Side */}
          <div>
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                Kitchen Equipment & Services in Al Ain
              </h2>
              <p className="text-amber-600">
                Your complete solution for restaurant equipment in Al Ain, professional kitchen supplies,
                and commercial cooking equipment
              </p>
            </div>

            <div className="space-y-6">
              {/* Main Description */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6">
                <p className="text-amber-800 leading-relaxed text-lg mb-6">
                  At <strong>Shop House General Trading</strong> in <strong>Al Ain</strong>, we provide comprehensive
                  kitchen solutions for professional chefs, restaurants, hotels, and culinary enthusiasts
                  across the UAE. As Al Ain's leading kitchen equipment supplier, we specialize in
                  commercial kitchen equipment, restaurant supplies, and professional cooking tools
                  that meet the demanding needs of modern kitchens.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-amber-700">Commercial Kitchen Equipment Al Ain</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-amber-700">Professional Cookware UAE</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-amber-700">Kitchen Utensils & Tools Al Ain</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-amber-700">Food Preparation Equipment UAE</span>
                  </div>
                </div>
              </div>

              {/* Services Features */}
              <div className="grid sm:grid-cols-2 gap-6">
                <ServiceFeature
                  icon={<Shield className="w-6 h-6" />}
                  title="Quality Guarantee"
                  description="All kitchen equipment in Al Ain comes with comprehensive warranties"
                />
                <ServiceFeature
                  icon={<Truck className="w-6 h-6" />}
                  title="Fast Delivery Al Ain"
                  description="Quick delivery of restaurant equipment across Al Ain and UAE"
                />
                <ServiceFeature
                  icon={<Headphones className="w-6 h-6" />}
                  title="Expert Support"
                  description="Professional kitchen equipment advice in Al Ain"
                />
                <ServiceFeature
                  icon={<Award className="w-6 h-6" />}
                  title="Trusted Brands"
                  description="Top international kitchen equipment brands available in Al Ain"
                />
              </div>

              {/* Additional Info */}
              <div className="bg-amber-100 rounded-xl p-6">
                <h3 className="font-semibold text-amber-900 mb-3">
                  Why Choose Shop House General Trading in Al Ain?
                </h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                  As Al Ain's premier kitchen equipment supplier, we understand that every restaurant
                  and kitchen has unique requirements. That's why we offer personalized consultation
                  services for commercial kitchen setup in Al Ain, helping you select the perfect
                  equipment for your specific needs. Our team of experienced professionals in Al Ain
                  is dedicated to ensuring your complete satisfaction with our kitchen solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Carousel Section - Right Side */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                Our Kitchen Equipment Store in Al Ain
              </h2>
              <p className="text-amber-600 max-w-2xl mx-auto">
                Visit our well-stocked kitchen equipment showroom in Al Ain for professional
                restaurant supplies and commercial cooking equipment
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative max-w-md mx-auto">
              {/* Carousel */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-black">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {storePhotos.map((photo) => (
                    <div key={photo.id} className="w-full flex-shrink-0">
                      <div className="aspect-[9/16] relative">
                        <Image
                          src={photo.image}
                          alt={`${photo.title} - Shop House General Trading Al Ain`}
                          fill
                          className="object-cover rounded-2xl"
                          priority
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {photo.title}
                          </h3>
                          <p className="text-gray-200 text-sm">
                            {photo.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <MapPin className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-300 text-sm">Al Ain, UAE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-amber-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-amber-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {storePhotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                        ? 'bg-white scale-125'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Slide Counter */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentSlide + 1} / {storePhotos.length}
                </div>
              </div>

              {/* Thumbnail Preview */}
              <div className="flex justify-center mt-4 space-x-2">
                {storePhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => goToSlide(index)}
                    className={`w-12 h-16 rounded-lg overflow-hidden transition-all duration-300 ${index === currentSlide
                      ? 'ring-2 ring-orange-500 ring-offset-2 scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                  >
                    <div className="w-full h-full relative">
                      <Image
                        src={photo.image}
                        alt={`${photo.title} thumbnail - Kitchen Equipment Store Al Ain`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            number="10,000+"
            label="Happy Customers in Al Ain & UAE"
          />
          <StatCard
            icon={<Target className="w-8 h-8" />}
            number="500+"
            label="Kitchen Products in Stock"
          />
          <StatCard
            icon={<Heart className="w-8 h-8" />}
            number="100%"
            label="Customer Satisfaction Rate"
          />
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12">
          <MissionCard />
          <VisionCard />
        </div>

        {/* Team Values */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-amber-900 text-center mb-8">
            Our Kitchen Equipment Values in Al Ain
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              title="Quality Kitchen Equipment Al Ain"
              description="We source only the highest quality commercial kitchen equipment from trusted manufacturers worldwide for our Al Ain customers."
              color="text-blue-600"
            />
            <ValueCard
              title="Chef-Focused Solutions UAE"
              description="Every restaurant equipment product is tested and approved by professional chefs for real kitchen use in Al Ain."
              color="text-green-600"
            />
            <ValueCard
              title="Reliable Service in Al Ain"
              description="100% customer support and fast delivery of kitchen supplies across Al Ain to keep your kitchen running smoothly."
              color="text-orange-600"
            />
          </div>
        </div>

        {/* SEO Keywords Section */}
        <div className="mt-16 pt-8 border-t border-amber-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">
              Shop House General Trading - Your Trusted Partner for:
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Kitchen Equipment Al Ain",
                "Restaurant Equipment UAE",
                "Commercial Kitchen Supplies",
                "Professional Cookware Al Ain",
                "Kitchen Utensils UAE",
                "Cooking Equipment Al Ain",
                "Hotel Kitchen Supplies",
                "Bakery Equipment UAE",
                "Food Service Equipment",
                "Kitchen Appliances Al Ain"
              ].map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Service Feature Component
interface ServiceFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceFeature: React.FC<ServiceFeatureProps> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="p-2 bg-orange-100 rounded-lg text-orange-600 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-amber-900 mb-1">{title}</h3>
      <p className="text-amber-600 text-sm">{description}</p>
    </div>
  </div>
);

interface StatCardProps {
  icon: React.ReactNode;
  number: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, number, label }) => (
  <div className="text-center">
    <div className="flex justify-center mb-3">
      <div className="p-3 bg-orange-100 rounded-full text-orange-600">
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-amber-900 mb-1">{number}</div>
    <div className="text-sm text-amber-600">{label}</div>
  </div>
);

const MissionCard: React.FC = () => (
  <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8">
    <h3 className="text-2xl font-bold text-amber-900 mb-4">Our Mission in Al Ain</h3>
    <p className="text-amber-700 leading-relaxed mb-4">
      To provide professional chefs and culinary enthusiasts in Al Ain with reliable,
      high-performance kitchen equipment that enhances creativity and efficiency
      in every kitchen we serve across the UAE.
    </p>
    <ul className="space-y-2 text-amber-600">
      <li className="flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
        Source premium quality kitchen equipment for Al Ain
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
        Support culinary professionals across UAE
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
        Foster kitchen innovation in Al Ain restaurants
      </li>
    </ul>
  </div>
);

const VisionCard: React.FC = () => (
  <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-8">
    <h3 className="text-2xl font-bold text-amber-900 mb-4">Our Vision for UAE</h3>
    <p className="text-amber-700 leading-relaxed mb-4">
      To become Al Ain's most trusted partner for professional kitchens, recognized
      for our unwavering commitment to quality kitchen equipment, service, and
      culinary excellence across the United Arab Emirates.
    </p>
    <ul className="space-y-2 text-amber-600">
      <li className="flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
        Al Ain's kitchen equipment leader
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
        Innovation in culinary technology UAE
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
        Sustainable kitchen solutions Al Ain
      </li>
    </ul>
  </div>
);

interface ValueCardProps {
  title: string;
  description: string;
  color: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ title, description, color }) => (
  <div className="text-center">
    <div className={`text-4xl mb-4 ${color}`}>•</div>
    <h3 className="text-xl font-semibold text-amber-900 mb-3">{title}</h3>
    <p className="text-amber-600 leading-relaxed">{description}</p>
  </div>
);

export default AboutUs;