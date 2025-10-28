// contexts/CartContext.tsx - Update to handle auth changes
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface CartContextType {
    cart: Cart | null;
    cartCount: number;
    loading: boolean;
    refreshCart: () => void;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateCartItem: (itemId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const response = await fetch('/api/userside/cart', {
                credentials: 'include' // Important for cookies
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity: number = 1) => {
        try {
            const response = await fetch('/api/userside/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productId, quantity }),
            });

            if (response.ok) {
                await fetchCart(); // Refresh cart
            } else {
                console.error('Failed to add to cart');
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const updateCartItem = async (itemId: string, quantity: number) => {
        try {
            const response = await fetch('/api/userside/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ itemId, quantity }),
            });

            if (response.ok) {
                await fetchCart(); // Refresh cart
            }
        } catch (error) {
            console.error('Failed to update cart:', error);
        }
    };

    const removeFromCart = async (itemId: string) => {
        try {
            const response = await fetch(`/api/userside/cart?itemId=${itemId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                await fetchCart(); // Refresh cart
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Refresh cart when authentication state might change
    useEffect(() => {
        const handleFocus = () => {
            fetchCart(); // Refresh cart when window gains focus
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ 
            cart, 
            cartCount, 
            loading, 
            refreshCart: fetchCart,
            addToCart,
            updateCartItem,
            removeFromCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};