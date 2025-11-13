import * as XLSX from 'xlsx';

/**
 * Generate Excel template for bulk site upload
 * Returns buffer that can be downloaded as .xlsx file
 */
export function generateSiteTemplate(): Buffer {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Instructions sheet
  const instructions = [
    ['Project Site Upload Template'],
    [''],
    ['Instructions:'],
    ['1. Fill in the site information in the "Sites" sheet'],
    ['2. Site Name and Address are required fields'],
    ['3. Latitude and Longitude are optional - if not provided, the system will geocode the address automatically'],
    ['4. Save the file and upload it in the project management page'],
    [''],
    ['Column Descriptions:'],
    ['- Site Name: Name of the site/location (e.g., "London Branch Office")'],
    ['- Address: Full street address'],
    ['- City: City name'],
    ['- Postal Code: ZIP/Postal code'],
    ['- Country: Country name (e.g., "United Kingdom", "United States", "UAE")'],
    ['- Latitude: GPS latitude coordinate (optional, e.g., "51.5074")'],
    ['- Longitude: GPS longitude coordinate (optional, e.g., "-0.1278")'],
    ['- Contact Name: On-site contact person'],
    ['- Contact Phone: Phone number for site contact'],
    ['- Contact Email: Email address for site contact'],
    ['- Notes: Any additional information about the site'],
  ];
  
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  
  // Set column widths for instructions
  wsInstructions['!cols'] = [{ wch: 80 }];
  
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
  
  // Sites data sheet with headers and example
  const sitesData = [
    [
      'Site Name',
      'Address',
      'City',
      'Postal Code',
      'Country',
      'Latitude',
      'Longitude',
      'Contact Name',
      'Contact Phone',
      'Contact Email',
      'Notes'
    ],
    [
      'Example Site - London HQ',
      '123 Main Street',
      'London',
      'SW1A 1AA',
      'United Kingdom',
      '51.5074',
      '-0.1278',
      'John Smith',
      '+44 20 1234 5678',
      'john.smith@example.com',
      'Main office building'
    ],
    // Empty rows for data entry
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const wsSites = XLSX.utils.aoa_to_sheet(sitesData);
  
  // Set column widths
  wsSites['!cols'] = [
    { wch: 25 }, // Site Name
    { wch: 35 }, // Address
    { wch: 15 }, // City
    { wch: 12 }, // Postal Code
    { wch: 18 }, // Country
    { wch: 12 }, // Latitude
    { wch: 12 }, // Longitude
    { wch: 20 }, // Contact Name
    { wch: 18 }, // Contact Phone
    { wch: 25 }, // Contact Email
    { wch: 30 }, // Notes
  ];
  
  XLSX.utils.book_append_sheet(wb, wsSites, 'Sites');
  
  // Generate buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer;
}

/**
 * Parse uploaded Excel file and extract site data
 */
export interface ParsedSite {
  siteName: string;
  siteAddress: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}

export interface ParseResult {
  sites: ParsedSite[];
  errors: string[];
}

export function parseSiteUpload(fileBuffer: Buffer): ParseResult {
  const sites: ParsedSite[] = [];
  const errors: string[] = [];
  
  try {
    // Read workbook
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // Get Sites sheet
    const sheetName = wb.SheetNames.find(name => name.toLowerCase() === 'sites') || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    
    if (data.length < 2) {
      errors.push('File must contain at least a header row and one data row');
      return { sites, errors };
    }
    
    // Skip header row and example row
    const dataRows = data.slice(2);
    
    dataRows.forEach((row, index) => {
      const rowNum = index + 3; // Actual row number in Excel (header=1, example=2, data starts at 3)
      
      // Skip empty rows
      if (!row || row.every(cell => !cell || cell === '')) {
        return;
      }
      
      const [
        siteName,
        siteAddress,
        city,
        postalCode,
        country,
        latitude,
        longitude,
        contactName,
        contactPhone,
        contactEmail,
        notes
      ] = row;
      
      // Validate required fields
      if (!siteName || siteName.toString().trim() === '') {
        errors.push(`Row ${rowNum}: Site Name is required`);
        return;
      }
      
      if (!siteAddress || siteAddress.toString().trim() === '') {
        errors.push(`Row ${rowNum}: Address is required`);
        return;
      }
      
      // Validate coordinates if provided (completely optional - will geocode if missing)
      const latStr = latitude ? latitude.toString().trim() : '';
      const lngStr = longitude ? longitude.toString().trim() : '';
      
      // Only validate if there's actual content (not empty/whitespace)
      if (latStr && latStr !== '' && isNaN(parseFloat(latStr))) {
        errors.push(`Row ${rowNum}: Invalid latitude format - must be a number (e.g., 51.5074)`);
        return;
      }
      
      if (lngStr && lngStr !== '' && isNaN(parseFloat(lngStr))) {
        errors.push(`Row ${rowNum}: Invalid longitude format - must be a number (e.g., -0.1278)`);
        return;
      }     
      // Add site
      sites.push({
        siteName: siteName.toString().trim(),
        siteAddress: siteAddress.toString().trim(),
        city: city ? city.toString().trim() : undefined,
        postalCode: postalCode ? postalCode.toString().trim() : undefined,
        country: country ? country.toString().trim() : undefined,
        latitude: latStr || undefined,
        longitude: lngStr || undefined,
        contactName: contactName ? contactName.toString().trim() : undefined,
        contactPhone: contactPhone ? contactPhone.toString().trim() : undefined,
        contactEmail: contactEmail ? contactEmail.toString().trim() : undefined,
        notes: notes ? notes.toString().trim() : undefined,
      });
    });
    
  } catch (error) {
    errors.push(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return { sites, errors };
}

