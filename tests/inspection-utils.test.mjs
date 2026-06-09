import assert from 'node:assert/strict';
import {
  classifyInspection,
  filterInspections,
  normalizeRows,
  parseDate,
  summarizeInspections
} from '../src/inspection-utils.js';

const rows = [
  {
    'Inspection Date': '2026-01-10',
    State: 'Texas',
    City: 'Austin',
    'Carrier Name': 'Alpha Freight',
    'USDOT Number': '1001',
    'Inspection Level': 'Level I',
    Violations: '0',
    'Out of Service': 'No'
  },
  {
    'Inspection Date': '2026-02-20',
    State: 'CA',
    City: 'Fresno',
    'Carrier Name': 'Beta Logistics',
    'USDOT Number': '1002',
    'Inspection Level': 'II',
    Result: 'Violation',
    Violations: '3',
    'Out of Service': 'No'
  },
  {
    'Inspection Date': '2026-03-15',
    State: 'Florida',
    City: 'Tampa',
    'Carrier Name': 'Gamma Carriers',
    'USDOT Number': '1003',
    'Inspection Level': 'III',
    Result: 'Out of Service',
    Violations: '1',
    'Out of Service': 'Yes'
  }
];

assert.equal(parseDate('02/20/2026')?.toISOString().slice(0, 10), '2026-02-20');
assert.equal(parseDate(46072)?.toISOString().slice(0, 10), '2026-02-19');
assert.equal(classifyInspection({ violations: 0, oos: 'No' }).code, 'clean');
assert.equal(classifyInspection({ violations: 2, oos: 'No' }).code, 'minor');
assert.equal(classifyInspection({ violations: 3, oos: 'No' }).code, 'major');
assert.equal(classifyInspection({ violations: 1, oos: 'Yes' }).code, 'critical');

const normalized = normalizeRows(rows);
assert.equal(normalized.length, 3);
assert.equal(normalized[0].state, 'TX');
assert.equal(normalized[1].level, 'Level II - Walk-Around');
assert.equal(normalized[2].classification.code, 'critical');
assert.ok(Number.isFinite(normalized[0].latitude), 'state centroid latitude should be provided when exact coordinates are missing');

const filtered = filterInspections(normalized, { from: '2026-02-01', to: '2026-03-01', severity: 'major' });
assert.equal(filtered.length, 1);
assert.equal(filtered[0].carrier, 'Beta Logistics');

const summary = summarizeInspections(normalized);
assert.deepEqual(summary.bySeverity, { clean: 1, minor: 0, major: 1, critical: 1 });
assert.equal(summary.total, 3);
assert.equal(summary.oos, 1);
assert.equal(summary.byState.TX, 1);

console.log('inspection-utils tests passed');
