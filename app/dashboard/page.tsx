'use client';

import React from "react"
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { DocketTable } from '@/components/docket-table';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Menu,
  X,
  Download,
  Bell,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface Docket {
  DocketNo: string;
  ConsignorName: string;
  ConsigneeName: string;
  ShipDate: string;
  Origin: string;
  Destination: string;
  ShipmentType: string;
  NoOfShipment: number;
  Status: string;
  DocketId?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dockets, setDockets] = useState<Docket[]>([]);
  const [filteredDockets, setFilteredDockets] = useState<Docket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadDockets();
  }, [user]);

  const loadDockets = async () => {
    try {
      setLoading(true);
      const locationId = user?.LocationId || 1;
      const response = await fetch(
        `https://namami-infotech.com/vinworld/src/docket/get_docket.php?locationId=${locationId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setDockets(data.data || []);
        setFilteredDockets(data.data || []);
      } else {
        console.error('Failed to load dockets:', data.message);
      }
    } catch (error) {
      console.error('Error loading dockets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...dockets];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.Status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(d => {
            const dDate = new Date(d.ShipDate);
            return dDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          filterDate.setDate(today.getDate() - today.getDay());
          filtered = filtered.filter(d => new Date(d.ShipDate) >= filterDate);
          break;
        case 'month':
          filterDate.setDate(1);
          filtered = filtered.filter(d => new Date(d.ShipDate) >= filterDate);
          break;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.DocketNo.toLowerCase().includes(query) ||
        d.ConsignorName.toLowerCase().includes(query) ||
        d.ConsigneeName.toLowerCase().includes(query)
      );
    }

    setFilteredDockets(filtered);
    setCurrentPage(1);
  }, [dockets, statusFilter, dateFilter, searchQuery]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDockets = filteredDockets.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredDockets.length / itemsPerPage);

  // Quick Stats
  const stats = {
    total: dockets.length,
    active: dockets.filter(d => d.Status?.toLowerCase() === 'active').length,
    pending: dockets.filter(d => d.Status?.toLowerCase() === 'pending').length,
    completed: dockets.filter(d => d.Status?.toLowerCase() === 'completed').length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f7f9fc]">
        <DashboardHeader />

        <main className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#002d62] mb-2">
                  Welcome back, <span className="text-[#f7931d]">{user?.EmpName || 'User'}</span>!
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  title="Home"
                >
                  <Home className="w-5 h-5 text-[#002d62]" />
                </button>
                <button
                  onClick={loadDockets}
                  disabled={loading}
                  className="p-3 bg-[#f7931d]/10 text-[#f7931d] rounded-lg hover:bg-[#f7931d]/20 transition disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-[#002d62]/5 border border-[#002d62]/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#002d62]">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Dockets</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#002d62]">Docket Management</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredDockets.length} of {dockets.length} dockets
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="md:hidden px-4 py-3 bg-white border border-gray-300 text-[#002d62] rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                
                <button
                  onClick={() => router.push('/docket/add')}
                  className="px-6 py-3 bg-gradient-to-r from-[#f7931d] to-[#e67e22] text-white rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Docket</span>
                </button>
              </div>
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
              <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
                <div className="bg-white w-full h-[80vh] rounded-t-2xl p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#002d62]">Filters</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block font-semibold text-[#002d62] mb-3">Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['all', 'active', 'pending', 'completed', 'cancelled'].map(status => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status);
                              setShowMobileFilters(false);
                            }}
                            className={`py-3 rounded-lg text-sm font-medium ${
                              statusFilter === status
                                ? 'bg-[#002d62] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#002d62] mb-3">Date Range</label>
                      <div className="space-y-2">
                        {['today', 'week', 'month', 'all'].map(date => (
                          <button
                            key={date}
                            onClick={() => {
                              setDateFilter(date);
                              setShowMobileFilters(false);
                            }}
                            className={`w-full py-3 rounded-lg text-sm font-medium text-left px-4 ${
                              dateFilter === date
                                ? 'bg-[#f7931d] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {date.charAt(0).toUpperCase() + date.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#002d62] mb-3">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search dockets..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d]"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setDateFilter('all');
                        setSearchQuery('');
                        setShowMobileFilters(false);
                      }}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Filters */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block font-semibold text-[#002d62] mb-2 text-sm">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100 text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#002d62] mb-2 text-sm">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100 text-gray-900"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block font-semibold text-[#002d62] mb-2 text-sm">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Docket No, Consignor, Consignee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dockets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d]"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(statusFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="text-sm text-gray-600">Active filters:</div>
                {statusFilter !== 'all' && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('all')} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {dateFilter !== 'all' && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    Date: {dateFilter}
                    <button onClick={() => setDateFilter('all')} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Table */}
            <DocketTable 
              dockets={paginatedDockets}
              loading={loading}
            />

            {/* Pagination */}
            {filteredDockets.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredDockets.length)} of {filteredDockets.length} dockets
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 bg-white text-[#002d62] rounded-lg hover:bg-[#f7931d] hover:text-white hover:border-[#f7931d] disabled:opacity-50 disabled:cursor-not-allowed transition"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium ${
                            currentPage === pageNum
                              ? 'bg-[#002d62] text-white'
                              : 'bg-white text-[#002d62] hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 bg-white text-[#002d62] rounded-lg hover:bg-[#f7931d] hover:text-white hover:border-[#f7931d] disabled:opacity-50 disabled:cursor-not-allowed transition"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredDockets.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No dockets found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? "Try adjusting your filters or search query"
                    : "Get started by creating your first docket"}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  className="px-6 py-3 bg-[#002d62] text-white rounded-lg font-semibold hover:bg-[#00448c] transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 pt-6 pb-8 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600">
                  © 2024 VIN WORLD EXPRESS. All rights reserved.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Location: {user?.LocationName || 'Unknown Location'}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500">
                  Logged in as: <span className="font-semibold">{user?.EmpName}</span>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}