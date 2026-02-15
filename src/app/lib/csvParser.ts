import Papa from 'papaparse';

export type ShipmentRow = {
  shipment_id: string;
  origin_address: string;
  destination_address: string;
  mode: string;
  weight_kg: string;
};

export type ParseResult = {
  rows: ShipmentRow[];
  totalRows: number;
};

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || !Array.isArray(results.data)) {
          reject(new Error('Invalid CSV format: no data found'));
          return;
        }

        const allRows = results.data.filter((row: any) => {
          // Filter out empty rows
          return row && Object.keys(row).length > 0;
        }) as ShipmentRow[];

        if (allRows.length === 0) {
          reject(new Error('CSV file is empty or contains no valid rows'));
          return;
        }

        const totalRows = allRows.length;
        const rows = allRows.slice(0, 100);
        resolve({ rows, totalRows });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message || 'Unknown error'}`));
      },
    });
  });
}
