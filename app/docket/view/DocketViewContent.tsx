// app/docket/view/DocketViewContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Copy ALL your interfaces from the current file
interface Shipment {
  Id: number;
  Length: string;
  Width: string;
  Height: string;
  ActualWeight: string;
  NoOfBox: number;
  EntryDateTime: string;
}

interface ApiDocketData {
  Id: number;
  DocketNo: string;
  ConsignorName: string;
  ConsignorAddress: string;
  ConsignorDistrict: string;
  ConsignorState: string;
  ConsignorPinCode: string;
  ConsignorMobile: string;
  ConsigneeName: string;
  ConsigneeAddress: string;
  ConsigneeDistrict: string;
  ConsigneeState: string;
  ConsigneePinCode: string;
  ConsigneeMobile: string;
  ShipDate: string;
  Origin: string;
  Destination: string;
  ModeOfTransport: string;
  InvoiceRequired: string;
  InvoiceNumber: string;
  InvoiceValue: string;
  Declaration: string | null;
  ShipmentType: string;
  PickupDate: string;
  PickupEmployee: string;
  EwayBillNo: string;
  LocationId: number;
  CreatedAt: string;
  shipments?: Shipment[];
  ShipmentCount: number;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: ApiDocketData[];
}

const DocketViewContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docketNo = searchParams.get('docketNo');
  const [docket, setDocket] = useState<ApiDocketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (docketNo) {
      fetchDocketData(docketNo);
    }
  }, [docketNo]);

  const fetchDocketData = async (docketNumber: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://namami-infotech.com/vinworld/src/docket/get_docket.php?locationId=1&search=${docketNumber}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch docket data');
      }
      
      const result: ApiResponse = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setDocket(result.data[0]);
        console.log('Fetched docket data:', result.data[0]);
      } else {
        throw new Error('No docket data found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load docket');
      console.error('Error fetching docket:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper function to get display value
  const getDisplayValue = (value: string | null | undefined) => {
    return value && value.trim() !== '' ? value : '________________';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002d62]"></div>
      </div>
    );
  }

  if (error || !docket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-xl font-semibold mb-2">Error Loading Docket</h3>
          <p className="text-gray-600 mb-4">{error || 'Docket not found'}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#002d62] text-white px-6 py-2 rounded hover:bg-[#001f47] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalWeight = docket.shipments?.reduce((sum, shipment) => {
    return sum + (parseFloat(shipment.ActualWeight) || 0) * (shipment.NoOfBox || 1);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 print:bg-white print:p-0">
          <div className="max-w-6xl mx-auto">
            {/* Header with Back Button */}
            <div className="mb-6 flex items-center justify-between print:hidden">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#002d62] hover:text-[#f7931d] transition"
              >
                <ArrowLeft size={20} />
                Back to Dockets
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="bg-[#002d62] text-white px-4 py-2 rounded text-sm hover:bg-[#001f47] transition"
                >
                  Print Docket
                </button>
                <button
                  onClick={() => fetchDocketData(docket.DocketNo)}
                  className="bg-[#f7931d] text-white px-4 py-2 rounded text-sm hover:bg-[#e67e00] transition"
                >
                  Refresh
                </button>
              </div>
            </div>
    
            {/* Docket Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg border print:shadow-none print:border-0">
              {/* Company Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#002d62]">VIN WORLD EXPRESS PVT. LTD.</h1>
                <h2 className="text-lg text-gray-600 mt-1">DOMESTIC & INTERNATIONAL CARGO SERVICES</h2>
                <p className="text-gray-700 mt-2">
                  K-2/5, Defence Enclave, Mahipalpur, New Delhi - 110037
                </p>
                <p className="text-gray-700">
                  Tel.: 011-4471-2929, Mob.: 8800-82-8700, 9717-19-8600
                </p>
              </div>
    
              <div className="border-t-2 border-b-2 border-[#002d62] py-4 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        DOCKET NO.
                      </label>
                      <div className="border-b border-gray-300 pb-1 font-mono text-lg">
                        {docket.DocketNo}
                      </div>
                    </div>
                    
                    
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        GSTIN
                      </label>
                      <div className="border-b border-gray-300 pb-1 font-mono">
                        07AAFVC5603G1ZF
                      </div>
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Origin and Destination */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Origin:</h3>
                  <div className="border border-gray-300 p-4 rounded h-32">
                    <p className="font-semibold">{docket.Origin}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Destination:</h3>
                  <div className="border border-gray-300 p-4 rounded h-32">
                    <p className="font-semibold">{docket.Destination}</p>
                  </div>
                </div>
              </div>
    
              {/* Consignor Details */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Consignor Details:</h3>
                <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Name:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      {docket.ConsignorName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Mobile:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      {docket.ConsignorMobile}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Address:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      {docket.ConsignorAddress}, {docket.ConsignorDistrict}, {docket.ConsignorState} - {docket.ConsignorPinCode}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      State:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      {docket.ConsignorState}
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Consignee Details */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Consignee Details:</h3>
                <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Name:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      {docket.ConsigneeName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Mobile:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      {docket.ConsigneeMobile}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Address:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      {docket.ConsigneeAddress}, {docket.ConsigneeDistrict}, {docket.ConsigneeState} - {docket.ConsigneePinCode}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      State:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      {docket.ConsigneeState}
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Mode of Transportation */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Mode of Transportation:</h3>
                <div className="flex gap-6">
                  {['Air', 'Road', 'Train'].map((mode) => (
                    <label key={mode} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={docket.ModeOfTransport.toLowerCase() === mode.toLowerCase()}
                        readOnly
                        className="mr-2 h-5 w-5"
                      />
                      <span className="font-semibold">{mode.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
    
              {/* Type */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Type:</h3>
                <div className="flex gap-6">
                  {['DOX', 'NON-DOX'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={docket.ShipmentType.toUpperCase() === type.replace('-', '')}
                        readOnly
                        className="mr-2 h-5 w-5"
                      />
                      <span className="font-semibold">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
    
              {/* Pickup Details */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Pickup Date:
                  </label>
                  <div className="border-b border-gray-300 pb-1">
                    {new Date(docket.PickupDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Pickup Employee:
                  </label>
                  <div className="border-b border-gray-300 pb-1">
                    {docket.PickupEmployee}
                  </div>
                </div>
              </div>
    
              {/* Transportation Charges Table */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      E-WAY BILL NO.:
                    </label>
                    <div className="border-b border-gray-300 pb-1 font-mono">
                      {getDisplayValue(docket.EwayBillNo)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Invoice Value:
                    </label>
                    <div className="border-b border-gray-300 pb-1 font-mono">
                      ₹{parseFloat(docket.InvoiceValue).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
    
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left text-sm font-bold">PIECES</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-bold">DESCRIPTION</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-bold">ACTUAL WT.</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-bold">Ch. Wt.</th>
                        
                        <th className="border border-gray-300 p-2 text-left text-sm font-bold">Length</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-bold">Width</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-bold">Height</th>
                       
                      </tr>
                    </thead>
                    <tbody>
                      {docket.shipments?.length ? (
        docket.shipments.map((shipment, index) => (
          <tr key={shipment.Id || index}>
                          <td className="border border-gray-300 p-2 text-center">{shipment.NoOfBox}</td>
                          <td className="border border-gray-300 p-2">Shipment Item</td>
                          <td className="border border-gray-300 p-2 text-right">{shipment.ActualWeight} kg</td>
                          <td className="border border-gray-300 p-2 text-right">
                            {(parseFloat(shipment.ActualWeight) * shipment.NoOfBox).toFixed(2)} kg
                          </td>
                         <td className="border border-gray-300 p-2 text-right">{shipment.Length} cm</td>
                          <td className="border border-gray-300 p-2 text-right">{shipment.Width} cm</td>
                          <td className="border border-gray-300 p-2 text-right">{shipment.Height} cm</td>
                         
                        </tr>
        ))
    ): (
        <tr>
          <td colSpan={13} className="border border-gray-300 p-4 text-center">
            No shipment items found
          </td>
        </tr>
      )}
                    </tbody>
                  </table>
                </div>
              </div>
    
              {/* Dimensions and Payment Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Dimensions (cm):
      </label>
      {docket.shipments?.length ? (
        docket.shipments.map((shipment, index) => (
          <div key={shipment.Id || index} className="border border-gray-300 p-3 rounded text-center mb-2">
            <div className="text-lg font-mono">
              {shipment.Length}×{shipment.Width}×{shipment.Height}cm
            </div>
          </div>
        ))
      ) : (
        <div className="border border-gray-300 p-3 rounded text-center">
          <div className="text-lg font-mono">No dimensions available</div>
        </div>
      )}
    </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Mode of Payment:</h3>
                  <div className="flex flex-wrap gap-4">
                    {(['CASH', 'ONLINE', 'CHEQUE', 'CREDIT'] as const).map((mode) => (
                      <label key={mode} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={false}
                          readOnly
                          className="mr-2 h-5 w-5"
                        />
                        <span className="font-semibold">{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
    
              {/* Total Weight and Receiver */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    TOTAL WEIGHT:
                  </label>
                  <div className="border-b border-gray-300 pb-1 font-bold text-lg">
                    {totalWeight.toFixed(2)} kg
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    R/T Receiver Name:
                  </label>
                  <div className="border-b border-gray-300 pb-1">
                    {docket.ConsigneeName}
                  </div>
                </div>
              </div>
    
              {/* Bank Details */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">BANK DETAILS:</h3>
                <div className="grid grid-cols-3 gap-4 border border-gray-300 p-4 rounded">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Bank Name:
                    </label>
                    <div className="border-b border-gray-300 pb-1">
                      ________________
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Account No.:
                    </label>
                    <div className="border-b border-gray-300 pb-1 font-mono">
                      ________________
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      IFSC Code:
                    </label>
                    <div className="border-b border-gray-300 pb-1 font-mono">
                      ________________
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Declaration */}
              <div className="border-t-2 border-[#002d62] pt-6 mt-8">
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    We hereby agree to the terms & conditions printed at the backside of this 
                    agreement of carriage and to the Charged Services Charges.
                  </p>
                  <p>
                    I/We declare that information provided by me/us for the preparation of this 
                    agreement of this carriage is true and correct. Actual sizes of volumetric 
                    packages are mentioned overleaf.
                  </p>
                </div>
                
                <div className="mt-6 text-center text-lg font-bold text-red-600">
                  NON NEGOTIABLE AT OWNER'S RISK
                </div>
              </div>
            </div>
          </div>
          </div>
  );
};

export default DocketViewContent;