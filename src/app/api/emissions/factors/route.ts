import { NextResponse } from 'next/server';

/**
 * GET endpoint — search for first working activity_id per mode
 * Uses search to find IDs, then tests each against /estimate
 */
export async function GET() {
  const apiKey = process.env.CLIMATIQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'CLIMATIQ_API_KEY not found' }, { status: 500 });
  }

  const modeQueries: Record<string, string> = {
    air: 'freight flight',
    sea: 'freight sea',
    road: 'freight vehicle',
    rail: 'freight train',
  };

  const results: Record<string, any> = {};

  for (const [mode, query] of Object.entries(modeQueries)) {

    const searchUrl = `https://api.climatiq.io/data/v1/search?query=${encodeURIComponent(query)}&data_version=^6&results_per_page=10&unit_type=WeightOverDistance`;

    const searchRes = await fetch(searchUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    const searchData = await searchRes.json();
    const candidates = searchData?.results || [];

    for (const candidate of candidates) {
      const activityId = candidate.activity_id;

      const payload = {
        emission_factor: { activity_id: activityId, data_version: '^6' },
        parameters: { weight: 1, distance: 100, weight_unit: 't', distance_unit: 'km' },
      };

      const estRes = await fetch('https://api.climatiq.io/estimate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const estData = await estRes.json();

      if (estRes.ok && estData.co2e !== undefined) {
        results[mode] = {
          activity_id: activityId,
          name: candidate.name,
          source: candidate.source,
          region: candidate.region,
          co2e_test: estData.co2e,
          co2e_unit: estData.co2e_unit,
        };
        break;
      }
    }

    if (!results[mode]) {
      results[mode] = { error: 'No working activity_id found', candidates_tested: candidates.length };
    }
  }

  const ids: Record<string, string | null> = {
    air: results.air?.activity_id || null,
    sea: results.sea?.activity_id || null,
    road: results.road?.activity_id || null,
    rail: results.rail?.activity_id || null,
  };

  return NextResponse.json({ results, recommended_ids: ids });
}
