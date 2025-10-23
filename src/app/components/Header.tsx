// components/Header.tsx
import React from 'react';
import { ShoppingCart, Search, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/cartContext';

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
    return (
        <header className="relative z-10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Logo />
                <Navigation />
                <HeaderActions searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
        </header>
    );
};

const Logo: React.FC = () => (
    <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
            Shop House
        </span>
    </div>
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
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ searchQuery, setSearchQuery }) => (
    <div className="flex items-center gap-4">
        <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <CartButton />
    </div>
);

const SearchInput: React.FC<HeaderActionsProps> = ({ searchQuery, setSearchQuery }) => (
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
    const { cartCount } = useCart();

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

export default Header;