'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { DocketTable } from '@/components/docket-table';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f7f9fc]">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Welcome Section */}
          <section className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#002d62] mb-2">
              Welcome back, <span className="text-[#f7931d]">{user?.EmpName || 'User'}</span>!
            </h2>
            <p className="text-gray-600">Here's what's happening with your dockets today.</p>
          </section>

          {/* Docket Container */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            {/* Header with Buttons */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#002d62]">Docket List</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/docket/add')}
                  className="bg-gradient-to-r from-[#f7931d] to-[#e67e22] text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Add New Docket
                </button>
                <button
                  onClick={loadDockets}
                  className="bg-[#f7931d] text-white px-4 py-3 rounded-lg font-bold hover:bg-[#e67e00] transition flex items-center gap-2"
                >
                  <span>🔄</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block font-bold text-[#002d62] mb-2 text-sm">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#002d62] mb-2 text-sm">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d]"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#002d62] mb-2 text-sm">Search</label>
                <input
                  type="text"
                  placeholder="Search by Docket No, Consignor, Consignee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d]"
                />
              </div>
            </div>

            {/* Table */}
            <DocketTable 
              dockets={paginatedDockets}
              loading={loading}
            />

            {/* Pagination */}
            {filteredDockets.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 bg-white text-[#002d62] rounded hover:bg-[#f7931d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>

                <span className="text-gray-600 text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 bg-white text-[#002d62] rounded hover:bg-[#f7931d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 pb-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2024 VIN WORLD EXPRESS. All rights reserved.</p>
          <p>Location: {user?.LocationName || 'Unknown Location'}</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
