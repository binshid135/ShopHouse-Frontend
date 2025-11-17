// components/AboutUs.tsx
import React, { useState, useEffect } from 'react';
import { Users, Target, Award, Heart, ChevronLeft, ChevronRight, CheckCircle, Shield, Truck, Headphones } from 'lucide-react';
import Image from "next/image";

const AboutUs: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const storePhotos = [
    {
      id: 1,
      title: "Store Front",
      description: "Visit our modern and welcoming storefront",
      placeholder: "bg-gradient-to-br from-orange-200 to-amber-300",
      image: "/shopphoto.jpeg"
    },
    {
      id: 2,
      title: "Showroom",
      description: "Explore our extensive product display",
      placeholder: "bg-gradient-to-br from-amber-200 to-orange-300",
      image: "/instore1.jpg"
    },
    // {
    //   id: 3,
    //   title: "Product Display",
    //   description: "High-quality kitchen equipment on display",
    //   placeholder: "bg-gradient-to-br from-orange-300 to-amber-400",
    //   image: "/shopphoto.jpeg"
    // },
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
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            About <br></br> Shop House General trading
          </h2>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Empowering culinary professionals with premium kitchen equipment since 2024.
            We're committed to helping you create exceptional dining experiences.
          </p>
        </div>

        {/* Main Content Section - Description Left, Carousel Right */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Products & Services Description - Left Side */}
          <div>
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                Our Products & Services
              </h3>
              <p className="text-amber-600">
                Everything you need for a professional kitchen, delivered with excellence
              </p>
            </div>

            <div className="space-y-6">
              {/* Main Description */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6">
                <p className="text-amber-800 leading-relaxed text-lg mb-6">
                  At ShopHouse, we provide comprehensive kitchen solutions for professional 
                  chefs, restaurants, and culinary enthusiasts. Our extensive product range 
                  combines quality, innovation, and reliability to meet the demanding needs 
                  of modern kitchens.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-amber-700">Commercial Grade Equipment</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-amber-700">Professional Cookware</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-amber-700">Kitchen Tools & Utensils</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-amber-700">Food Preparation Equipment</span>
                  </div>
                </div>
              </div>

              {/* Services Features */}
              <div className="grid sm:grid-cols-2 gap-6">
                <ServiceFeature
                  icon={<Shield className="w-6 h-6" />}
                  title="Quality Guarantee"
                  description="All products come with comprehensive warranties and quality assurance"
                />
                <ServiceFeature
                  icon={<Truck className="w-6 h-6" />}
                  title="Fast Delivery"
                  description="Quick and reliable shipping across the region"
                />
                <ServiceFeature
                  icon={<Headphones className="w-6 h-6" />}
                  title="Expert Support"
                  description="Professional advice and after-sales service"
                />
                <ServiceFeature
                  icon={<Award className="w-6 h-6" />}
                  title="Trusted Brands"
                  description="Curated selection of top international brands"
                />
              </div>

              {/* Additional Info */}
              <div className="bg-amber-100 rounded-xl p-6">
                <h4 className="font-semibold text-amber-900 mb-3">
                  Why Choose ShopHouse?
                </h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  We understand that every kitchen has unique requirements. That's why we offer 
                  personalized consultation services, helping you select the perfect equipment 
                  for your specific needs. Our team of experienced professionals is dedicated 
                  to ensuring your complete satisfaction.
                </p>
              </div>
            </div>
          </div>

          {/* Carousel Section - Right Side */}
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                Our Store
              </h3>
              <p className="text-amber-600 max-w-2xl mx-auto">
                Get a glimpse of our well-stocked showroom and experienced team
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
                          alt={photo.title}
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
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
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
                    className={`w-12 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                      index === currentSlide
                        ? 'ring-2 ring-orange-500 ring-offset-2 scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div className="w-full h-full relative">
                      <Image
                        src={photo.image}
                        alt={photo.title}
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
            label="Happy Customers"
          />
          <StatCard
            icon={<Target className="w-8 h-8" />}
            number="500+"
            label="Products"
          />
          <StatCard
            icon={<Heart className="w-8 h-8" />}
            number="100%"
            label="Satisfaction Rate"
          />
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12">
          <MissionCard />
          <VisionCard />
        </div>

        {/* Team Values */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-amber-900 text-center mb-8">
            Our Values
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              title="Quality First"
              description="We source only the highest quality equipment from trusted manufacturers worldwide."
              color="text-blue-600"
            />
            <ValueCard
              title="Chef-Focused"
              description="Every product is tested and approved by professional chefs for real kitchen use."
              color="text-green-600"
            />
            <ValueCard
              title="Reliable Service"
              description="100% customer support and fast delivery to keep your kitchen running smoothly."
              color="text-orange-600"
            />
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
      <h4 className="font-semibold text-amber-900 mb-1">{title}</h4>
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
    <h3 className="text-2xl font-bold text-amber-900 mb-4">Our Mission</h3>
    <p className="text-amber-700 leading-relaxed mb-4">
      To provide professional chefs and culinary enthusiasts with reliable,
      high-performance kitchen equipment that enhances creativity and efficiency
      in every kitchen we serve.
    </p>
    <ul className="space-y-2 text-amber-600">
      <li className="flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
        Source premium quality equipment
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
        Support culinary professionals
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
        Foster kitchen innovation
      </li>
    </ul>
  </div>
);

const VisionCard: React.FC = () => (
  <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-8">
    <h3 className="text-2xl font-bold text-amber-900 mb-4">Our Vision</h3>
    <p className="text-amber-700 leading-relaxed mb-4">
      To become the most trusted partner for professional kitchens worldwide,
      recognized for our unwavering commitment to quality, service, and
      culinary excellence.
    </p>
    <ul className="space-y-2 text-amber-600">
      <li className="flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
        Global kitchen equipment leader
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
        Innovation in culinary technology
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
        Sustainable kitchen solutions
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
    <h4 className="text-xl font-semibold text-amber-900 mb-3">{title}</h4>
    <p className="text-amber-600 leading-relaxed">{description}</p>
  </div>
);

export default AboutUs;