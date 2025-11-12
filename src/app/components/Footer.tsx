// components/Footer.tsx
import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CreditCard,
  Shield,
  Truck,
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-amber-900 to-orange-900 text-white">
      {/* Main Footer */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Shop House</h3>
              <p className="text-amber-100 mb-6 leading-relaxed">
                Your trusted partner for professional kitchen equipment.
                We provide chefs and culinary professionals with premium tools
                to create exceptional dining experiences.
              </p>
              <div className="flex space-x-4">
                <SocialIcon href="https://www.facebook.com/share/17iRxbWbFQ/" icon={<Facebook className="w-5 h-5" />} />
                {/* <SocialIcon href="#" icon={<Twitter className="w-5 h-5" />} /> */}
                <SocialIcon href="https://www.instagram.com/shophousealain?igsh=MWk0dzAxYzdveWRxMA==" icon={<Instagram className="w-5 h-5" />} />
                {/* <SocialIcon href="#" icon={<Youtube className="w-5 h-5" />} /> */}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <FooterLink href="/products" text="All Products" />
                <FooterLink href="/about" text="About Us" />
                {/* <FooterLink href="/contact" text="Contact" />
                <FooterLink href="/blog" text="Blog" />
                <FooterLink href="/faq" text="FAQ" />
                <FooterLink href="/support" text="Support" /> */}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <ContactItem
                  icon={<Phone className="w-4 h-4" />}
                  text="03 722 4922 | 050 719 1804"
                />
                <ContactItem
                  icon={<Mail className="w-4 h-4" />}
                  text="shophouse@gmail.com"
                />
                <ContactItem
                  icon={<MapPin className="w-4 h-4" />}
                  text="ALAIN TOWN CENTER, NEAR LUCKY PLAZA"
                />
              </ul>
            </div>
          </div>

          {/* Features */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-amber-700">
            <FeatureItem 
              icon={<Shield className="w-8 h-8" />}
              title="Quality Guarantee"
              description="2-year warranty on all products"
            />
            <FeatureItem 
              icon={<Truck className="w-8 h-8" />}
              title="Fast Delivery"
              description="Free shipping on orders over $100"
            />
            <FeatureItem 
              icon={<CreditCard className="w-8 h-8" />}
              title="Secure Payment"
              description="100% secure payment processing"
            />
          </div> */}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-amber-950 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-amber-200 text-sm mb-4 md:mb-0">
              © 2024 Shop House. All rights reserved.
            </div>
            {/* <div className="flex space-x-6 text-sm">
              <FooterLink href="/privacy" text="Privacy Policy" />
              <FooterLink href="/terms" text="Terms of Service" />
              <FooterLink href="/cookies" text="Cookie Policy" />
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, icon }) => (
  <a
    href={href}
    className="w-10 h-10 bg-amber-700 hover:bg-amber-600 rounded-full flex items-center justify-center transition-colors duration-300"
  >
    {icon}
  </a>
);

interface FooterLinkProps {
  href: string;
  text: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, text }) => (
  <li>
    <a
      href={href}
      className="text-amber-200 hover:text-white transition-colors duration-300"
    >
      {text}
    </a>
  </li>
);

interface ContactItemProps {
  icon: React.ReactNode;
  text: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, text }) => (
  <li className="flex items-center space-x-3">
    <div className="text-amber-300">
      {icon}
    </div>
    <span className="text-amber-200">{text}</span>
  </li>
);

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <div className="flex items-center space-x-4">
    <div className="text-amber-300">
      {icon}
    </div>
    <div>
      <h5 className="font-semibold text-white">{title}</h5>
      <p className="text-sm text-amber-200">{description}</p>
    </div>
  </div>
);

export default Footer;