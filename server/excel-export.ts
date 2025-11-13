import * as XLSX from 'xlsx';

interface JobExportData {
  [key: string]: string | number | Date | null | undefined;
}

/**
 * Generate Excel file from job data
 * @param jobs Array of job data objects
 * @param filename Base filename without extension
 * @returns Buffer containing Excel file
 */
export function generateExcelExport(jobs: JobExportData[], filename: string): Buffer {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert job data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(jobs);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 10 },  // Job ID
    { wch: 30 },  // Site Name
    { wch: 40 },  // Site Address
    { wch: 25 },  // Client Name
    { wch: 18 },  // Contact Number
    { wch: 18 },  // Status
    { wch: 25 },  // Engineer
    { wch: 15 },  // Scheduled
    { wch: 15 },  // Created
    { wch: 15 },  // Completed
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs Export');
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return excelBuffer;
}

/**
 * Generate CSV from job data
 * @param jobs Array of job data objects
 * @returns CSV string
 */
export function generateCSVExport(jobs: JobExportData[]): string {
  if (jobs.length === 0) return '';
  
  const headers = Object.keys(jobs[0]);
  const csvContent = [
    headers.join(','),
    ...jobs.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

