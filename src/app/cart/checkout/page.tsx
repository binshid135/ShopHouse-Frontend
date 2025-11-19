"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, User, Home, CreditCard, Truck, Store } from "lucide-react";
import FloatingElements from "@/app/components/FloatingElements";
import Header from "@/app/components/Header";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

interface Cart {
  cartId: string;
  items: CartItem[];
  total: number;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    area: "",
    street: "",
    building: "",
    flat: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Only allow delivery inside Al Ain
  const areasInAlAin = [
    "Asharij",
    "Abu Hiraybah",
    "Abu Samrah",
    "Ain Al Faydah",
    "Al 'Ajban",
    "Al 'Arad",
    "Al 'Iqabiyyah",
    "Al Aamerah",
    "Al Aflaj",
    "Al Ain International Airport",
    "Al Bateen",
    "Al Dahma",
    "Al Dhahir",
    "Al Dhahrah",
    "Al Faqa'",
    "Al Fou'ah",
    "Al Hiyar",
    "Al Jahili",
    "Al Jimi",
    "Al Khaznah",
    "Al Khibeesi",
    "Al Khirayr",
    "Al Maqam",
    "Al Markhaniyyah",
    "Al Mas'oudi",
    "Al Mu'tarid",
    "Al Mutaw'ah",
    "Al Muwaij'i",
    "Al Nabbagh",
    "Al Qattarah",
    "Al Qisees",
    "Al Qou'",
    "Al Rawdah",
    "Al Rawdah Al Sharqiyah",
    "Al Ruwaydat",
    "Al Sad",
    "Al Salamat",
    "Al Sarouj",
    "Al Shiwayb",
    "Al Shuwaymah",
    "Al Tiwayya",
    "Al Wiqan",
    "Bad' Bint Sa'oud",
    "Bu Kirayyah",
    "Central District",
    "Falaj Hazza'",
    "Ghireebah",
    "Ghnaymah",
    "Hili",
    "Industrial Area",
    "Industrial City",
    "Jabal Hafeet",
    "Khatm Al Shiklah",
    "Malaqit",
    "Masakin",
    "Mazyad",
    "Mbazzarah Al Khadra",
    "Nahil",
    "Ni'mah",
    "Niqa Al Dheeb",
    "Ramlat Sweihan",
    "Rimah",
    "Sa'",
    "Shi'bat Al Wutah",
    "Shiab Al Ashkhar",
    "Sweihan",
    "Um Al Zumoul",
    "Um Ghafah",
    "Zakhir",
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchCart();
    
    // Load delivery option from localStorage
    const savedOption = localStorage.getItem('deliveryOption') as 'delivery' | 'pickup';
    if (savedOption) {
      setDeliveryOption(savedOption);
    }
  }, []);

  // Update form data when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.name,
        mobile: userProfile.phone || ""
      }));
    }
  }, [userProfile]);

  // Calculate shipping when cart loads or delivery option changes
  useEffect(() => {
    if (cart) {
      // Use the same logic as cart page: free shipping over AED 100 for delivery, free for pickup
      const calculatedShipping = deliveryOption === 'pickup' ? 0 : (cart.total > 100 ? 0 : 7);
      // Shipping state is now calculated dynamically
    }
  }, [cart, deliveryOption]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        console.log("User profile loaded:", data.user);
      } else {
        console.log("No user profile found or user not logged in");
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/userside/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        console.log("Cart data:", data);
      } else {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeliveryOptionChange = (option: 'delivery' | 'pickup') => {
    setDeliveryOption(option);
    localStorage.setItem('deliveryOption', option);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    // Basic validation
    if (!formData.fullName || !formData.mobile) {
      setError("Please fill all required fields.");
      setSubmitting(false);
      return;
    }

    // UAE mobile validation
    const mobilePattern = /^(05\d{8}|5\d{8}|\+9715\d{8})$/;
    if (!mobilePattern.test(formData.mobile.replace(/\s/g, ''))) {
      setError("Enter a valid UAE mobile number (e.g., 0501234567 or 501234567).");
      setSubmitting(false);
      return;
    }

    // For delivery, validate address fields
    if (deliveryOption === 'delivery') {
      if (!formData.area || !formData.street || !formData.building) {
        setError("Please fill all required address fields for delivery.");
        setSubmitting(false);
        return;
      }
    }

    try {
      console.log('Submitting order with cart:', cart);
      
      const orderData = {
        customerName: formData.fullName,
        customerPhone: formData.mobile,
        deliveryOption: deliveryOption,
        ...(deliveryOption === 'delivery' && {
          shippingAddress: `${formData.street}, ${formData.building}${formData.flat ? `, Flat ${formData.flat}` : ''}, ${formData.area}, Al Ain`
        }),
        ...(deliveryOption === 'pickup' && {
          shippingAddress: 'Store Pickup - shop house general trading, Central District, Al Ain'
        })
      };

      const response = await fetch('/api/userside/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('Order response:', result);

      if (response.ok) {
        setSuccess(true);
        // Clear delivery option from localStorage after successful order
        localStorage.removeItem('deliveryOption');
        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${result.orderId}`);
        }, 2000);
      } else {
        setError(result.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError("Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals
  const subtotal = cart?.total || 0;
  const shipping = deliveryOption === 'pickup' ? 0 : (subtotal > 100 ? 0 : 7);
  // const tax = subtotal * 0.05;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        <FloatingElements />
        <Header searchQuery={""} setSearchQuery={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        <FloatingElements />
        <Header searchQuery={""} setSearchQuery={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-amber-800 mb-4">Your cart is empty</p>
            <button 
              onClick={() => router.push('/products')}
              className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-amber-900 hover:text-orange-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Checkout</h1>
            <p className="text-amber-700 mb-6">Complete your order with delivery information</p>

            {/* User Info Notice */}
            {/* {userProfile && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">Profile Information Loaded</h4>
                    <p className="text-sm text-green-700">
                      Your name and phone number have been pre-filled from your profile. You can edit them if needed.
                    </p>
                  </div>
                </div>
              </div>
            )} */}

            {/* Cash on Delivery Notice */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Cash on Delivery Only</h4>
                  <p className="text-sm text-amber-700">
                    We currently accept cash payments only. Please have the exact amount ready when our delivery partner arrives.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                    placeholder="Enter your full name"
                  />
                  {userProfile && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Pre-filled from your profile
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">
                    Mobile Number (UAE) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600" />
                    <input
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-amber-200 rounded-xl pl-10 pr-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                      placeholder="0501234567 or 501234567"
                    />
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-amber-600 mt-1">
                      Enter your UAE mobile number
                    </p>
                    {userProfile && userProfile.phone && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ From profile
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Method
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    deliveryOption === 'delivery' 
                      ? 'border-orange-500 bg-orange-50 shadow-md' 
                      : 'border-amber-200 hover:bg-amber-50'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="delivery"
                      checked={deliveryOption === 'delivery'}
                      onChange={() => handleDeliveryOptionChange('delivery')}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === 'delivery' 
                          ? 'border-orange-500 bg-orange-500' 
                          : 'border-amber-300'
                      }`}>
                        {deliveryOption === 'delivery' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <Truck className={`w-5 h-5 ${
                        deliveryOption === 'delivery' ? 'text-orange-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-amber-900">Home Delivery</span>
                      {/* <span className={`text-sm font-medium ${
                        shipping === 0 ? 'text-green-600' : 'text-amber-700'
                      }`}>
                        {shipping === 0 ? 'FREE' : `AED ${shipping.toFixed(2)}`}
                      </span> */}
                    </div>
                    <p className="text-xs text-amber-600">
                      Get your order delivered to your address in Al Ain
                    </p>
                    {subtotal < 100 && shipping > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Free delivery on orders above AED 100
                      </p>
                    )}
                  </label>

                  <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    deliveryOption === 'pickup' 
                      ? 'border-orange-500 bg-orange-50 shadow-md' 
                      : 'border-amber-200 hover:bg-amber-50'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="pickup"
                      checked={deliveryOption === 'pickup'}
                      onChange={() => handleDeliveryOptionChange('pickup')}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === 'pickup' 
                          ? 'border-orange-500 bg-orange-500' 
                          : 'border-amber-300'
                      }`}>
                        {deliveryOption === 'pickup' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <Store className={`w-5 h-5 ${
                        deliveryOption === 'pickup' ? 'text-orange-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-amber-900">Store Pickup</span>
                      <span className="text-green-600 text-sm font-medium">FREE</span>
                    </div>
                    <p className="text-xs text-amber-600">
                      Collect your order from our store
                    </p>
                    <p className="text-xs text-amber-500 mt-1">
                      Store Address: Shop House general trading, Al Ain
                    </p>
                  </label>
                </div>

                {/* Store Pickup Information */}
                {deliveryOption === 'pickup' && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Store className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm">Store Pickup Information</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          <strong>Address:</strong> Kitchen Tools Store, Central District, Al Ain, UAE
                        </p>
                        <p className="text-xs text-blue-700">
                          <strong>Phone:</strong> +971 50 719 1804
                        </p>
                        <p className="text-xs text-blue-700">
                          <strong>Hours:</strong> 8:00 AM - 12:00 AM (Daily)
                        </p>
                        
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Address - Only show for delivery option */}
              {deliveryOption === 'delivery' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address (Al Ain Only)
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">
                      Area in Al Ain <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required={deliveryOption === 'delivery'}
                      className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                    >
                      <option value="">Select Area</option>
                      {areasInAlAin.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">
                      Street Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required={deliveryOption === 'delivery'}
                      className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                      placeholder="Enter street name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">
                        Building / Villa <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600" />
                        <input
                          name="building"
                          value={formData.building}
                          onChange={handleChange}
                          required={deliveryOption === 'delivery'}
                          className="w-full border-2 border-amber-200 rounded-xl pl-10 pr-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                          placeholder="Building name or number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">
                        Flat / Unit (optional)
                      </label>
                      <input
                        name="flat"
                        value={formData.flat}
                        onChange={handleChange}
                        className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-orange-400 outline-none transition-all bg-amber-50"
                        placeholder="Flat or unit number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl">
                  Checkout successful! Redirecting...
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? 'Processing...' : `Place Order - AED ${total.toFixed(2)}`}
              </button>

              {/* Payment Method Reminder */}
              <div className="text-center">
                <p className="text-sm text-amber-600">
                  💰 Payment method: <span className="font-semibold">Cash on Delivery</span>
                </p>
                <p className="text-xs text-amber-500 mt-1">
                  {deliveryOption === 'pickup' 
                    ? 'Pay when you collect your order from the store.'
                    : 'No online payment required. Pay when you receive your order.'
                  }
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-6">
              <h3 className="text-xl font-bold text-amber-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-amber-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl">🍴</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 text-sm">{item.name}</h4>
                      <p className="text-amber-700 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-amber-900">
                      AED {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-amber-800">
                  <span>Subtotal</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-amber-800">
                  <span>
                    {deliveryOption === 'pickup' ? 'Store Pickup' : 'Delivery'}
                  </span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `AED ${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                {/* <div className="flex justify-between text-amber-800">
                  <span>Tax (5%)</span>
                  <span>AED {tax.toFixed(2)}</span>
                </div> */}
                
                <div className="border-t border-amber-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-amber-900">
                    <span>Total</span>
                    <span>AED {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Notice */}
              {deliveryOption === 'delivery' && shipping > 0 && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 text-center">
                    Add AED {(100 - subtotal).toFixed(2)} more for FREE delivery!
                  </p>
                </div>
              )}

              {/* Pickup Notice */}
              {deliveryOption === 'pickup' && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 text-center">
                    🎉 Free store pickup selected
                  </p>
                </div>
              )}

              {/* Payment Summary */}
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-800">Payment Method:</span>
                  <span className="text-sm font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                    Cash on Delivery
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-800">Delivery Method:</span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    deliveryOption === 'pickup' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {deliveryOption === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                  </span>
                </div>
                <p className="text-xs text-amber-600 mt-2 text-center">
                  {deliveryOption === 'pickup' 
                    ? 'Pay this amount when collecting your order'
                    : 'Pay this amount when your order arrives'
                  }
                </p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h4 className="font-bold text-amber-900 mb-4">Delivery Information</h4>
              <div className="space-y-3 text-sm text-amber-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <span className="font-semibold">Home Delivery</span>
                    <p className="text-xs text-amber-600">
                      AED 7 delivery charge for orders under AED 100 • Free delivery above AED 100
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Store className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold">Store Pickup</span>
                    <p className="text-xs text-amber-600">
                      Always free • Collect from our store in Al Ain
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">💰</span>
                  </div>
                  <div>
                    <span className="font-semibold">Cash on Delivery</span>
                    <p className="text-xs text-amber-600">No online payment required</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h4 className="font-bold text-amber-900 mb-3">Secure Shopping</h4>
              <div className="space-y-2 text-xs text-amber-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">🔒</span>
                  </div>
                  Your order is protected
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">🛡️</span>
                  </div>
                  Privacy protected
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  Quality guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}