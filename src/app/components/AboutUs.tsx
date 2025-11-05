// components/AboutUs.tsx
import React, { useState, useEffect } from 'react';
import { Users, Target, Award, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const AboutUs: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const storePhotos = [
    {
      id: 1,
      title: "Store Front",
      description: "Visit our modern and welcoming storefront",
      placeholder: "bg-gradient-to-br from-orange-200 to-amber-300"
    },
    {
      id: 2,
      title: "Showroom",
      description: "Explore our extensive product display",
      placeholder: "bg-gradient-to-br from-amber-200 to-orange-300"
    },
    {
      id: 3,
      title: "Product Display",
      description: "High-quality kitchen equipment on display",
      placeholder: "bg-gradient-to-br from-orange-300 to-amber-400"
    },
    {
      id: 4,
      title: "Our Team",
      description: "Meet our experienced and friendly staff",
      placeholder: "bg-gradient-to-br from-amber-100 to-orange-200"
    },
    {
      id: 5,
      title: "Customer Service",
      description: "Professional service and expert advice",
      placeholder: "bg-gradient-to-br from-orange-100 to-amber-200"
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
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            About ShopHouse
          </h2>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Empowering culinary professionals with premium kitchen equipment since 2024. 
            We're committed to helping you create exceptional dining experiences.
          </p>
        </div>

        {/* Store Photos Carousel */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-amber-900 mb-2">
              Visit Our Store
            </h3>
            <p className="text-amber-600 max-w-2xl mx-auto">
              Get a glimpse of our well-stocked showroom and experienced team ready to serve you
            </p>
          </div>
          
          {/* Carousel Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Carousel */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {storePhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="w-full flex-shrink-0"
                  >
                    <div className={`aspect-[16/9] ${photo.placeholder} flex items-center justify-center relative`}>
                      <div className="text-center text-amber-700 z-10">
                        {/* <div className="text-4xl font-bold mb-2">{photo.title}</div>
                        <p className="text-lg opacity-90">{photo.description}</p>
                        <p className="text-sm opacity-75 mt-2">Add your photo here</p> */}
                      </div>
                      {/* Overlay for better text readability */}
                      <div className="absolute inset-0 bg-black bg-opacity-10" />
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
                  className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                    index === currentSlide 
                      ? 'ring-2 ring-orange-500 ring-offset-2 scale-110' 
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <div className={`w-full h-full ${photo.placeholder}`} />
                </button>
              ))}
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