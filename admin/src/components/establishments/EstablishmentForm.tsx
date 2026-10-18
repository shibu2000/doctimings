import { useState, type FormEvent } from 'react';
import { ChevronDown, LocateFixed, MapPin } from 'lucide-react';
import type { EstablishmentInput } from '../../lib/api';
import { ESTABLISHMENT_TYPES, WEST_BENGAL_DISTRICTS } from '../../lib/constants';
import { formatCoordinates, isShortMapsLink, mapsUrl, parseCoordinates } from '../../lib/geo';
import type { Establishment } from '../../lib/types';
import { Button } from '../ui/Button';
import { SelectInput, TextInput } from '../ui/Field';

interface Props {
  formId: string;
  initial?: Partial<Establishment>;
  defaults?: { district?: string; subDistrict?: string };
  onSubmit: (input: EstablishmentInput) => void;
}

export const EstablishmentForm = ({ formId, initial, defaults, onSubmit }: Props) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState(initial?.type ?? 'Pharmacy');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [subDistrict, setSubDistrict] = useState(initial?.subDistrict ?? defaults?.subDistrict ?? '');
  const [district, setDistrict] = useState(initial?.district ?? defaults?.district ?? 'Paschim Medinipur');
  const [pinCode, setPinCode] = useState(initial?.pinCode ?? '');
  const [location, setLocation] = useState(
    initial?.latitude !== undefined && initial?.longitude !== undefined ? formatCoordinates(initial.latitude, initial.longitude) : ''
  );
  const [proprietorName, setProprietorName] = useState(initial?.proprietorName ?? '');
  const [licenseNumber, setLicenseNumber] = useState(initial?.licenseNumber ?? '');
  const [showMore, setShowMore] = useState(Boolean(initial?.proprietorName || initial?.licenseNumber));
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const coords = parseCoordinates(location);
  const errors = {
    name: name.trim().length < 2 ? 'Enter the name' : '',
    address: address.trim().length < 3 ? 'Enter the address or landmark' : '',
    district: district.trim().length < 2 ? 'Choose the district' : '',
    pinCode: /^[1-9]\d{5}$/.test(pinCode.trim()) ? '' : 'Enter a 6-digit PIN code',
    location: coords
      ? ''
      : isShortMapsLink(location)
        ? 'Short links can’t be read. Open the link, then copy the numbers shown (e.g. 22.6602, 87.7247).'
        : 'Paste a Google Maps link or the coordinates'
  };
  const visible = (key: keyof typeof errors) => (submitted ? errors[key] : '');

  const useMyLocation = () => {
    setLocateError('');
    if (!navigator.geolocation) return setLocateError('Location is not available in this browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation(formatCoordinates(pos.coords.latitude, pos.coords.longitude));
        setLocating(false);
      },
      () => {
        setLocateError('Could not get your location. Allow location access or paste a link.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !coords) return;
    onSubmit({
      name: name.trim(),
      type,
      phone: phone.trim(),
      address: address.trim(),
      subDistrict: subDistrict.trim(),
      district: district.trim(),
      pinCode: pinCode.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      proprietorName: proprietorName.trim(),
      licenseNumber: licenseNumber.trim()
    });
  };

  return (
    <form id={formId} onSubmit={submit} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-[1fr_12rem] gap-3">
        <TextInput label="Name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maa Tara Medical Store" error={visible('name')} />
        <SelectInput label="Type" value={type} onChange={e => setType(e.target.value)}>
          {ESTABLISHMENT_TYPES.map(t => (
            <option key={t}>{t}</option>
          ))}
        </SelectInput>
      </div>
      <TextInput label="Phone (for patients to call)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98xxx xxxxx" />
      <TextInput label="Address / landmark" required value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Near bus stand, Station Road" error={visible('address')} />
      <div className="grid sm:grid-cols-3 gap-3">
        <TextInput label="Town / block" value={subDistrict} onChange={e => setSubDistrict(e.target.value)} placeholder="e.g. Ghatal" />
        <div>
          <TextInput label="District" required list="wb-districts" value={district} onChange={e => setDistrict(e.target.value)} error={visible('district')} />
          <datalist id="wb-districts">
            {WEST_BENGAL_DISTRICTS.map(d => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <TextInput label="PIN code" required inputMode="numeric" maxLength={6} value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))} error={visible('pinCode')} />
      </div>

      <div className="space-y-1.5">
        <TextInput
          label="Map location"
          required
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Paste a Google Maps link, or 22.6602, 87.7247"
          error={visible('location') || locateError}
          hint={
            coords ? (
              <a href={mapsUrl(coords.latitude, coords.longitude)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-teal-700 font-medium hover:underline">
                <MapPin className="w-3.5 h-3.5" />
                {formatCoordinates(coords.latitude, coords.longitude)} · check on map
              </a>
            ) : (
              'Used to show patients how far the place is.'
            )
          }
        />
        <Button variant="outline" size="sm" icon={<LocateFixed className="w-3.5 h-3.5" />} onClick={useMyLocation} loading={locating}>
          Use my current location
        </Button>
      </div>

      <button type="button" onClick={() => setShowMore(v => !v)} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        Owner and licence (optional)
      </button>
      {showMore && (
        <div className="grid sm:grid-cols-2 gap-3">
          <TextInput label="Owner / contact person" value={proprietorName} onChange={e => setProprietorName(e.target.value)} />
          <TextInput label="Drug / trade licence no." value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
        </div>
      )}
    </form>
  );
};
