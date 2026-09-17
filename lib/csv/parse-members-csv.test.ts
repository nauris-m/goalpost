import { describe, expect, it } from 'vitest';
import { parseMembersCsv } from './parse-members-csv';

describe('parseMembersCsv', () => {
  it('parses a well-formed CSV with name/email/title columns', () => {
    const csv = 'name,email,title\nAlex Morgan,alex@example.com,Product Manager\nPriya Shah,priya@example.com,Engineer';
    const result = parseMembersCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toEqual([
      { name: 'Alex Morgan', email: 'alex@example.com', title: 'Product Manager' },
      { name: 'Priya Shah', email: 'priya@example.com', title: 'Engineer' },
    ]);
  });

  it('accepts header aliases and any column order', () => {
    const csv = 'Role,Full Name,Email Address\nEngineer,Priya Shah,priya@example.com';
    const result = parseMembersCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toEqual([{ name: 'Priya Shah', email: 'priya@example.com', title: 'Engineer' }]);
  });

  it('defaults title to empty string when the column is absent', () => {
    const csv = 'name,email\nAlex Morgan,alex@example.com';
    const result = parseMembersCsv(csv);
    expect(result.rows).toEqual([{ name: 'Alex Morgan', email: 'alex@example.com', title: '' }]);
  });

  it('handles quoted fields containing commas', () => {
    const csv = 'name,email,title\n"Morgan, Alex",alex@example.com,"Manager, Product"';
    const result = parseMembersCsv(csv);
    expect(result.rows).toEqual([{ name: 'Morgan, Alex', email: 'alex@example.com', title: 'Manager, Product' }]);
  });

  it('skips rows missing a name or email and reports why', () => {
    const csv = 'name,email\n,missing-name@example.com\nMissing Email,\nGood Row,good@example.com';
    const result = parseMembersCsv(csv);
    expect(result.rows).toEqual([{ name: 'Good Row', email: 'good@example.com', title: '' }]);
    expect(result.errors).toEqual(['Row 2: missing name, skipped.', 'Row 3: missing email, skipped.']);
  });

  it('skips rows with an invalid-looking email', () => {
    const csv = 'name,email\nBad Email,not-an-email\nGood Row,good@example.com';
    const result = parseMembersCsv(csv);
    expect(result.rows).toEqual([{ name: 'Good Row', email: 'good@example.com', title: '' }]);
    expect(result.errors).toEqual(['Row 2: "not-an-email" doesn\'t look like an email, skipped.']);
  });

  it('ignores blank lines', () => {
    const csv = 'name,email\n\nAlex Morgan,alex@example.com\n\n';
    const result = parseMembersCsv(csv);
    expect(result.rows).toEqual([{ name: 'Alex Morgan', email: 'alex@example.com', title: '' }]);
  });

  it('errors when required columns are missing', () => {
    const csv = 'foo,bar\n1,2';
    const result = parseMembersCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toEqual(['The CSV must have "name" and "email" columns.']);
  });

  it('errors on an empty file', () => {
    const result = parseMembersCsv('');
    expect(result.errors).toEqual(['The file is empty.']);
  });
});
