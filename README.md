# Freight Emissions Calculator

A web application for calculating CO₂e emissions from freight shipments using the Climatiq API.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local`:**
```env
CLIMATIQ_API_KEY=your_api_key_here
```

3. **Run:**
```bash
npm run dev
```

4. **Open:** [http://localhost:3000](http://localhost:3000)

## Features Implemented

**CSV Upload & Parsing**
- Drag-and-drop file upload
- Automatic header detection
- Preview up to 100 rows

**Data Validation**
- Validates all required fields (shipment_id, addresses, mode, weight)
- Inline error highlighting
- Validation summary panel

**Emissions Processing**
- Full Climatiq API integration
- All 4 transport modes (air, sea, road, rail)
- Per-row status tracking with progress indicator
- Real-time CO₂e calculations

**Export**
- CSV export with original data + emissions + status + errors

## Project Structure

```
app/
├── api/emissions/
│   ├── route.ts              # POST /api/emissions - Main endpoint
│   └── factors/route.ts      # GET /api/emissions/factors - Discovery tool
├── components/
│   ├── FileUpload.tsx
│   ├── PreviewTable.tsx
│   ├── StatusBadge.tsx
│   └── Alert.tsx
├── lib/
│   ├── api/calculateEmissions.ts
│   ├── csvParser.ts
│   ├── csvExport.ts
│   └── validation.ts
└── page.tsx
```

## CSV Format

```csv
shipment_id,origin_address,destination_address,mode,weight_kg
SHIP001,"123 Main St, City, Country","456 Oak Ave, City, Country",air,1000.5
```

**Required columns:** `shipment_id`, `origin_address`, `destination_address`, `mode` (air/sea/road/rail), `weight_kg` (> 0)

## API Endpoints

### `POST /api/emissions`
Calculate emissions for a shipment.

**Request:**
```json
{
  "origin_address": "123 Main St",
  "destination_address": "456 Oak Ave",
  "mode": "air",
  "weight_kg": 1000
}
```

### `GET /api/emissions/factors`
Discovery tool to find valid Climatiq `activity_id` values.

## Known Limitations

- Distance hardcoded to 1000 km (geocoding not implemented)
- Results UI (sorting, filtering, summary) not yet implemented
- Inline editing not available (must fix CSV and re-upload)

## Documentation

See **[SUBMISSION.md](./SUBMISSION.md)** for detailed explanation of implementation, decisions, and trade-offs.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- PapaParse (CSV parsing)
- Climatiq API
