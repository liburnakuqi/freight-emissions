import Papa from 'papaparse';

export type ShipmentRow = {
  shipment_id: string;
  origin_address: string;
  destination_address: string;
  mode: string;
  weight_kg: string;
};

export function parseCSV(file: File): Promise<ShipmentRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.slice(0, 100) as ShipmentRow[];
        resolve(rows);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
