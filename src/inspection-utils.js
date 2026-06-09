const STATE_CENTROIDS = {
  AL: [32.806671, -86.79113], AK: [61.370716, -152.404419], AZ: [33.729759, -111.431221], AR: [34.969704, -92.373123],
  CA: [36.116203, -119.681564], CO: [39.059811, -105.311104], CT: [41.597782, -72.755371], DE: [39.318523, -75.507141],
  FL: [27.766279, -81.686783], GA: [33.040619, -83.643074], HI: [21.094318, -157.498337], ID: [44.240459, -114.478828],
  IL: [40.349457, -88.986137], IN: [39.849426, -86.258278], IA: [42.011539, -93.210526], KS: [38.5266, -96.726486],
  KY: [37.66814, -84.670067], LA: [31.169546, -91.867805], ME: [44.693947, -69.381927], MD: [39.063946, -76.802101],
  MA: [42.230171, -71.530106], MI: [43.326618, -84.536095], MN: [45.694454, -93.900192], MS: [32.741646, -89.678696],
  MO: [38.456085, -92.288368], MT: [46.921925, -110.454353], NE: [41.12537, -98.268082], NV: [38.313515, -117.055374],
  NH: [43.452492, -71.563896], NJ: [40.298904, -74.521011], NM: [34.840515, -106.248482], NY: [42.165726, -74.948051],
  NC: [35.630066, -79.806419], ND: [47.528912, -99.784012], OH: [40.388783, -82.764915], OK: [35.565342, -96.928917],
  OR: [44.572021, -122.070938], PA: [40.590752, -77.209755], RI: [41.680893, -71.51178], SC: [33.856892, -80.945007],
  SD: [44.299782, -99.438828], TN: [35.747845, -86.692345], TX: [31.054487, -97.563461], UT: [40.150032, -111.862434],
  VT: [44.045876, -72.710686], VA: [37.769337, -78.169968], WA: [47.400902, -121.490494], WV: [38.491226, -80.954453],
  WI: [44.268543, -89.616508], WY: [42.755966, -107.30249], DC: [38.9072, -77.0369]
};

const STATE_NAMES = {
  ALABAMA: 'AL', ALASKA: 'AK', ARIZONA: 'AZ', ARKANSAS: 'AR', CALIFORNIA: 'CA', COLORADO: 'CO', CONNECTICUT: 'CT', DELAWARE: 'DE',
  FLORIDA: 'FL', GEORGIA: 'GA', HAWAII: 'HI', IDAHO: 'ID', ILLINOIS: 'IL', INDIANA: 'IN', IOWA: 'IA', KANSAS: 'KS', KENTUCKY: 'KY',
  LOUISIANA: 'LA', MAINE: 'ME', MARYLAND: 'MD', MASSACHUSETTS: 'MA', MICHIGAN: 'MI', MINNESOTA: 'MN', MISSISSIPPI: 'MS', MISSOURI: 'MO',
  MONTANA: 'MT', NEBRASKA: 'NE', NEVADA: 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
  'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', OHIO: 'OH', OKLAHOMA: 'OK', OREGON: 'OR', PENNSYLVANIA: 'PA', 'RHODE ISLAND': 'RI',
  'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD', TENNESSEE: 'TN', TEXAS: 'TX', UTAH: 'UT', VERMONT: 'VT', VIRGINIA: 'VA', WASHINGTON: 'WA',
  'WEST VIRGINIA': 'WV', WISCONSIN: 'WI', WYOMING: 'WY', 'DISTRICT OF COLUMBIA': 'DC'
};

const FIELD_ALIASES = {
  date: ['inspection date', 'date', 'insp date', 'inspection_date', 'inspectiondate'],
  state: ['state', 'inspection state', 'insp state', 'location state', 'us state'],
  city: ['city', 'inspection city', 'location city'],
  latitude: ['latitude', 'lat'],
  longitude: ['longitude', 'lng', 'lon', 'long'],
  carrier: ['carrier', 'carrier name', 'company', 'motor carrier'],
  usdot: ['usdot', 'usdot number', 'dot number'],
  unit: ['unit', 'truck', 'vehicle', 'vin', 'plate'],
  level: ['inspection level', 'level', 'insp level'],
  result: ['result', 'inspection result', 'status'],
  violations: ['violations', 'violation count', 'num violations', 'total violations'],
  oos: ['oos', 'out of service', 'out-of-service', 'out_of_service'],
  hazmat: ['hazmat', 'hm', 'hazardous material']
};

const LEVEL_LABELS = {
  '1': 'Level I - Full', I: 'Level I - Full', 'LEVEL I': 'Level I - Full', FULL: 'Level I - Full',
  '2': 'Level II - Walk-Around', II: 'Level II - Walk-Around', 'LEVEL II': 'Level II - Walk-Around',
  '3': 'Level III - Driver', III: 'Level III - Driver', 'LEVEL III': 'Level III - Driver',
  '4': 'Level IV - Special', IV: 'Level IV - Special', 'LEVEL IV': 'Level IV - Special',
  '5': 'Level V - Vehicle', V: 'Level V - Vehicle', 'LEVEL V': 'Level V - Vehicle',
  '6': 'Level VI - Radioactive', VI: 'Level VI - Radioactive', 'LEVEL VI': 'Level VI - Radioactive'
};

export { FIELD_ALIASES, STATE_CENTROIDS };

export function canonicalHeader(header) {
  return String(header ?? '').trim().toLowerCase().replace(/[._-]+/g, ' ').replace(/\s+/g, ' ');
}

export function buildColumnMap(headers) {
  const normalized = new Map(headers.map((header) => [canonicalHeader(header), header]));
  const map = {};

  Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
    const match = aliases.find((alias) => normalized.has(canonicalHeader(alias)));
    if (match) {
      map[field] = normalized.get(canonicalHeader(match));
    }
  });

  return map;
}

export function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    return new Date(excelEpoch + value * 86400000);
  }

  const text = String(value ?? '').trim();
  if (!text) return null;

  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const [, first, second, rawYear] = match;
    const year = rawYear.length === 2 ? Number(`20${rawYear}`) : Number(rawYear);
    const month = Number(first) > 12 ? Number(second) - 1 : Number(first) - 1;
    const day = Number(first) > 12 ? Number(first) : Number(second);
    return new Date(Date.UTC(year, month, day));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

export function normalizeState(value) {
  const text = String(value ?? '').trim().toUpperCase();
  if (!text) return '';
  if (STATE_CENTROIDS[text]) return text;
  return STATE_NAMES[text] ?? text.slice(0, 2);
}

export function toNumber(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  const text = String(value ?? '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'da', 'oos', 'out of service', 'out-of-service'].includes(text);
}

export function normalizeLevel(value) {
  const text = String(value ?? '').trim().toUpperCase();
  return LEVEL_LABELS[text] ?? (text ? `Level ${text}` : 'Nespecificat');
}

export function classifyInspection(inspection) {
  const result = String(inspection.result ?? '').toLowerCase();
  const violations = toNumber(inspection.violations);
  const hasOos = toBoolean(inspection.oos) || /out|fail|oos|unsat|invalid/.test(result);

  if (hasOos) {
    return {
      code: 'critical',
      label: 'Critic / Out-of-Service',
      score: 100,
      description: 'Inspecție cu OOS sau rezultat nefavorabil; necesită atenție imediată.'
    };
  }

  if (violations >= 3) {
    return {
      code: 'major',
      label: 'Major',
      score: 70,
      description: 'Trei sau mai multe încălcări raportate.'
    };
  }

  if (violations > 0) {
    return {
      code: 'minor',
      label: 'Minor',
      score: 40,
      description: 'Încălcări prezente, fără OOS.'
    };
  }

  return {
    code: 'clean',
    label: 'Curat',
    score: 10,
    description: 'Fără încălcări sau OOS înregistrate.'
  };
}

export function normalizeRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const columnMap = buildColumnMap(headers);

  return rows.map((row, index) => {
    const get = (field) => (columnMap[field] ? row[columnMap[field]] : undefined);
    const state = normalizeState(get('state'));
    const classification = classifyInspection({
      violations: get('violations'),
      oos: get('oos'),
      result: get('result')
    });
    const date = parseDate(get('date'));
    const latitude = toNumber(get('latitude'), Number.NaN);
    const longitude = toNumber(get('longitude'), Number.NaN);
    const centroid = STATE_CENTROIDS[state];

    return {
      id: `${index + 1}`,
      raw: row,
      date,
      dateLabel: date ? date.toISOString().slice(0, 10) : 'Dată lipsă',
      state,
      city: String(get('city') ?? '').trim(),
      latitude: Number.isFinite(latitude) ? latitude : centroid?.[0],
      longitude: Number.isFinite(longitude) ? longitude : centroid?.[1],
      hasExactCoordinates: Number.isFinite(latitude) && Number.isFinite(longitude),
      carrier: String(get('carrier') ?? 'Transportator necunoscut').trim() || 'Transportator necunoscut',
      usdot: String(get('usdot') ?? '').trim(),
      unit: String(get('unit') ?? '').trim(),
      level: normalizeLevel(get('level')),
      result: String(get('result') ?? '').trim(),
      violations: toNumber(get('violations')),
      oos: toBoolean(get('oos')),
      hazmat: toBoolean(get('hazmat')),
      classification
    };
  }).filter((row) => row.date || row.state || row.carrier !== 'Transportator necunoscut');
}

export function filterInspections(inspections, filters = {}) {
  const from = filters.from ? parseDate(filters.from) : null;
  const to = filters.to ? parseDate(filters.to) : null;
  const state = normalizeState(filters.state);
  const severity = filters.severity ?? '';
  const carrier = String(filters.carrier ?? '').trim().toLowerCase();

  return inspections.filter((inspection) => {
    if (from && inspection.date && inspection.date < from) return false;
    if (to && inspection.date && inspection.date > to) return false;
    if (state && inspection.state !== state) return false;
    if (severity && inspection.classification.code !== severity) return false;
    if (carrier && !inspection.carrier.toLowerCase().includes(carrier)) return false;
    return true;
  });
}

export function summarizeInspections(inspections) {
  const summary = {
    total: inspections.length,
    violations: 0,
    oos: 0,
    hazmat: 0,
    bySeverity: { clean: 0, minor: 0, major: 0, critical: 0 },
    byState: {},
    byLevel: {},
    topCarriers: []
  };
  const carrierCounts = {};

  inspections.forEach((inspection) => {
    summary.violations += inspection.violations;
    if (inspection.oos || inspection.classification.code === 'critical') summary.oos += 1;
    if (inspection.hazmat) summary.hazmat += 1;
    summary.bySeverity[inspection.classification.code] += 1;
    if (inspection.state) summary.byState[inspection.state] = (summary.byState[inspection.state] ?? 0) + 1;
    summary.byLevel[inspection.level] = (summary.byLevel[inspection.level] ?? 0) + 1;
    carrierCounts[inspection.carrier] = (carrierCounts[inspection.carrier] ?? 0) + 1;
  });

  summary.topCarriers = Object.entries(carrierCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([carrier, count]) => ({ carrier, count }));

  return summary;
}
