'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export const DashboardHeader: React.FC = () => {
  const { user, logout, getUserInitials } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-[#002d62] text-white px-8 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <img 
          src="https://vinworldexpress.com/assets/img/resource/logo-4.png" 
          alt="VIN WORLD Logo"
          className="h-10"
        />
        <h1 className="text-2xl font-bold text-[#f7931d]">VIN WORLD EXPRESS DASHBOARD</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#f7931d] flex items-center justify-center font-bold text-sm">
          {getUserInitials()}
        </div>
        <div>
          <h3 className="font-semibold text-base">{user?.EmpName || user?.EmpCode}</h3>
          <p className="text-xs opacity-75">{user?.RoleName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-[#f7931d] text-white px-5 py-2 rounded font-bold hover:bg-[#e67e00] transition text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
