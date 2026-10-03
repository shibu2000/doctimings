import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  Save,
  Compass
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { EstablishmentType, VerificationStatus, AccountStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

export const AddEstablishmentPage: React.FC = () => {
  const { addEstablishment } = useAdmin();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [type, setType] = useState<EstablishmentType>('Pharmacy');
  const [district, setDistrict] = useState('Jhargram');
  const [subDistrict, setSubDistrict] = useState('Gopiballavpur');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('721506');
  const [phone, setPhone] = useState('');
  const [proprietorName, setProprietorName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [latitude, setLatitude] = useState(22.2134);
  const [longitude, setLongitude] = useState(86.9012);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('Verified');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('Platform Managed');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newEst = await addEstablishment({
        name: name.trim(),
        type,
        district,
        subDistrict,
        address: address.trim() || 'Main Market Road',
        pinCode: pinCode.trim() || '700001',
        phone: phone.trim() || '+91 94340 00000',
        proprietorName: proprietorName.trim() || 'Store Manager',
        licenseNumber: licenseNumber.trim() || 'WB-CL-PENDING',
        latitude: Number(latitude) || 22.5726,
        longitude: Number(longitude) || 88.3639,
        verificationStatus,
        accountStatus,
        isActive: true,
        practiceLocations: [
          {
            id: `LOC-${Date.now().toString().slice(-4)}`,
            establishmentId: '',
            name: 'Chamber 1 (Ground Floor Attached)',
            roomDesignation: 'Room 1',
            floor: 'Ground Floor',
            isActive: true
          }
        ]
      });

      navigate(`/establishments/${newEst.id}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to save establishment to backend');
    }
  };

  const typeOptions = [
    { value: 'Pharmacy', label: 'Pharmacy with Chamber' },
    { value: 'Clinic', label: 'Clinic' },
    { value: 'Doctor Chamber', label: 'Doctor Chamber' },
    { value: 'Polyclinic', label: 'Polyclinic' },
    { value: 'Diagnostic Center', label: 'Diagnostic Center' },
    { value: 'Hospital', label: 'Hospital' }
  ];

  const districtOptions = [
    { value: 'Jhargram', label: 'Jhargram' },
    { value: 'Purba Bardhaman', label: 'Purba Bardhaman' },
    { value: 'Nadia', label: 'Nadia' },
    { value: 'Hooghly', label: 'Hooghly' },
    { value: 'Birbhum', label: 'Birbhum' },
    { value: 'Paschim Medinipur', label: 'Paschim Medinipur' }
  ];

  const verificationOptions = [
    { value: 'Verified', label: 'Verified' },
    { value: 'Needs Review', label: 'Needs Review' },
    { value: 'Pending', label: 'Pending Audit' }
  ];

  const accountOptions = [
    { value: 'Platform Managed', label: 'Platform Managed' },
    { value: 'Invitation Pending', label: 'Invitation Pending' },
    { value: 'Account Active', label: 'Account Active' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <span onClick={() => navigate('/establishments')} className="hover:text-teal-700 cursor-pointer">
              Establishments
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900">Add Establishment</span>
          </nav>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add Healthcare Establishment</h1>
            <Badge variant="warning">New Facility Intake</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Register pharmacies, standalone doctor chambers, polyclinics, and rural health clinics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/establishments')}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Establishment
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-700" />
              <span>1. Facility Identity</span>
            </h2>
            <span className="text-[10px] uppercase font-bold text-slate-400">Core Metadata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Establishment Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Maa Medical Store & Attached Chamber"
              />
            </div>

            <Select
              label="Facility Category"
              required
              value={type}
              onChange={e => setType(e.target.value as EstablishmentType)}
              options={typeOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Clinical / Drug License Number"
              value={licenseNumber}
              onChange={e => setLicenseNumber(e.target.value)}
              placeholder="e.g. WB-CL-7215-09"
            />

            <Input
              label="Proprietor / Counter Manager Name"
              value={proprietorName}
              onChange={e => setProprietorName(e.target.value)}
              placeholder="e.g. Amit Kumar (Chemist)"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>2. Geography & Coordinates</span>
            </h2>
            <span className="text-[10px] text-slate-400">Ground Location Pin</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="District"
              required
              value={district}
              onChange={e => setDistrict(e.target.value)}
              options={districtOptions}
            />

            <Input
              label="Sub-District / Block"
              required
              value={subDistrict}
              onChange={e => setSubDistrict(e.target.value)}
              placeholder="e.g. Gopiballavpur"
            />

            <Input
              label="PIN Code"
              required
              maxLength={6}
              value={pinCode}
              onChange={e => setPinCode(e.target.value)}
              placeholder="721506"
            />
          </div>

          <Input
            label="Physical Street Address"
            required
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. Station Road, Near Central Bus Stand, Gopiballavpur"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="GPS Latitude"
              type="number"
              step="0.0001"
              icon={<Compass className="w-4 h-4 text-teal-700" />}
              value={latitude}
              onChange={e => setLatitude(Number(e.target.value))}
            />

            <Input
              label="GPS Longitude"
              type="number"
              step="0.0001"
              icon={<Compass className="w-4 h-4 text-teal-700" />}
              value={longitude}
              onChange={e => setLongitude(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-700" />
              <span>3. Contact & Governance Status</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Chamber Desk Phone"
              required
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 94340 22109"
            />

            <Select
              label="Verification Status"
              value={verificationStatus}
              onChange={e => setVerificationStatus(e.target.value as VerificationStatus)}
              options={verificationOptions}
            />

            <Select
              label="Account Management"
              value={accountStatus}
              onChange={e => setAccountStatus(e.target.value as AccountStatus)}
              options={accountOptions}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
