'use client';

import React from "react"
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { 
  Phone, 
  User, 
  MapPin, 
  Calendar, 
  Truck, 
  Package, 
  FileText, 
  Camera,
  X,
  Plus,
  ChevronLeft,
  Check,
  Eye,
  RefreshCw,
  Box
} from 'lucide-react';

interface FormData {
  consigneeName: string;
  consigneeMobile: string;
  consigneeAddress: string;
  consigneeDistrict: string;
  consigneeState: string;
  consigneePincode: string;
  origin: string;
  destination: string;
  pickupEmployee: string;
  ewayBillNo: string;
}

interface Shipment {
  id: number;
  boxType: string;
  length: number;
  width: number;
  height: number;
  actualWeight: number;
  noOfBox: number;
}

// Box type configurations
const BOX_TYPES = {
  'Small': { length: 10, width: 10, height: 10 },
  'Medium': { length: 20, width: 15, height: 10 },
  'Large': { length: 30, width: 20, height: 15 },
  'Other': { length: 0, width: 0, height: 0 }
};

export default function AddDocketPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Get consignor details from session storage
  const [consignorDetails] = useState(() => {
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem('vinworld_user');
      if (userData) {
        const parsed = JSON.parse(userData);
        return {
          name: parsed.ConsignorName || '',
          mobile: parsed.ConsignorMobile || '',
          address: parsed.ConsignorAddress || '',
          district: parsed.ConsignorDistrict || '',
          state: parsed.ConsignorState || '',
          pincode: parsed.ConsignorPincode || ''
        };
      }
    }
    return {
      name: '',
      mobile: '',
      address: '',
      district: '',
      state: '',
      pincode: ''
    };
  });

  const [formData, setFormData] = useState<FormData>({
    consigneeName: '',
    consigneeMobile: '',
    consigneeAddress: '',
    consigneeDistrict: '',
    consigneeState: '',
    consigneePincode: '',
    origin: '',
    destination: '',
    pickupEmployee: '',
    ewayBillNo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [shipmentForm, setShipmentForm] = useState({
    boxType: 'Small',
    length: 10,
    width: 10,
    height: 10,
    actualWeight: '',
    noOfBox: '1',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBoxTypeChange = (type: string) => {
    const dimensions = BOX_TYPES[type as keyof typeof BOX_TYPES];
    setShipmentForm({
      ...shipmentForm,
      boxType: type,
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height
    });
  };

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: number) => {
    setShipmentForm({
      ...shipmentForm,
      [dimension]: value
    });
  };

  if (!mounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addShipment = () => {
    if (shipmentForm.actualWeight && shipmentForm.noOfBox) {
      setShipments([...shipments, { 
        id: Date.now(),
        boxType: shipmentForm.boxType,
        length: shipmentForm.length,
        width: shipmentForm.width,
        height: shipmentForm.height,
        actualWeight: parseFloat(shipmentForm.actualWeight),
        noOfBox: parseInt(shipmentForm.noOfBox)
      }]);
      setShipmentForm({ 
        boxType: 'Small',
        length: 10,
        width: 10,
        height: 10,
        actualWeight: '',
        noOfBox: '1'
      });
    }
  };

  const removeShipment = (id: number) => {
    setShipments(shipments.filter(s => s.id !== id));
  };

  const preprocessImage = async (file: File): Promise<HTMLCanvasElement> => {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const maxWidth = 1200;
    const scale = Math.min(maxWidth / bitmap.width, 1);

    canvas.width = bitmap.width * scale;
    canvas.height = bitmap.height * scale;

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrText("");

    try {
      const processedImage = await preprocessImage(file);
      const { data: { text } } = await Tesseract.recognize(
        processedImage,
        "eng",
        { logger: m => console.log(m) }
      );

      setOcrText(text);
      parseAndFillAddress(text);
    } catch (err) {
      console.error(err);
      setOcrText("❌ Failed to read text");
    } finally {
      setOcrLoading(false);
    }
  };

  const parseAndFillAddress = (text: string) => {
    const pincodeMatch = text.match(/\b\d{6}\b/);
    const mobileMatch = text.match(/\b\d{10}\b/);

    setFormData(prev => ({
      ...prev,
      consigneeAddress: text,
      consigneePincode: pincodeMatch?.[0] || "",
      consigneeMobile: mobileMatch?.[0] || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const required = [
      'consigneeName', 'consigneeMobile', 'consigneeAddress',
      'origin', 'destination', 'pickupEmployee'
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
      const today = new Date().toISOString().split('T')[0];
      
      const submitData = {
        consignor: {
          name: consignorDetails.name,
          address: consignorDetails.address,
          district: consignorDetails.district,
          state: consignorDetails.state,
          pincode: consignorDetails.pincode,
          mobile: consignorDetails.mobile
        },
        consignee: {
          name: formData.consigneeName,
          address: formData.consigneeAddress,
          district: formData.consigneeDistrict,
          state: formData.consigneeState,
          pincode: formData.consigneePincode,
          mobile: formData.consigneeMobile
        },
        shipDate: today,
        origin: formData.origin,
        destination: formData.destination,
        modeOfTransport: 'Road',
        invoiceRequired: 'Yes',
        invoiceNumber: '',
        invoiceValue: 0,
        shipmentType: 'Non-DOX',
        pickupDate: today,
        pickupEmployee: formData.pickupEmployee,
        ewayBillNo: formData.ewayBillNo || '',
        locationId: user?.LocationId,
        shipments: shipments.map(({ boxType, length, width, height, actualWeight, noOfBox }) => ({
          length,
          width,
          height,
          actualWeight,
          noOfBox,
          boxType
        }))
      };

      const response = await fetch('https://namami-infotech.com/vinworld/src/docket/add_docket.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Docket created successfully!');
        setTimeout(() => router.push('/dashboard'), 2000);
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
      consigneeName: '',
      consigneeMobile: '',
      consigneeAddress: '',
      consigneeDistrict: '',
      consigneeState: '',
      consigneePincode: '',
      origin: '',
      destination: '',
      pickupEmployee: '',
      ewayBillNo: '',
    });
    setShipments([]);
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-[#f7931d]/10 rounded-lg">
        <Icon className="w-5 h-5 text-[#f7931d]" />
      </div>
      <h3 className="text-xl font-bold text-[#002d62]">{title}</h3>
    </div>
  );

  const InputField = ({ label, name, type = "text", placeholder, required = false, icon: Icon, value, onChange }: any) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#002d62] flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100 text-gray-900"
      />
    </div>
  );

  const PreviewCard = () => (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center ${showPreview ? 'block' : 'hidden'}`}>
      <div className="bg-white w-full h-[90vh] md:h-auto md:max-h-[80vh] md:max-w-2xl md:rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#002d62] text-white">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            <h3 className="font-bold">Docket Preview</h3>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Consignor */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#f7931d] flex items-center gap-2">
              <User className="w-4 h-4" />
              Consignor Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <div className="font-semibold text-[#002d62]">{consignorDetails.name || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-gray-600">Mobile:</span>
                <div className="font-semibold text-[#002d62]">{consignorDetails.mobile || 'Not provided'}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Address:</span>
                <div className="font-semibold text-[#002d62]">{consignorDetails.address || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Consignee */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#f7931d] flex items-center gap-2">
              <User className="w-4 h-4" />
              Consignee Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <div className="font-semibold text-[#002d62]">{formData.consigneeName || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-gray-600">Mobile:</span>
                <div className="font-semibold text-[#002d62]">{formData.consigneeMobile || 'Not provided'}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Address:</span>
                <div className="font-semibold text-[#002d62]">{formData.consigneeAddress || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Shipment */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#f7931d] flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Shipment Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">From:</span>
                <div className="font-semibold text-[#002d62]">{formData.origin || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-gray-600">To:</span>
                <div className="font-semibold text-[#002d62]">{formData.destination || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          {shipments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#f7931d] flex items-center gap-2">
                <Package className="w-4 h-4" />
                Shipments ({shipments.length})
              </h4>
              <div className="space-y-2">
                {shipments.map((shipment, idx) => (
                  <div key={shipment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="font-semibold text-[#002d62] mb-1">
                      {idx + 1}. {shipment.boxType} Box
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                      <div>Size: {shipment.length}x{shipment.width}x{shipment.height}</div>
                      <div>Weight: {shipment.actualWeight}kg</div>
                      <div>Qty: {shipment.noOfBox}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowPreview(false)}
            className="w-full bg-[#002d62] text-white py-3 rounded-lg font-bold hover:bg-[#00448c] transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] to-[#eef2f7]">
        {/* Header - Mobile First */}
        <div className="bg-[#002d62] text-white p-4 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-center flex-1">Create New Docket</h1>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4">
          {/* OCR Upload Section */}
          <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-[#002d62] flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Scan Consignee Address with Camera
              </label>
              {ocrLoading && (
                <div className="text-sm text-[#f7931d] animate-pulse">Processing...</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleOCRUpload}
              className="hidden"
              id="ocr-upload"
              disabled={ocrLoading}
            />
            <label
              htmlFor="ocr-upload"
              className={`block w-full py-3 px-4 text-center rounded-lg border-2 border-dashed ${ocrLoading ? 'border-gray-300 bg-gray-100' : 'border-[#f7931d] bg-[#f7931d]/5 hover:bg-[#f7931d]/10 cursor-pointer transition'}`}
            >
              {ocrLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#f7931d] border-t-transparent rounded-full animate-spin"></div>
                  Scanning Image...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  Tap to Capture Consignee Address
                </div>
              )}
            </label>
            {ocrText && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <div className="font-semibold text-green-700 mb-1">Address Detected ✓</div>
                <div className="text-gray-700">Mobile and pincode auto-filled</div>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <div className="font-semibold">⚠️ {error}</div>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              <div className="font-semibold">✅ {success}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Consignor Section - Read Only */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <SectionHeader icon={User} title="Consignor Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#002d62] flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {consignorDetails.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#002d62] flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {consignorDetails.mobile}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#002d62] flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {consignorDetails.address}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#002d62] flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    District
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {consignorDetails.district}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#002d62] flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    State
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {consignorDetails.state}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#002d62] flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Pincode
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {consignorDetails.pincode}
                  </div>
                </div>
              </div>
            </div>

            {/* Consignee Section */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <SectionHeader icon={User} title="Consignee Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Full Name"
                  name="consigneeName"
                  placeholder="Enter consignee name"
                  required
                  icon={User}
                  value={formData.consigneeName}
                  onChange={handleInputChange}
                />
                <InputField 
                  label="Mobile Number"
                  name="consigneeMobile"
                  type="tel"
                  placeholder="10-digit mobile"
                  required
                  icon={Phone}
                  value={formData.consigneeMobile}
                  onChange={handleInputChange}
                />
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#002d62] flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Address *
                  </label>
                  <textarea
                    name="consigneeAddress"
                    value={formData.consigneeAddress}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows={3}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f7931d] focus:ring-2 focus:ring-orange-100 text-gray-900"
                  />
                </div>
                <InputField 
                  label="District"
                  name="consigneeDistrict"
                  placeholder="Enter district"
                  required
                  icon={MapPin}
                  value={formData.consigneeDistrict}
                  onChange={handleInputChange}
                />
                <InputField 
                  label="State"
                  name="consigneeState"
                  placeholder="Enter state"
                  required
                  icon={MapPin}
                  value={formData.consigneeState}
                  onChange={handleInputChange}
                />
                <InputField 
                  label="Pincode"
                  name="consigneePincode"
                  placeholder="6-digit pincode"
                  required
                  icon={MapPin}
                  value={formData.consigneePincode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Shipment Details */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <SectionHeader icon={Truck} title="Shipment Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Origin"
                  name="origin"
                  placeholder="Origin city"
                  required
                  icon={MapPin}
                  value={formData.origin}
                  onChange={handleInputChange}
                />
                <InputField 
                  label="Destination"
                  name="destination"
                  placeholder="Destination city"
                  required
                  icon={MapPin}
                  value={formData.destination}
                  onChange={handleInputChange}
                />
                <InputField 
                  label="Pickup Employee"
                  name="pickupEmployee"
                  placeholder="Employee name"
                  required
                  icon={User}
                  value={formData.pickupEmployee}
                  onChange={handleInputChange}
                />
                <InputField 
                  label="E-Way Bill No."
                  name="ewayBillNo"
                  placeholder="E-way bill number"
                  icon={FileText}
                  value={formData.ewayBillNo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Shipments Section */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <SectionHeader icon={Package} title="Shipments" />
              
              {shipments.length > 0 && (
                <div className="mb-6 space-y-3">
                  {shipments.map((shipment) => (
                    <div key={shipment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-[#002d62]">{shipment.boxType} Box</div>
                        <button
                          type="button"
                          onClick={() => removeShipment(shipment.id)}
                          className="p-1 hover:bg-red-100 rounded transition"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium">Size</span>
                          <span className="text-[#002d62] font-semibold">{shipment.length}x{shipment.width}x{shipment.height}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Weight</span>
                          <span className="text-[#002d62] font-semibold">{shipment.actualWeight} kg</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Quantity</span>
                          <span className="text-[#002d62] font-semibold">{shipment.noOfBox}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#002d62]">Box Type *</label>
                    <select
                      value={shipmentForm.boxType}
                      onChange={(e) => handleBoxTypeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                    >
                      <option value="Small">Small (10x10x10)</option>
                      <option value="Medium">Medium (20x15x10)</option>
                      <option value="Large">Large (30x20x15)</option>
                      <option value="Other">Other (Custom)</option>
                    </select>
                  </div>

                  {shipmentForm.boxType === 'Other' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#002d62]">Length (cm) *</label>
                        <input
                          type="number"
                          value={shipmentForm.length}
                          onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#002d62]">Width (cm) *</label>
                        <input
                          type="number"
                          value={shipmentForm.width}
                          onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#002d62]">Height (cm) *</label>
                        <input
                          type="number"
                          value={shipmentForm.height}
                          onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 col-span-3">
                      <label className="text-sm font-semibold text-[#002d62]">Dimensions</label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-700">
                        {shipmentForm.length}cm x {shipmentForm.width}cm x {shipmentForm.height}cm
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#002d62]">Weight (kg) *</label>
                    <input
                      type="number"
                      value={shipmentForm.actualWeight}
                      onChange={(e) => setShipmentForm({...shipmentForm, actualWeight: e.target.value})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#002d62]">Quantity *</label>
                    <input
                      type="number"
                      value={shipmentForm.noOfBox}
                      onChange={(e) => setShipmentForm({...shipmentForm, noOfBox: e.target.value})}
                      placeholder="1"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f7931d]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addShipment}
                  className="w-full md:w-auto px-6 py-3 bg-[#002d62] text-white rounded-lg font-semibold hover:bg-[#00448c] transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Shipment
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent pt-4 pb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex-1 bg-white border-2 border-[#002d62] text-[#002d62] py-3 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 bg-gray-100 border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#f7931d] to-[#e67e22] text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Submit Docket
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Preview Modal */}
          <PreviewCard />
        </div>
      </div>
    </ProtectedRoute>
  );
}