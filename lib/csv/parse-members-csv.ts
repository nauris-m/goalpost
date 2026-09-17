export interface ParsedMemberRow {
  readonly name: string;
  readonly email: string;
  readonly title: string;
}

export interface ParseMembersCsvResult {
  readonly rows: readonly ParsedMemberRow[];
  readonly errors: readonly string[];
}

const NAME_ALIASES = ['name', 'full name', 'employee name'];
const EMAIL_ALIASES = ['email', 'email address'];
const TITLE_ALIASES = ['title', 'role', 'position', 'job title'];

/** Splits one CSV line into fields, honoring double-quoted fields with "" as an escaped quote. */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

function findColumn(header: readonly string[], aliases: readonly string[]): number {
  return header.findIndex((col) => aliases.includes(col.trim().toLowerCase()));
}

/**
 * Parses a CSV of employees to invite - expects a header row with `name`/`email` columns
 * (and an optional `title`/`role`/`position` column), in any order. Rows missing a name or
 * email are reported as errors and skipped rather than aborting the whole import.
 */
export function parseMembersCsv(text: string): ParseMembersCsvResult {
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { rows: [], errors: ['The file is empty.'] };

  const header = splitCsvLine(lines[0]);
  const nameCol = findColumn(header, NAME_ALIASES);
  const emailCol = findColumn(header, EMAIL_ALIASES);
  const titleCol = findColumn(header, TITLE_ALIASES);

  if (nameCol === -1 || emailCol === -1) {
    return { rows: [], errors: ['The CSV must have "name" and "email" columns.'] };
  }

  const rows: ParsedMemberRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i]);
    const name = fields[nameCol]?.trim() ?? '';
    const email = fields[emailCol]?.trim() ?? '';
    const title = titleCol >= 0 ? (fields[titleCol]?.trim() ?? '') : '';
    const rowNumber = i + 1;

    if (!name || !email) {
      errors.push(`Row ${rowNumber}: missing ${!name ? 'name' : 'email'}, skipped.`);
      continue;
    }
    if (!email.includes('@')) {
      errors.push(`Row ${rowNumber}: "${email}" doesn't look like an email, skipped.`);
      continue;
    }

    rows.push({ name, email, title });
  }

  return { rows, errors };
}
