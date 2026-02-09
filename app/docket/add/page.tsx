'use client';

import React from "react"

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState,useEffect } from 'react';
import Tesseract from 'tesseract.js';
interface FormData {
  consignorName: string;
  consignorMobile: string;
  consignorAddress: string;
  consignorDistrict: string;
  consignorState: string;
  consignorPincode: string;
  consigneeName: string;
  consigneeMobile: string;
  consigneeAddress: string;
  consigneeDistrict: string;
  consigneeState: string;
  consigneePincode: string;
  shipDate: string;
  origin: string;
  destination: string;
  modeOfTransport: string;
  invoiceRequired: string;
  invoiceNumber: string;
  invoiceValue: string;
  shipmentType: string;
  pickupDate: string;
  pickupEmployee: string;
  ewayBillNo: string;
}

export default function AddDocketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    consignorName: '',
    consignorMobile: '',
    consignorAddress: '',
    consignorDistrict: '',
    consignorState: '',
    consignorPincode: '',
    consigneeName: '',
    consigneeMobile: '',
    consigneeAddress: '',
    consigneeDistrict: '',
    consigneeState: '',
    consigneePincode: '',
    shipDate: '',
    origin: '',
    destination: '',
    modeOfTransport: '',
    invoiceRequired: 'No',
    invoiceNumber: '',
    invoiceValue: '',
    shipmentType: '',
    pickupDate: '',
    pickupEmployee: '',
    ewayBillNo: '',
  });

  const [showInvoiceFields, setShowInvoiceFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shipments, setShipments] = useState<any[]>([]);
  const [ocrText, setOcrText] = useState('');
const [ocrLoading, setOcrLoading] = useState(false);

  const [shipmentForm, setShipmentForm] = useState({
    description: '',
    weight: '',
    dimensions: '',
    quantity: '',
  });
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'invoiceRequired' && value === 'Yes') {
      setShowInvoiceFields(true);
    } else if (name === 'invoiceRequired' && value === 'No') {
      setShowInvoiceFields(false);
    }
  };

  const addShipment = () => {
    if (shipmentForm.description && shipmentForm.weight && shipmentForm.quantity) {
      setShipments([...shipments, { ...shipmentForm, id: Date.now() }]);
      setShipmentForm({ description: '', weight: '', dimensions: '', quantity: '' });
    }
  };

  const removeShipment = (id: number) => {
    setShipments(shipments.filter(s => s.id !== id));
  };

  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setOcrLoading(true);
  setOcrText('');

  try {
    const { data: { text } } = await Tesseract.recognize(file, "eng", {
      logger: m => console.log(m),
    });

    setOcrText(text);
    parseAndFillAddress(text);
  } catch (err) {
    setOcrText("❌ Failed to read text");
  } finally {
    setOcrLoading(false);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    const required = [
      'consignorName', 'consignorMobile', 'consignorAddress',
      'consigneeName', 'consigneeMobile', 'consigneeAddress',
      'shipDate', 'origin', 'destination', 'modeOfTransport',
      'shipmentType', 'pickupDate', 'pickupEmployee'
    ];

    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        setError(`${field.replace(/([A-Z])/g, ' $1')} is required`);
        return;
      }
    }

    if (shipments.length === 0) {
      setError('Please add at least one shipment');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        shipments,
        locationId: user?.LocationId,
        createdBy: user?.EmpCode,
      };

      const response = await fetch('https://namami-infotech.com/vinworld/src/docket/add_docket.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Docket created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Failed to create docket');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      consignorName: '',
      consignorMobile: '',
      consignorAddress: '',
      consignorDistrict: '',
      consignorState: '',
      consignorPincode: '',
      consigneeName: '',
      consigneeMobile: '',
      consigneeAddress: '',
      consigneeDistrict: '',
      consigneeState: '',
      consigneePincode: '',
      shipDate: '',
      origin: '',
      destination: '',
      modeOfTransport: '',
      invoiceRequired: 'No',
      invoiceNumber: '',
      invoiceValue: '',
      shipmentType: '',
      pickupDate: '',
      pickupEmployee: '',
      ewayBillNo: '',
    });
    setShipments([]);
  };

  const parseAndFillAddress = (text: string) => {
  const pincodeMatch = text.match(/\b\d{6}\b/);
  const mobileMatch = text.match(/\b\d{10}\b/);

  setFormData(prev => ({
    ...prev,
    consignorAddress: text,
    consignorPincode: pincodeMatch?.[0] || "",
    consignorMobile: mobileMatch?.[0] || "",
  }));
};

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] to-[#eef2f7] p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-[#002d62]">
              <span className="text-[#f7931d]">📄</span> Create New Docket
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#002d62] text-white px-6 py-2 rounded hover:bg-[#00448c] transition flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
          </div>

<input
  type="file"
  accept="image/*"
  capture="environment"
  onChange={handleOCRUpload}
  className="mt-2"
/>

{ocrLoading && (
  <p className="mt-2 text-sm text-blue-600">📖 Reading image…</p>
)}

{ocrText && (
  <div className="mt-3 p-3 bg-gray-100 border rounded text-sm whitespace-pre-wrap">
    <strong>OCR Text:</strong>
    <div>{ocrText}</div>
  </div>
)}


          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex gap-8">
            {/* Form Container */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Consignor Section */}
                <div className="pb-8 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-[#f7931d] mb-6 flex items-center gap-3">
                    <span>👤</span> Consignor Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Consignor Name *</label>
                      <input
                        type="text"
                        name="consignorName"
                        value={formData.consignorName}
                        onChange={handleInputChange}
                        placeholder="Enter consignor name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Mobile Number *</label>
                      <input
                        type="tel"
                        name="consignorMobile"
                        value={formData.consignorMobile}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit mobile"
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-bold text-[#002d62] mb-2">Address *</label>
                      <textarea
                        name="consignorAddress"
                        value={formData.consignorAddress}
                        onChange={handleInputChange}
                        placeholder="Enter complete address"
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">District *</label>
                      <input
                        type="text"
                        name="consignorDistrict"
                        value={formData.consignorDistrict}
                        onChange={handleInputChange}
                        placeholder="Enter district"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">State *</label>
                      <input
                        type="text"
                        name="consignorState"
                        value={formData.consignorState}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Pincode *</label>
                      <input
                        type="text"
                        name="consignorPincode"
                        value={formData.consignorPincode}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit pincode"
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Consignee Section */}
                <div className="pb-8 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-[#f7931d] mb-6 flex items-center gap-3">
                    <span>📋</span> Consignee Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Consignee Name *</label>
                      <input
                        type="text"
                        name="consigneeName"
                        value={formData.consigneeName}
                        onChange={handleInputChange}
                        placeholder="Enter consignee name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Mobile Number *</label>
                      <input
                        type="tel"
                        name="consigneeMobile"
                        value={formData.consigneeMobile}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit mobile"
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-bold text-[#002d62] mb-2">Address *</label>
                      <textarea
                        name="consigneeAddress"
                        value={formData.consigneeAddress}
                        onChange={handleInputChange}
                        placeholder="Enter complete address"
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">District *</label>
                      <input
                        type="text"
                        name="consigneeDistrict"
                        value={formData.consigneeDistrict}
                        onChange={handleInputChange}
                        placeholder="Enter district"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">State *</label>
                      <input
                        type="text"
                        name="consigneeState"
                        value={formData.consigneeState}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Pincode *</label>
                      <input
                        type="text"
                        name="consigneePincode"
                        value={formData.consigneePincode}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit pincode"
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipment Details Section */}
                <div className="pb-8 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-[#f7931d] mb-6 flex items-center gap-3">
                    <span>🚚</span> Shipment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Ship Date *</label>
                      <input
                        type="date"
                        name="shipDate"
                        value={formData.shipDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Origin *</label>
                      <input
                        type="text"
                        name="origin"
                        value={formData.origin}
                        onChange={handleInputChange}
                        placeholder="Enter origin city"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Destination *</label>
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        placeholder="Enter destination city"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Mode of Transport *</label>
                      <select
                        name="modeOfTransport"
                        value={formData.modeOfTransport}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="">Select transport mode</option>
                        <option value="Road">Road</option>
                        <option value="Air">Air</option>
                        <option value="Rail">Train</option>
                        <option value="Sea">Sea</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Shipment Type *</label>
                      <select
                        name="shipmentType"
                        value={formData.shipmentType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="">Select type</option>
                        <option value="DOX">DOX</option>
                        <option value="Non-DOX">Non-DOX</option>
                        <option value="Express">Express</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Invoice Required?</label>
                      <select
                        name="invoiceRequired"
                        value={formData.invoiceRequired}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {showInvoiceFields && (
                      <>
                        <div>
                          <label className="block font-bold text-[#002d62] mb-2">Invoice Number</label>
                          <input
                            type="text"
                            name="invoiceNumber"
                            value={formData.invoiceNumber}
                            onChange={handleInputChange}
                            placeholder="Enter invoice number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#002d62] mb-2">Invoice Value (₹)</label>
                          <input
                            type="number"
                            name="invoiceValue"
                            value={formData.invoiceValue}
                            onChange={handleInputChange}
                            placeholder="Enter invoice value"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Pickup Date & Time *</label>
                      <input
                        type="datetime-local"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">Pickup Employee *</label>
                      <input
                        type="text"
                        name="pickupEmployee"
                        value={formData.pickupEmployee}
                        onChange={handleInputChange}
                        placeholder="Enter employee name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#002d62] mb-2">E-Way Bill Number</label>
                      <input
                        type="text"
                        name="ewayBillNo"
                        value={formData.ewayBillNo}
                        onChange={handleInputChange}
                        placeholder="Enter e-way bill number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipments Section */}
                <div className="pb-8 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-[#f7931d] mb-6 flex items-center gap-3">
                    <span>📦</span> Shipments
                  </h3>

                  {shipments.length > 0 && (
                    <div className="mb-6 space-y-4">
                      {shipments.map((shipment) => (
                        <div key={shipment.id} className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-300">
                            <div className="font-bold text-[#002d62]">{shipment.description}</div>
                            <button
                              type="button"
                              onClick={() => removeShipment(shipment.id)}
                              className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div><span className="text-gray-600">Weight:</span> {shipment.weight} kg</div>
                            <div><span className="text-gray-600">Dimensions:</span> {shipment.dimensions}</div>
                            <div><span className="text-gray-600">Quantity:</span> {shipment.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-[#002d62] mb-4">Add New Shipment</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block font-bold text-[#002d62] mb-2 text-sm">Description</label>
                        <input
                          type="text"
                          value={shipmentForm.description}
                          onChange={(e) => setShipmentForm({...shipmentForm, description: e.target.value})}
                          placeholder="Item description"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#002d62] mb-2 text-sm">Weight (kg)</label>
                        <input
                          type="number"
                          value={shipmentForm.weight}
                          onChange={(e) => setShipmentForm({...shipmentForm, weight: e.target.value})}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#002d62] mb-2 text-sm">Dimensions</label>
                        <input
                          type="text"
                          value={shipmentForm.dimensions}
                          onChange={(e) => setShipmentForm({...shipmentForm, dimensions: e.target.value})}
                          placeholder="L x W x H"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#002d62] mb-2 text-sm">Quantity</label>
                        <input
                          type="number"
                          value={shipmentForm.quantity}
                          onChange={(e) => setShipmentForm({...shipmentForm, quantity: e.target.value})}
                          placeholder="1"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addShipment}
                      className="w-full bg-green-500 text-white py-2 rounded font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <span>+</span> Add Shipment
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#f7931d] to-[#e67e22] text-white py-3 rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {loading ? 'Creating Docket...' : '✓ Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-bold hover:bg-gray-500 transition disabled:opacity-70"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Container */}
            <div className="w-80 bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-6">
              <h3 className="text-xl font-bold text-[#002d62] mb-4 pb-4 border-b border-gray-200 flex items-center gap-2">
                <span>👁️</span> Preview
              </h3>

              <div className="space-y-6">
                {/* Consignor Preview */}
                {(formData.consignorName || formData.origin) && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-bold text-[#f7931d] mb-3 text-sm">CONSIGNOR</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-semibold text-[#002d62]">{formData.consignorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-semibold text-[#002d62]">{formData.consignorMobile}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consignee Preview */}
                {(formData.consigneeName || formData.destination) && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-bold text-[#f7931d] mb-3 text-sm">CONSIGNEE</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-semibold text-[#002d62]">{formData.consigneeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-semibold text-[#002d62]">{formData.consigneeMobile}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipment Preview */}
                {(formData.origin || formData.destination) && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-bold text-[#f7931d] mb-3 text-sm">ROUTE</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From:</span>
                        <span className="font-semibold text-[#002d62]">{formData.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To:</span>
                        <span className="font-semibold text-[#002d62]">{formData.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-semibold text-[#002d62]">{formData.shipmentType}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipments Preview */}
                {shipments.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#f7931d] mb-3 text-sm">ITEMS ({shipments.length})</h4>
                    <div className="space-y-2 text-sm">
                      {shipments.map((s, idx) => (
                        <div key={idx} className="text-gray-600">
                          {idx + 1}. {s.description} ({s.quantity} x {s.weight}kg)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
