import { filterInspections, normalizeRows, summarizeInspections } from './inspection-utils.js';

const samplePath = './data/sample_dot_inspections.csv';
const severityStyles = {
  clean: { color: '#1d9a67', radius: 7 },
  minor: { color: '#f0a202', radius: 9 },
  major: { color: '#f97316', radius: 11 },
  critical: { color: '#dc2626', radius: 13 }
};

let allInspections = [];
let map;
let markerLayer;

const elements = {
  fileInput: document.querySelector('#fileInput'),
  loadSample: document.querySelector('#loadSample'),
  fileName: document.querySelector('#fileName'),
  fromDate: document.querySelector('#fromDate'),
  toDate: document.querySelector('#toDate'),
  stateFilter: document.querySelector('#stateFilter'),
  severityFilter: document.querySelector('#severityFilter'),
  carrierFilter: document.querySelector('#carrierFilter'),
  resetFilters: document.querySelector('#resetFilters'),
  summaryCards: document.querySelector('#summaryCards'),
  severityChart: document.querySelector('#severityChart'),
  stateChart: document.querySelector('#stateChart'),
  tableBody: document.querySelector('#inspectionTable tbody'),
  emptyState: document.querySelector('#emptyState'),
  status: document.querySelector('#status'),
  reportTitle: document.querySelector('#reportTitle'),
  topCarriers: document.querySelector('#topCarriers')
};

function initMap() {
  map = L.map('map', { scrollWheelZoom: false }).setView([39.8, -98.6], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

async function loadSampleData() {
  const response = await fetch(samplePath);
  const csv = await response.text();
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  loadRows(parsed.data, 'sample_dot_inspections.csv');
}

async function handleFile(file) {
  if (!file) return;
  const extension = file.name.split('.').pop().toLowerCase();
  const buffer = await file.arrayBuffer();

  if (['xlsx', 'xls'].includes(extension)) {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const firstSheet = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });
    loadRows(rows, file.name);
    return;
  }

  const text = new TextDecoder().decode(buffer);
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  loadRows(parsed.data, file.name);
}

function loadRows(rows, name) {
  allInspections = normalizeRows(rows);
  elements.fileName.textContent = `${name} · ${allInspections.length} înregistrări citite`;
  elements.status.textContent = 'Fișier încărcat. Ajustează perioada, statul sau severitatea pentru raport.';
  populateStateFilter(allInspections);
  setDefaultDateRange(allInspections);
  render();
}

function setDefaultDateRange(inspections) {
  const dates = inspections.map((inspection) => inspection.date).filter(Boolean).sort((a, b) => a - b);
  if (!dates.length) return;
  elements.fromDate.value = dates[0].toISOString().slice(0, 10);
  elements.toDate.value = dates[dates.length - 1].toISOString().slice(0, 10);
}

function populateStateFilter(inspections) {
  const states = [...new Set(inspections.map((inspection) => inspection.state).filter(Boolean))].sort();
  elements.stateFilter.innerHTML = '<option value="">Toate statele</option>';
  states.forEach((state) => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    elements.stateFilter.append(option);
  });
}

function currentFilters() {
  return {
    from: elements.fromDate.value,
    to: elements.toDate.value,
    state: elements.stateFilter.value,
    severity: elements.severityFilter.value,
    carrier: elements.carrierFilter.value
  };
}

function render() {
  const filtered = filterInspections(allInspections, currentFilters());
  const summary = summarizeInspections(filtered);
  const rangeText = [elements.fromDate.value, elements.toDate.value].filter(Boolean).join(' — ') || 'toată perioada';
  elements.reportTitle.textContent = `Raport DOT pentru ${rangeText}`;

  renderSummary(summary);
  renderSeverityChart(summary.bySeverity);
  renderStateChart(summary.byState);
  renderTopCarriers(summary.topCarriers);
  renderTable(filtered);
  renderMap(filtered);
  elements.emptyState.hidden = filtered.length > 0;
}

function renderSummary(summary) {
  const oosRate = summary.total ? Math.round((summary.oos / summary.total) * 100) : 0;
  const cards = [
    ['Inspecții', summary.total, 'în perioada selectată'],
    ['Încălcări', summary.violations, 'total raportat'],
    ['OOS', summary.oos, `${oosRate}% din inspecții`],
    ['Hazmat', summary.hazmat, 'inspecții marcate HM']
  ];

  elements.summaryCards.innerHTML = cards.map(([label, value, note]) => `
    <article class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `).join('');
}

function renderSeverityChart(bySeverity) {
  const labels = [
    ['clean', 'Curat'],
    ['minor', 'Minor'],
    ['major', 'Major'],
    ['critical', 'Critic']
  ];
  const max = Math.max(1, ...labels.map(([key]) => bySeverity[key] ?? 0));
  elements.severityChart.innerHTML = labels.map(([key, label]) => {
    const value = bySeverity[key] ?? 0;
    const width = Math.max(4, Math.round((value / max) * 100));
    return `<div class="bar-row"><span>${label}</span><div><i style="width:${width}%;background:${severityStyles[key].color}"></i></div><strong>${value}</strong></div>`;
  }).join('');
}

function renderStateChart(byState) {
  const entries = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  elements.stateChart.innerHTML = entries.length ? entries.map(([state, value]) => {
    const width = Math.max(4, Math.round((value / max) * 100));
    return `<div class="bar-row"><span>${state}</span><div><i style="width:${width}%"></i></div><strong>${value}</strong></div>`;
  }).join('') : '<p class="muted">Nu există date pentru filtrele curente.</p>';
}

function renderTopCarriers(carriers) {
  elements.topCarriers.innerHTML = carriers.length ? carriers.map((item) => `
    <li><span>${escapeHtml(item.carrier)}</span><strong>${item.count}</strong></li>
  `).join('') : '<li class="muted">Nicio companie în interval.</li>';
}

function renderTable(inspections) {
  elements.tableBody.innerHTML = inspections.slice(0, 100).map((inspection) => `
    <tr>
      <td>${inspection.dateLabel}</td>
      <td>${escapeHtml([inspection.city, inspection.state].filter(Boolean).join(', '))}</td>
      <td>${escapeHtml(inspection.carrier)}</td>
      <td>${escapeHtml(inspection.usdot || '—')}</td>
      <td>${escapeHtml(inspection.level)}</td>
      <td>${inspection.violations}</td>
      <td><span class="pill ${inspection.classification.code}">${inspection.classification.label}</span></td>
    </tr>
  `).join('');
}

function renderMap(inspections) {
  markerLayer.clearLayers();
  const bounds = [];

  inspections.forEach((inspection, index) => {
    if (!Number.isFinite(inspection.latitude) || !Number.isFinite(inspection.longitude)) return;
    const style = severityStyles[inspection.classification.code];
    const jitter = inspection.hasExactCoordinates ? [0, 0] : [((index % 5) - 2) * 0.18, ((index % 7) - 3) * 0.18];
    const latLng = [inspection.latitude + jitter[0], inspection.longitude + jitter[1]];
    bounds.push(latLng);
    L.circleMarker(latLng, {
      radius: style.radius,
      color: '#ffffff',
      weight: 2,
      fillColor: style.color,
      fillOpacity: 0.86
    }).bindPopup(`
      <strong>${escapeHtml(inspection.carrier)}</strong><br>
      ${inspection.dateLabel} · ${escapeHtml(inspection.city || inspection.state)}<br>
      ${escapeHtml(inspection.level)}<br>
      ${inspection.violations} încălcări · ${inspection.classification.label}
    `).addTo(markerLayer);
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 7 });
  } else {
    map.setView([39.8, -98.6], 4);
  }
}

function resetFilters() {
  elements.stateFilter.value = '';
  elements.severityFilter.value = '';
  elements.carrierFilter.value = '';
  setDefaultDateRange(allInspections);
  render();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function bindEvents() {
  elements.fileInput.addEventListener('change', (event) => handleFile(event.target.files[0]));
  elements.loadSample.addEventListener('click', loadSampleData);
  elements.resetFilters.addEventListener('click', resetFilters);
  [elements.fromDate, elements.toDate, elements.stateFilter, elements.severityFilter, elements.carrierFilter]
    .forEach((element) => element.addEventListener('input', render));
}

initMap();
bindEvents();
loadSampleData();
