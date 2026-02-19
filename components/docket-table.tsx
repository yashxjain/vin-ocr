'use client';

import { useRouter } from 'next/navigation';
import React from "react"
import { useState } from 'react';
import { Eye, Image, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface Docket {
  DocketNo: string;
  ConsignorName: string;
  ConsigneeName: string;
  ConsigneeAddress: string;
  ShipDate: string;
  Origin: string;
  Destination: string;
  ShipmentType: string;
  NoOfShipment: number;
  Status: string;
  DocketId?: number;
  image_url?: string | null;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const handleImageClick = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
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
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#002d62] text-white">
              <th className="px-4 py-3 text-left text-sm font-bold uppercase">Docket No</th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase">Consignor</th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase">Consignee</th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase">Consignee Address</th>
              {/* <th className="px-4 py-3 text-left text-sm font-bold uppercase">Address Image</th> */}
              <th className="px-4 py-3 text-left text-sm font-bold uppercase">Ship Date</th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase">Origin</th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase">Destination</th>
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
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                  <div className="flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2"
                      style={{cursor:"pointer"}}
                      onClick={(e) => handleImageClick(docket.image_url!, e)}
                    >{docket.ConsigneeAddress || 'N/A'}</span>
                  </div>
                </td>
                {/* <td className="px-4 py-3">
                  {docket.image_url ? (
                    <button
                      onClick={(e) => handleImageClick(docket.image_url!, e)}
                      className="flex items-center gap-1 text-[#f7931d] hover:text-[#e67e00] transition"
                    >
                      <Image className="w-4 h-4" />
                      <span className="text-xs">View</span>
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </td> */}
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(docket.ShipDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{docket.Origin}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{docket.Destination}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleViewDocket(docket)}
                    className="bg-[#f7931d] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#e67e00] transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={selectedImage} 
              alt="Consignee Address" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};