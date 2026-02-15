import { ShipmentRow } from './csvParser';

export type ValidationError = {
  row: number;
  field: string;
  message: string;
};

export function validateRow(row: ShipmentRow, index: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!row.shipment_id || row.shipment_id.trim() === '') {
    errors.push({ row: index, field: 'shipment_id', message: 'Missing shipment ID' });
  }

  if (!row.origin_address || row.origin_address.trim() === '') {
    errors.push({ row: index, field: 'origin_address', message: 'Missing origin address' });
  }

  if (!row.destination_address || row.destination_address.trim() === '') {
    errors.push({ row: index, field: 'destination_address', message: 'Missing destination address' });
  }

  const validModes = ['air', 'sea', 'road', 'rail'];
  if (!row.mode || !validModes.includes(row.mode.toLowerCase())) {
    errors.push({ row: index, field: 'mode', message: `Invalid mode. Must be one of: ${validModes.join(', ')}` });
  }

  const weight = parseFloat(row.weight_kg);
  if (isNaN(weight) || weight <= 0) {
    errors.push({ row: index, field: 'weight_kg', message: 'Weight must be a positive number' });
  }

  return errors;
}

export function validateAll(rows: ShipmentRow[]): ValidationError[] {
  const allErrors: ValidationError[] = [];
  
  rows.forEach((row, index) => {
    const errors = validateRow(row, index);
    allErrors.push(...errors);
  });

  return allErrors;
}
