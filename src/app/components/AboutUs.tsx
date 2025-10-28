// components/AboutUs.tsx
import React from 'react';
import { Users, Target, Award, Heart } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <section className="relative px-6 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            About ShopHouse
          </h2>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Empowering culinary professionals with premium kitchen equipment since 2015. 
            We're committed to helping you create exceptional dining experiences.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <StatCard 
            icon={<Users className="w-8 h-8" />}
            number="10,000+"
            label="Happy Chefs"
          />
          <StatCard 
            icon={<Award className="w-8 h-8" />}
            number="15+"
            label="Years Experience"
          />
          <StatCard 
            icon={<Target className="w-8 h-8" />}
            number="500+"
            label="Products"
          />
          <StatCard 
            icon={<Heart className="w-8 h-8" />}
            number="98%"
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
              description="24/7 customer support and fast delivery to keep your kitchen running smoothly."
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