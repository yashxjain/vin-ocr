'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }

    // Load remembered username
    const remembered = localStorage.getItem('vinworld_remembered_username');
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Please enter your Employee ID');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://namami-infotech.com/vinworld/src/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (rememberMe) {
          localStorage.setItem('vinworld_remembered_username', username);
        } else {
          localStorage.removeItem('vinworld_remembered_username');
        }

        login(data.data, data.token || '', rememberMe);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError(data.message || 'Login failed. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f9fc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#f3f3f3] border-t-[#f7931d] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7f9fc] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <img 
            src="https://vinworldexpress.com/assets/img/resource/logo-4.png" 
            alt="VIN WORLD Logo" 
            className="h-16 mx-auto mb-3"
          />
          <h1 className="text-3xl font-bold text-[#f7931d] mb-1">VIN WORLD EXPRESS</h1>
          <p className="text-sm text-[#002d62]">Log in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-5 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-center text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block font-bold mb-2 text-[#002d62]">
              Employee ID
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your employee ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100 transition"
              autoComplete="username"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block font-bold mb-2 text-[#002d62]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100 transition"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-3 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4"
              />
              <span className="text-[#002d62]">Remember me</span>
            </label>
            <a href="#" className="text-[#f7931d] font-bold hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#f7931d] text-white font-bold rounded-lg hover:bg-[#e67e00] transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
