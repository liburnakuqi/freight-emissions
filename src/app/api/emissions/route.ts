import { NextRequest, NextResponse } from 'next/server';

export type TransportMode = 'air' | 'sea' | 'road' | 'rail';

/**
 * Emission factor activity_ids for Climatiq /estimate endpoint
 * Reference: https://www.postman.com/climatiq/climatiq/request/s0a7p87/with-activity-id
 */
export const EMISSION_FACTOR_IDS: Record<TransportMode, string> = {
  air: 'freight_flight-route_type_na',
  sea: 'freight_sea-vessel_type_na',
  road: 'freight_vehicle-vehicle_type_hgv-fuel_source_na-distance_na-weight_or_capacity_na',
  rail: 'freight_train-route_type_na',
};


/**
 * POST /api/emissions
 * Calls Climatiq /estimate with activity_id selector
 * Reference: https://www.postman.com/climatiq/climatiq/request/s0a7p87/with-activity-id
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.CLIMATIQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'CLIMATIQ_API_KEY not found' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { origin_address, destination_address, mode, weight_kg } = body;

    console.log('Received request:', { origin_address, destination_address, mode, weight_kg });

    if (!origin_address || !destination_address || !mode || weight_kg === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: origin_address, destination_address, mode, weight_kg' },
        { status: 400 }
      );
    }

    const weight = typeof weight_kg === 'string' ? parseFloat(weight_kg) : weight_kg;
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json({ error: 'weight_kg must be a positive number' }, { status: 400 });
    }

    const normalizedMode = mode.toLowerCase() as TransportMode;
    const validModes: TransportMode[] = ['air', 'sea', 'road', 'rail'];
    if (!validModes.includes(normalizedMode)) {
      return NextResponse.json({ error: `Invalid mode: ${mode}. Must be one of: ${validModes.join(', ')}` }, { status: 400 });
    }

    const activityId = EMISSION_FACTOR_IDS[normalizedMode];

    const climatiqPayload = {
      emission_factor: {
        activity_id: activityId,
        data_version: '^21',
      },
      parameters: {
        weight: weight,
        distance: 1000,
        weight_unit: 'kg',
        distance_unit: 'km',
      },
    };

    console.log('Climatiq payload:', JSON.stringify(climatiqPayload));

    const res = await fetch('https://api.climatiq.io/estimate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(climatiqPayload),
    });

    const data = await res.json();
    console.log('Climatiq response:', res.status, JSON.stringify(data));

    if (res.ok && data.co2e !== undefined) {
      return NextResponse.json({
        success: true,
        co2e_kg: data.co2e,
        co2e_unit: data.co2e_unit,
        mode,
        weight_kg: weight,
        activity_id: activityId,
      });
    }

    return NextResponse.json({
      success: false,
      error: data?.message || data?.error || 'Climatiq request failed',
      climatiq_status: res.status,
      activity_id: activityId,
      details: data,
    }, { status: res.status >= 400 ? res.status : 502 });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
