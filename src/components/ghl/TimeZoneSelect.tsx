import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TimeZoneSelectProps {
  value: string;
  onChange: (value: string) => void;
}

type RegionType = keyof typeof TIMEZONES;
type TimezonesType = typeof TIMEZONES;

// Full list of IANA timezones by region
const TIMEZONES = {
  'America': [
    'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua',
    'America/Araguaina', 'America/Argentina/Buenos_Aires', 'America/Argentina/Catamarca',
    'America/Argentina/Cordoba', 'America/Argentina/Jujuy', 'America/Argentina/La_Rioja',
    'America/Argentina/Mendoza', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta',
    'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman',
    'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Atikokan',
    'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem',
    'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota',
    'America/Boise', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun',
    'America/Caracas', 'America/Cayenne', 'America/Chicago', 'America/Chihuahua',
    'America/Costa_Rica', 'America/Creston', 'America/Cuiaba', 'America/Curacao',
    'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver',
    'America/Detroit', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador',
    'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay', 'America/Goose_Bay',
    'America/Grand_Turk', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana',
    'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Indianapolis',
    'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg',
    'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes',
    'America/Indiana/Winamac', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica',
    'America/Juneau', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello',
    'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Maceio',
    'America/Managua', 'America/Manaus', 'America/Martinique', 'America/Matamoros',
    'America/Mazatlan', 'America/Menominee', 'America/Merida', 'America/Metlakatla',
    'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey',
    'America/Montevideo', 'America/Montreal', 'America/Montserrat', 'America/Nassau',
    'America/New_York', 'America/Nipigon', 'America/Nome', 'America/Noronha',
    'America/North_Dakota/Beulah', 'America/North_Dakota/Center',
    'America/North_Dakota/New_Salem', 'America/Nuuk', 'America/Ojinaga', 'America/Panama',
    'America/Pangnirtung', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince',
    'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas',
    'America/Rainy_River', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina',
    'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago',
    'America/Santo_Domingo', 'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka',
    'America/St_Johns', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule',
    'America/Thunder_Bay', 'America/Tijuana', 'America/Toronto', 'America/Vancouver',
    'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'America/Yellowknife'
  ],
  'Europe': [
    'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens',
    'Europe/Belgrade', 'Europe/Berlin', 'Europe/Brussels', 'Europe/Bucharest',
    'Europe/Budapest', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin',
    'Europe/Gibraltar', 'Europe/Helsinki', 'Europe/Istanbul', 'Europe/Kaliningrad',
    'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/London', 'Europe/Luxembourg',
    'Europe/Madrid', 'Europe/Malta', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow',
    'Europe/Oslo', 'Europe/Paris', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome',
    'Europe/Samara', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Sofia',
    'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk',
    'Europe/Uzhgorod', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd',
    'Europe/Warsaw', 'Europe/Zaporozhye', 'Europe/Zurich'
  ],
  'Asia': [
    'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe',
    'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Baku', 'Asia/Bangkok',
    'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Chita',
    'Asia/Choibalsan', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili',
    'Asia/Dubai', 'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron',
    'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta',
    'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi',
    'Asia/Kathmandu', 'Asia/Khandyga', 'Asia/Kolkata', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur',
    'Asia/Kuching', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila',
    'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral',
    'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qostanay', 'Asia/Qyzylorda',
    'Asia/Riyadh', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai',
    'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi',
    'Asia/Tehran', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar',
    'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yangon',
    'Asia/Yekaterinburg', 'Asia/Yerevan'
  ],
  'Australia': [
    'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill',
    'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman',
    'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney'
  ],
  'Pacific': [
    'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham',
    'Pacific/Chuuk', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury',
    'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos',
    'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu',
    'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro',
    'Pacific/Marquesas', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk',
    'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn',
    'Pacific/Pohnpei', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Tahiti',
    'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Wake', 'Pacific/Wallis'
  ],
  'Africa': [
    'Africa/Abidjan', 'Africa/Accra', 'Africa/Algiers', 'Africa/Bissau',
    'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/El_Aaiun',
    'Africa/Johannesburg', 'Africa/Juba', 'Africa/Khartoum', 'Africa/Lagos',
    'Africa/Maputo', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena',
    'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek'
  ],
  'Indian': [
    'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos',
    'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives',
    'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion'
  ],
  'Atlantic': [
    'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde',
    'Atlantic/Faroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia',
    'Atlantic/Stanley'
  ],
  'Antarctica': [
    'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville',
    'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/Palmer',
    'Antarctica/Rothera', 'Antarctica/Syowa', 'Antarctica/Troll',
    'Antarctica/Vostok'
  ]
};

export function TimeZoneSelect({ value, onChange }: TimeZoneSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedTimezones = searchQuery.trim() === '' 
    ? TIMEZONES 
    : Object.entries(TIMEZONES).reduce<TimezonesType>((acc, [region, zones]) => {
        const filteredZones = zones.filter(zone =>
          zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
          region.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredZones.length > 0) {
          acc[region as RegionType] = filteredZones;
        }
        return acc;
      }, {} as TimezonesType);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative flex">
        <input
          type="text"
          value={searchQuery || value.replace(/_/g, ' ')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          placeholder="Select your timezone"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md cursor-text"
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchQuery('');
          }}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-gray-600"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {Object.entries(displayedTimezones).map(([region, zones]) => (
            <div key={region}>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                {region}
              </div>
              {zones.map((zone) => (
                <div
                  key={zone}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                    value === zone ? 'bg-indigo-50 text-indigo-600' : 'text-gray-900'
                  }`}
                  onClick={() => {
                    onChange(zone);
                    setSearchQuery('');
                    setIsOpen(false);
                  }}
                >
                  {zone.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          ))}
          {Object.keys(displayedTimezones).length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No timezones found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
