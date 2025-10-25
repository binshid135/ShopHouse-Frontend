import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, ChefHat, User, LogOut } from 'lucide-react';
import Link from 'next/link';

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
        <header className="relative z-10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Logo />
                <Navigation />
                <HeaderActions 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery}
                    user={user}
                    onLogout={handleLogout}
                    loading={loading}
                />
            </div>
        </header>
    );
};

const Logo: React.FC = () => (
    <Link href="/" className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
            Shop House
        </span>
    </Link>
);

const Navigation: React.FC = () => (
    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/" className="text-amber-900 hover:text-orange-600 transition-colors">
            Home
        </Link>
        <Link href="/products" className="text-amber-900 hover:text-orange-600 transition-colors">
            Our Products
        </Link>
        <Link href="/about" className="text-amber-900 hover:text-orange-600 transition-colors">
            About us
        </Link>
        <Link href="/orders" className="text-amber-900 hover:text-orange-600 transition-colors">
            Your Orders
        </Link>
    </nav>
);

interface HeaderActionsProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    user: User | null;
    onLogout: () => void;
    loading: boolean;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ 
    searchQuery, 
    setSearchQuery, 
    user, 
    onLogout,
    loading 
}) => (
    <div className="flex items-center gap-4">
        <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <CartButton />
        <UserMenu user={user} onLogout={onLogout} loading={loading} />
    </div>
);

interface SearchInputProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchQuery, setSearchQuery }) => (
    <div className="relative hidden lg:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white rounded-full border-2 border-transparent focus:border-orange-400 outline-none transition-all w-48"
        />
    </div>
);

const CartButton: React.FC = () => {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        fetchCartCount();
        
        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    const fetchCartCount = async () => {
        try {
            const response = await fetch('/api/userside/cart');
            if (response.ok) {
                const data = await response.json();
                setCartCount(data.items?.length || 0);
            }
        } catch (error) {
            console.error('Failed to fetch cart count:', error);
        }
    };

    return (
        <button className="relative p-2 hover:bg-white rounded-full transition-colors">
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
};

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
                    className="text-amber-900 hover:text-orange-600 transition-colors font-medium"
                >
                    Sign In
                </Link>
                <span className="text-amber-900">|</span>
                <Link
                    href="/signup"
                    className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium"
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
                className="flex items-center gap-2 p-2 hover:bg-white rounded-full transition-colors"
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