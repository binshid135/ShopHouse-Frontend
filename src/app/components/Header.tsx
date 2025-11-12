// components/Header.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChefHat, User, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/cartContext';

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    role: string;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { cartCount } = useCart();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            setUser(data.user);
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="relative z-10 px-4 py-2 sm:px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-amber-900" />
                    ) : (
                        <Menu className="w-6 h-6 text-amber-900" />
                    )}
                </button>

                <Logo />
                
                {/* Desktop Navigation */}
                <DesktopNavigation />
                
                <HeaderActions 
                    user={user}
                    onLogout={handleLogout}
                    loading={loading}
                    cartCount={cartCount}
                />
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation 
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />
        </header>
    );
};

const Logo: React.FC = () => (
    <Link href="/" className="flex items-center">
        <div className="w-52 h-16 sm:w-60 sm:h-18 md:w-72 md:h-20 lg:w-80 lg:h-22 rounded-lg overflow-hidden">
            <img 
                src="/shophouselogo.png" 
                alt="Shop House Logo" 
                className="w-full h-full object-cover"
            />
        </div>
    </Link>
);

const DesktopNavigation: React.FC = () => {
    const currentPath = usePathname();

    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Our Products' },
        { href: '/about', label: 'About us' },
        { href: '/orders', label: 'Your Orders' },
    ];

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === path;
        }
        return currentPath?.startsWith(path);
    };

    return (
        <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 lg:px-4 lg:py-2 rounded-full transition-all ${
                        isActive(item.href)
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                            : 'text-amber-900 hover:text-orange-600 hover:bg-amber-50'
                    }`}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
};

interface MobileNavigationProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
    const currentPath = usePathname();

    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Our Products' },
        { href: '/about', label: 'About us' },
        { href: '/orders', label: 'Your Orders' },
    ];

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === path;
        }
        return currentPath?.startsWith(path);
    };

    if (!isOpen) return null;

    return (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-amber-200 shadow-lg z-50">
            <nav className="px-4 py-4 flex flex-col space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`px-4 py-3 rounded-lg transition-all text-base font-medium ${
                            isActive(item.href)
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                : 'text-amber-900 hover:text-orange-600 hover:bg-amber-50'
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

interface HeaderActionsProps {
    user: User | null;
    onLogout: () => void;
    loading: boolean;
    cartCount: number;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ 
    user, 
    onLogout,
    loading,
    cartCount
}) => (
    <div className="flex items-center gap-3 sm:gap-4">
        <CartButton cartCount={cartCount} />
        <UserMenu user={user} onLogout={onLogout} loading={loading} />
    </div>
);

interface CartButtonProps {
    cartCount: number;
}

const CartButton: React.FC<CartButtonProps> = ({ cartCount }) => (
    <button className="relative p-2 hover:bg-amber-50 rounded-full transition-colors">
        <Link href="/cart">
            <ShoppingCart className="w-6 h-6 text-amber-900" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                </span>
            )}
        </Link>
    </button>
);

interface UserMenuProps {
    user: User | null;
    onLogout: () => void;
    loading: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, loading }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    if (loading) {
        return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link
                    href="/login"
                    className="text-amber-900 hover:text-orange-600 transition-colors font-medium text-sm sm:text-base"
                >
                    Sign In
                </Link>
                <span className="text-amber-900 hidden sm:inline">|</span>
                <Link
                    href="/signup"
                    className="bg-orange-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full hover:bg-orange-600 transition-colors font-medium text-sm sm:text-base"
                >
                    Sign Up
                </Link>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-2 hover:bg-amber-50 rounded-full transition-colors"
            >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-amber-900 font-medium hidden sm:block">
                    {user.name}
                </span>
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-amber-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-amber-100">
                        <p className="text-sm font-medium text-amber-900">{user.name}</p>
                        <p className="text-xs text-amber-600 truncate">{user.email}</p>
                    </div>
                    <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                    >
                        Your Orders
                    </Link>
                    <button
                        onClick={() => {
                            onLogout();
                            setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default Header;