# Submission Summary: Freight Emissions Calculator

## Overview

This document explains what was implemented, what wasn't, and the approach taken to solve the Climatiq API integration challenge.

---

## What Was Implemented

### Core Requirements

1. **CSV Upload & Preview**
   - File upload with drag-and-drop
   - Automatic header detection
   - Preview limited to 100 rows with total count

2. **Validation & Editing**
   - Comprehensive validation (shipment_id, addresses, mode, weight)
   - Inline error highlighting in table
   - Validation summary panel with all errors

3. **Processing via Climatiq API**
   - Full API integration working for all 4 modes (air, sea, road, rail)
   - Per-row status tracking (pending → processing → success/error)
   - Overall progress indicator (bonus feature)
   - Real CO₂e calculations displayed

4. **Results UI** (Not implemented)
   - Sorting, filtering, and summary statistics deferred

5. **Export**
   - CSV export with all original data + emissions + status + errors

### Bonus Features (1/4 Complete - 25%)

- Overall progress indicator
- Inline editing (not implemented)
- Manual column mapping (not implemented)
- Breakdown by transport mode (not implemented)

---

## Approach & Decision-Making

### Prioritization Strategy

Given the 3-hour constraint, I prioritized:
1. **API Integration** (highest risk/complexity) - ~1.5 hours
2. **Core Data Flow** (upload → validate → process → export) - ~1.5 hour
3. **UI Polish** (deferred) - Results UI can be added quickly later

**Rationale:** Better to have working core functionality than polished but incomplete features.

---

## Climatiq API Integration: The Discovery Process

This was the most challenging part. Here's how I solved it:

### Step 1: Finding Data Version

**Problem:** Postman examples showed `{{DATA_VERSION}}` placeholder with no value.

**Solution:**
1. Found the endpoint in Postman: [`GET /data/v1/data-versions`](https://www.postman.com/climatiq/climatiq/request/2thpvf3/get-data-versions)
2. Discovered available versions (1-31)
3. **Chose version 6** as a reasonable middle-ground (not too old, not too new)
4. Used semver-style `^6` (compatible with version 6+)

**Code:**
```typescript
// Used in search and estimate calls
data_version: '^6'
```

### Step 2: Finding Unit Type

**Problem:** Needed to find which unit type supports freight (weight × distance).

**Solution:**
1. Found the endpoint: [`GET /data/v1/unit-types`](https://www.postman.com/climatiq/climatiq/request/ucj3s6s/get-all-unit-types)
2. Reviewed available unit types
3. **Selected `WeightOverDistance`** - the only type that supports weight × distance calculations
4. This filters search results to only freight-compatible factors

**Code:**
```typescript
// In /api/emissions/factors/route.ts line 25
const searchUrl = `...&unit_type=WeightOverDistance`;
```

### Step 3: Finding Valid Activity IDs

**Problem:** Didn't know what `activity_id` values would work.

**Solution:**
1. **Search for candidates:**
   ```typescript
   GET /data/v1/search?query=freight_flight&data_version=^6&unit_type=WeightOverDistance
   ```
   - Searched for: "freight flight", "freight sea", "freight train", "freight vehicle"
   - Each search returns up to 10 candidates

2. **Test each candidate:**
   - For each `activity_id` from search results
   - Test against `POST /estimate` with dummy payload (1 tonne, 100 km)
   - If it returns `200 OK` with `co2e` → it works!

3. **Create mapping:**
   ```typescript
   // In /api/emissions/factors/route.ts lines 78-84
   const ids: Record<string, string | null> = {
     air: results.air?.primary?.activity_id || null,
     sea: results.sea?.primary?.activity_id || null,
     road: results.road?.primary?.activity_id || null,
     rail: results.rail?.primary?.activity_id || null,
   };
   ```

4. **Hardcode for production:**
   - Copied working IDs to `EMISSION_FACTOR_IDS` constant in `route.ts`
   - Production uses hardcoded IDs (fast, reliable)
   - Discovery endpoint kept for showing the approach

### Step 4: Other Discoveries

- **Weight units:** Factors expect tonnes, not kg → convert `weight_kg / 1000`
- **Payload structure:** `parameters` at top level, not nested in `emission_factor`
- **Selector field:** Use `activity_id` not `id` for activity-based selectors

---

## Key Trade-offs

### 1. Results UI vs. API Integration
**Decision:** Prioritized API integration, deferred Results UI

**Reasoning:**
- API integration was highest risk (complex, unknown)
- Results UI is straightforward (sorting/filtering ~1 hour)
- Better to have working core than polished but incomplete

**Impact:** Missing sorting, filtering, summary panel. Can be added quickly.

### 2. Hardcoded Distance vs. Geocoding
**Decision:** Used hardcoded 1000 km distance

**Reasoning:**
- Geocoding requires additional API (Google Maps/Mapbox)
- Adds complexity and API key management
- Assignment didn't explicitly require real distances

**Impact:** Emissions calculated with placeholder distance. Can add geocoding later.

### 3. Single Activity ID vs. Multiple Options
**Decision:** Use first working `activity_id` found per mode

**Reasoning:**
- Need one working solution per mode
- Discovery endpoint shows alternatives if needed

**Impact:** Using default factors (e.g., domestic flights, container ships). Alternatives available via `/api/emissions/factors`.

---

## Time Allocation

- **API Integration:** ~1.5 hours (discovery, testing, debugging)
- **CSV Upload & Parsing:** ~30 min
- **Validation:** ~30 min
- **UI Components:** ~30 min
- **Export:** ~15 min
- **Total:** ~3.5 hours

---

## Technical Decisions

### Libraries
- **PapaParse:** Industry-standard CSV parsing, handles edge cases
- **Next.js:** Built-in API routes for secure API key handling
- **TypeScript:** Type safety for complex data structures
- **Tailwind CSS:** Rapid UI development

### Architecture
- **Custom validation** (not Zod): Simpler, no extra dependency
- **Hardcoded activity IDs:** Performance and reliability
- **Single-page flow:** Everything visible, no navigation needed

---

## What Wasn't Implemented

### Core Requirements
- **Results UI:** Sorting, filtering, summary statistics
  - **Why:** Deferred to focus on API integration
  - **Effort:** ~1 hour to add

### Bonus Features
- **Inline editing:** Cells not editable
- **Manual column mapping:** Auto-detection works
- **Breakdown by mode:** Chart/visualization not added
