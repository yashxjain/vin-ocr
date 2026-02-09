'use client';

import { useRouter } from 'next/navigation';
import React from "react"

import { useState } from 'react';

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

interface DocketTableProps {
  dockets: Docket[];
  loading: boolean;
  onViewDocket?: (docket: Docket) => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-700';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const DocketTable: React.FC<DocketTableProps> = ({ dockets, loading, onViewDocket }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
const router = useRouter();
  const toggleRow = (docketNo: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(docketNo)) {
      newExpanded.delete(docketNo);
    } else {
      newExpanded.add(docketNo);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewDocket = (docket: Docket) => {
    // Navigate to the docket view page with the docket number
    router.push(`/docket/view?docketNo=${docket.DocketNo}`);
  };
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 border-4 border-[#f3f3f3] border-t-[#f7931d] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dockets...</p>
      </div>
    );
  }

  if (dockets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-semibold mb-2">No Dockets Found</h3>
        <p className="text-gray-600">No dockets are available for your location.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#002d62] text-white">
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Docket No</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Consignor</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Consignee</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Ship Date</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Origin</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Destination</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Shipment Type</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Shipments</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Status</th>
            <th className="px-4 py-3 text-left text-sm font-bold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dockets.map((docket) => (
            <tr 
              key={docket.DocketNo}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3 font-bold text-[#002d62]">{docket.DocketNo}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{docket.ConsignorName}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{docket.ConsigneeName}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {new Date(docket.ShipDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{docket.Origin}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{docket.Destination}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{docket.ShipmentType}</td>
              <td className="px-4 py-3 text-sm text-gray-700 text-center">{docket.NoOfShipment}</td>
              <td className="px-4 py-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(docket.Status)}`}>
                  {docket.Status}
                </span>
              </td>
              <td className="px-4 py-3">
               <button
      onClick={() => handleViewDocket(docket)}
      className="bg-[#f7931d] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#e67e00] transition"
    >
      View
    </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
