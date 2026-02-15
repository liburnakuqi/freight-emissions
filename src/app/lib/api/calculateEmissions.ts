import { ShipmentRow } from '../csvParser';

export type EmissionsResult = {
  success: boolean;
  co2e_kg?: number;
  error?: string;
};

export async function calculateEmissions(
  shipment: ShipmentRow
): Promise<EmissionsResult> {
  try {
    const response = await fetch('/api/emissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin_address: shipment.origin_address,
        destination_address: shipment.destination_address,
        mode: shipment.mode,
        weight_kg: parseFloat(shipment.weight_kg),
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        co2e_kg: result.co2e_kg,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Unknown error',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to process',
    };
  }
}
