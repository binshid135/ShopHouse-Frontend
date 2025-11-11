// components/admin/Sidebar.tsx
'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Products', path: '/admin/Products' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' },
    // { name: 'Coupons', path: '/admin/coupons' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`block px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
            }`}
          >
            {item.name}
          </a>
        ))}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-6">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}