import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, Phone } from "lucide-react";

export interface CountryInfo {
  code: string; // ISO 2-letter e.g. "TZ"
  name: string; // e.g. "Tanzania"
  dialCode: string; // e.g. "+255"
  flag: string; // Emoji e.g. "🇹🇿"
}

// Helper to generate flag emoji from 2-letter ISO code
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const ALL_COUNTRIES: CountryInfo[] = [
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: getFlagEmoji("TZ") },
  { code: "US", name: "United States", dialCode: "+1", flag: getFlagEmoji("US") },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: getFlagEmoji("GB") },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: getFlagEmoji("KE") },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: getFlagEmoji("NG") },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: getFlagEmoji("ZA") },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: getFlagEmoji("UG") },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: getFlagEmoji("RW") },
  { code: "IN", name: "India", dialCode: "+91", flag: getFlagEmoji("IN") },
  { code: "CA", name: "Canada", dialCode: "+1", flag: getFlagEmoji("CA") },
  { code: "AU", name: "Australia", dialCode: "+61", flag: getFlagEmoji("AU") },
  { code: "DE", name: "Germany", dialCode: "+49", flag: getFlagEmoji("DE") },
  { code: "FR", name: "France", dialCode: "+33", flag: getFlagEmoji("FR") },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: getFlagEmoji("EG") },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: getFlagEmoji("GH") },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: getFlagEmoji("ET") },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: getFlagEmoji("AE") },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: getFlagEmoji("SA") },
  { code: "AF", name: "Afghanistan", dialCode: "+93", flag: getFlagEmoji("AF") },
  { code: "AL", name: "Albania", dialCode: "+355", flag: getFlagEmoji("AL") },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: getFlagEmoji("DZ") },
  { code: "AO", name: "Angola", dialCode: "+244", flag: getFlagEmoji("AO") },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: getFlagEmoji("AR") },
  { code: "AM", name: "Armenia", dialCode: "+374", flag: getFlagEmoji("AM") },
  { code: "AT", name: "Austria", dialCode: "+43", flag: getFlagEmoji("AT") },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994", flag: getFlagEmoji("AZ") },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: getFlagEmoji("BH") },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: getFlagEmoji("BD") },
  { code: "BY", name: "Belarus", dialCode: "+375", flag: getFlagEmoji("BY") },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: getFlagEmoji("BE") },
  { code: "BZ", name: "Belize", dialCode: "+501", flag: getFlagEmoji("BZ") },
  { code: "BJ", name: "Benin", dialCode: "+229", flag: getFlagEmoji("BJ") },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: getFlagEmoji("BO") },
  { code: "BA", name: "Bosnia and Herzegovina", dialCode: "+387", flag: getFlagEmoji("BA") },
  { code: "BW", name: "Botswana", dialCode: "+267", flag: getFlagEmoji("BW") },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: getFlagEmoji("BR") },
  { code: "BG", name: "Bulgaria", dialCode: "+359", flag: getFlagEmoji("BG") },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", flag: getFlagEmoji("BF") },
  { code: "BI", name: "Burundi", dialCode: "+257", flag: getFlagEmoji("BI") },
  { code: "KH", name: "Cambodia", dialCode: "+855", flag: getFlagEmoji("KH") },
  { code: "CM", name: "Cameroon", dialCode: "+237", flag: getFlagEmoji("CM") },
  { code: "CV", name: "Cape Verde", dialCode: "+238", flag: getFlagEmoji("CV") },
  { code: "CF", name: "Central African Republic", dialCode: "+236", flag: getFlagEmoji("CF") },
  { code: "TD", name: "Chad", dialCode: "+235", flag: getFlagEmoji("TD") },
  { code: "CL", name: "Chile", dialCode: "+56", flag: getFlagEmoji("CL") },
  { code: "CN", name: "China", dialCode: "+86", flag: getFlagEmoji("CN") },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: getFlagEmoji("CO") },
  { code: "CD", name: "Congo (DRC)", dialCode: "+243", flag: getFlagEmoji("CD") },
  { code: "CG", name: "Congo (Republic)", dialCode: "+242", flag: getFlagEmoji("CG") },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: getFlagEmoji("CR") },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", flag: getFlagEmoji("CI") },
  { code: "HR", name: "Croatia", dialCode: "+385", flag: getFlagEmoji("HR") },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: getFlagEmoji("CU") },
  { code: "CY", name: "Cyprus", dialCode: "+357", flag: getFlagEmoji("CY") },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: getFlagEmoji("CZ") },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: getFlagEmoji("DK") },
  { code: "DJ", name: "Djibouti", dialCode: "+253", flag: getFlagEmoji("DJ") },
  { code: "DO", name: "Dominican Republic", dialCode: "+1", flag: getFlagEmoji("DO") },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: getFlagEmoji("EC") },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: getFlagEmoji("SV") },
  { code: "GQ", name: "Equatorial Guinea", dialCode: "+240", flag: getFlagEmoji("GQ") },
  { code: "ER", name: "Eritrea", dialCode: "+291", flag: getFlagEmoji("ER") },
  { code: "EE", name: "Estonia", dialCode: "+372", flag: getFlagEmoji("EE") },
  { code: "FJ", name: "Fiji", dialCode: "+679", flag: getFlagEmoji("FJ") },
  { code: "FI", name: "Finland", dialCode: "+358", flag: getFlagEmoji("FI") },
  { code: "GA", name: "Gabon", dialCode: "+241", flag: getFlagEmoji("GA") },
  { code: "GM", name: "Gambia", dialCode: "+220", flag: getFlagEmoji("GM") },
  { code: "GE", name: "Georgia", dialCode: "+995", flag: getFlagEmoji("GE") },
  { code: "GR", name: "Greece", dialCode: "+30", flag: getFlagEmoji("GR") },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: getFlagEmoji("GT") },
  { code: "GN", name: "Guinea", dialCode: "+224", flag: getFlagEmoji("GN") },
  { code: "HT", name: "Haiti", dialCode: "+509", flag: getFlagEmoji("HT") },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: getFlagEmoji("HN") },
  { code: "HK", name: "Hong Kong", dialCode: "+852", flag: getFlagEmoji("HK") },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: getFlagEmoji("HU") },
  { code: "IS", name: "Iceland", dialCode: "+354", flag: getFlagEmoji("IS") },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: getFlagEmoji("ID") },
  { code: "IR", name: "Iran", dialCode: "+98", flag: getFlagEmoji("IR") },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: getFlagEmoji("IQ") },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: getFlagEmoji("IE") },
  { code: "IL", name: "Israel", dialCode: "+972", flag: getFlagEmoji("IL") },
  { code: "IT", name: "Italy", dialCode: "+39", flag: getFlagEmoji("IT") },
  { code: "JM", name: "Jamaica", dialCode: "+1", flag: getFlagEmoji("JM") },
  { code: "JP", name: "Japan", dialCode: "+81", flag: getFlagEmoji("JP") },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: getFlagEmoji("JO") },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: getFlagEmoji("KZ") },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: getFlagEmoji("KW") },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996", flag: getFlagEmoji("KG") },
  { code: "LA", name: "Laos", dialCode: "+856", flag: getFlagEmoji("LA") },
  { code: "LV", name: "Latvia", dialCode: "+371", flag: getFlagEmoji("LV") },
  { code: "LB", name: "Lebanon", dialCode: "+961", flag: getFlagEmoji("LB") },
  { code: "LS", name: "Lesotho", dialCode: "+266", flag: getFlagEmoji("LS") },
  { code: "LR", name: "Liberia", dialCode: "+231", flag: getFlagEmoji("LR") },
  { code: "LY", name: "Libya", dialCode: "+218", flag: getFlagEmoji("LY") },
  { code: "LT", name: "Lithuania", dialCode: "+370", flag: getFlagEmoji("LT") },
  { code: "LU", name: "Luxembourg", dialCode: "+352", flag: getFlagEmoji("LU") },
  { code: "MG", name: "Madagascar", dialCode: "+261", flag: getFlagEmoji("MG") },
  { code: "MW", name: "Malawi", dialCode: "+265", flag: getFlagEmoji("MW") },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: getFlagEmoji("MY") },
  { code: "MV", name: "Maldives", dialCode: "+960", flag: getFlagEmoji("MV") },
  { code: "ML", name: "Mali", dialCode: "+223", flag: getFlagEmoji("ML") },
  { code: "MT", name: "Malta", dialCode: "+356", flag: getFlagEmoji("MT") },
  { code: "MR", name: "Mauritania", dialCode: "+222", flag: getFlagEmoji("MR") },
  { code: "MU", name: "Mauritius", dialCode: "+230", flag: getFlagEmoji("MU") },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: getFlagEmoji("MX") },
  { code: "MD", name: "Moldova", dialCode: "+373", flag: getFlagEmoji("MD") },
  { code: "MC", name: "Monaco", dialCode: "+377", flag: getFlagEmoji("MC") },
  { code: "MN", name: "Mongolia", dialCode: "+976", flag: getFlagEmoji("MN") },
  { code: "ME", name: "Montenegro", dialCode: "+382", flag: getFlagEmoji("ME") },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: getFlagEmoji("MA") },
  { code: "MZ", name: "Mozambique", dialCode: "+258", flag: getFlagEmoji("MZ") },
  { code: "MM", name: "Myanmar", dialCode: "+95", flag: getFlagEmoji("MM") },
  { code: "NA", name: "Namibia", dialCode: "+264", flag: getFlagEmoji("NA") },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: getFlagEmoji("NP") },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: getFlagEmoji("NL") },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: getFlagEmoji("NZ") },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: getFlagEmoji("NI") },
  { code: "NE", name: "Niger", dialCode: "+227", flag: getFlagEmoji("NE") },
  { code: "NO", name: "Norway", dialCode: "+47", flag: getFlagEmoji("NO") },
  { code: "OM", name: "Oman", dialCode: "+968", flag: getFlagEmoji("OM") },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: getFlagEmoji("PK") },
  { code: "PS", name: "Palestine", dialCode: "+970", flag: getFlagEmoji("PS") },
  { code: "PA", name: "Panama", dialCode: "+507", flag: getFlagEmoji("PA") },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675", flag: getFlagEmoji("PG") },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: getFlagEmoji("PY") },
  { code: "PE", name: "Peru", dialCode: "+51", flag: getFlagEmoji("PE") },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: getFlagEmoji("PH") },
  { code: "PL", name: "Poland", dialCode: "+48", flag: getFlagEmoji("PL") },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: getFlagEmoji("PT") },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: getFlagEmoji("QA") },
  { code: "RO", name: "Romania", dialCode: "+40", flag: getFlagEmoji("RO") },
  { code: "RU", name: "Russia", dialCode: "+7", flag: getFlagEmoji("RU") },
  { code: "SN", name: "Senegal", dialCode: "+221", flag: getFlagEmoji("SN") },
  { code: "RS", name: "Serbia", dialCode: "+381", flag: getFlagEmoji("RS") },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: getFlagEmoji("SG") },
  { code: "SK", name: "Slovakia", dialCode: "+421", flag: getFlagEmoji("SK") },
  { code: "SI", name: "Slovenia", dialCode: "+386", flag: getFlagEmoji("SI") },
  { code: "SO", name: "Somalia", dialCode: "+252", flag: getFlagEmoji("SO") },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: getFlagEmoji("KR") },
  { code: "SS", name: "South Sudan", dialCode: "+211", flag: getFlagEmoji("SS") },
  { code: "ES", name: "Spain", dialCode: "+34", flag: getFlagEmoji("ES") },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: getFlagEmoji("LK") },
  { code: "SD", name: "Sudan", dialCode: "+249", flag: getFlagEmoji("SD") },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: getFlagEmoji("SE") },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: getFlagEmoji("CH") },
  { code: "SY", name: "Syria", dialCode: "+963", flag: getFlagEmoji("SY") },
  { code: "TW", name: "Taiwan", dialCode: "+886", flag: getFlagEmoji("TW") },
  { code: "TJ", name: "Tajikistan", dialCode: "+992", flag: getFlagEmoji("TJ") },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: getFlagEmoji("TH") },
  { code: "TG", name: "Togo", dialCode: "+228", flag: getFlagEmoji("TG") },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: getFlagEmoji("TN") },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: getFlagEmoji("TR") },
  { code: "TM", name: "Turkmenistan", dialCode: "+993", flag: getFlagEmoji("TM") },
  { code: "UA", name: "Ukraine", dialCode: "+380", flag: getFlagEmoji("UA") },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: getFlagEmoji("UY") },
  { code: "UZ", name: "Uzbekistan", dialCode: "+998", flag: getFlagEmoji("UZ") },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: getFlagEmoji("VE") },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: getFlagEmoji("VN") },
  { code: "YE", name: "Yemen", dialCode: "+967", flag: getFlagEmoji("YE") },
  { code: "ZM", name: "Zambia", dialCode: "+260", flag: getFlagEmoji("ZM") },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: getFlagEmoji("ZW") }
];

// Function to detect country by timezone or browser language
export function autoDetectCountry(): CountryInfo {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Dar_es_Salaam")) return ALL_COUNTRIES.find((c) => c.code === "TZ")!;
    if (tz.includes("Nairobi")) return ALL_COUNTRIES.find((c) => c.code === "KE")!;
    if (tz.includes("Lagos")) return ALL_COUNTRIES.find((c) => c.code === "NG")!;
    if (tz.includes("Johannesburg")) return ALL_COUNTRIES.find((c) => c.code === "ZA")!;
    if (tz.includes("Kampala")) return ALL_COUNTRIES.find((c) => c.code === "UG")!;
    if (tz.includes("Kigali")) return ALL_COUNTRIES.find((c) => c.code === "RW")!;
    if (tz.includes("London")) return ALL_COUNTRIES.find((c) => c.code === "GB")!;
    if (tz.includes("Kolkata")) return ALL_COUNTRIES.find((c) => c.code === "IN")!;
    if (tz.includes("America")) return ALL_COUNTRIES.find((c) => c.code === "US")!;

    const lang = typeof navigator !== "undefined" ? navigator.language || "" : "";
    if (lang.includes("TZ") || lang.includes("sw")) return ALL_COUNTRIES.find((c) => c.code === "TZ")!;
    if (lang.includes("KE")) return ALL_COUNTRIES.find((c) => c.code === "KE")!;
    if (lang.includes("NG")) return ALL_COUNTRIES.find((c) => c.code === "NG")!;
    if (lang.includes("GB")) return ALL_COUNTRIES.find((c) => c.code === "GB")!;
    if (lang.includes("IN")) return ALL_COUNTRIES.find((c) => c.code === "IN")!;
  } catch (e) {
    console.warn("Could not auto detect country:", e);
  }
  // Default fallback to Tanzania or US
  return ALL_COUNTRIES[0]; // TZ (+255) as primary
}

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (fullPhoneNumber: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  onChange,
  placeholder = "712 345 678",
  required = false,
  id = "input-phone",
  disabled = false,
  className = ""
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(autoDetectCountry());
  const [localNumber, setLocalNumber] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse raw value string on change/mount
  useEffect(() => {
    if (!value) {
      setLocalNumber("");
      return;
    }

    const trimmed = value.trim();
    if (trimmed.startsWith("+")) {
      // Find matching dial code (longest first to avoid +1 matching before +1242)
      const sortedCountries = [...ALL_COUNTRIES].sort(
        (a, b) => b.dialCode.length - a.dialCode.length
      );
      const match = sortedCountries.find((c) => trimmed.startsWith(c.dialCode));
      if (match) {
        setSelectedCountry(match);
        const remaining = trimmed.slice(match.dialCode.length).trim();
        setLocalNumber(remaining);
        return;
      }
    }
    // If not starting with + or no match found
    setLocalNumber(trimmed);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch("");

    const full = localNumber.trim()
      ? `${country.dialCode} ${localNumber.trim()}`
      : country.dialCode;
    onChange(full);
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    
    // If user accidentally typed leading dial code or +, clean it up
    if (raw.startsWith(selectedCountry.dialCode)) {
      raw = raw.replace(selectedCountry.dialCode, "").trim();
    } else if (raw.startsWith("+")) {
      raw = raw.replace("+", "").trim();
    }

    setLocalNumber(raw);

    const full = raw.trim() ? `${selectedCountry.dialCode} ${raw.trim()}` : "";
    onChange(full);
  };

  const filteredCountries = ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex items-center w-full bg-slate-50 border border-gray-200 focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-100 rounded-xl transition-all">
        {/* Country Selector Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 border-r border-gray-200 hover:bg-slate-100/80 rounded-l-xl transition-colors cursor-pointer shrink-0 text-xs font-bold text-gray-800"
          title={`Select Country (Current: ${selectedCountry.name} ${selectedCountry.dialCode})`}
          id={`${id}-country-btn`}
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="text-gray-700 font-mono">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </button>

        {/* Local Number Input */}
        <div className="relative flex-1 flex items-center">
          <input
            type="tel"
            id={id}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            value={localNumber}
            onChange={handleLocalNumberChange}
            className="w-full pl-3 pr-3 py-2 bg-transparent text-xs font-semibold text-gray-900 outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* Floating Country Dropdown / Modal */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 max-h-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-fade-in">
          {/* Search Header */}
          <div className="p-2.5 border-b border-gray-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search country or area code (+255, Tanzania...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-indigo-600 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="overflow-y-auto flex-1 p-1 space-y-0.5 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 font-medium">
                No matching country found
              </div>
            ) : (
              filteredCountries.map((c, index) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}-${c.name}-${index}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-950 font-bold"
                        : "hover:bg-slate-50 text-gray-800 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span className="text-base leading-none shrink-0">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-gray-500 font-semibold text-[11px]">
                        {c.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
