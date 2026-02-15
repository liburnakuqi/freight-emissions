'use client';

import { useState } from 'react';
import { ShipmentRow } from '../lib/csvParser';
import { ValidationError } from '../lib/validation';
import { exportToCSV } from '../lib/csvExport';
import { calculateEmissions } from '../lib/api/calculateEmissions';
import StatusBadge from './StatusBadge';

type ProcessingStatus = 'pending' | 'processing' | 'success' | 'error';
type RowResult = {
  status: ProcessingStatus;
  co2e_kg?: number;
  error?: string;
};

export default function PreviewTable({ data, errors }: { data: ShipmentRow[]; errors: ValidationError[] }) {
  const [rowResults, setRowResults] = useState<Record<number, RowResult>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const isValidRow = (index: number) => {
    return !errors.some(e => e.row === index);
  };

  const processShipment = async (row: ShipmentRow, index: number) => {
    setRowResults(prev => ({ ...prev, [index]: { status: 'processing' } }));

    const result = await calculateEmissions(row);

    if (result.success && result.co2e_kg !== undefined) {
      setRowResults(prev => ({
        ...prev,
        [index]: { status: 'success', co2e_kg: result.co2e_kg },
      }));
    } else {
      setRowResults(prev => ({
        ...prev,
        [index]: { status: 'error', error: result.error || 'Unknown error' },
      }));
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setOverallProgress(0);

    const validRows = data
      .map((row, index) => ({ row, index }))
      .filter(({ index }) => isValidRow(index));

    const total = validRows.length;
    let processed = 0;

    for (const { row, index } of validRows) {
      await processShipment(row, index);
      processed++;
      setOverallProgress(Math.round((processed / total) * 100));
    }

    setIsProcessing(false);
  };

  const handleExport = () => {
    const exportData = data.map((row, index) => {
      const result = rowResults[index];
      return {
        ...row,
        status: result?.status || 'pending',
        co2e_kg: result?.co2e_kg || '',
        error: result?.error || '',
      };
    });

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(exportData as any, `freight-emissions-${timestamp}.csv`);
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
      {/* Header with Title and Buttons */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Freight Shipments</h2>
          <p className="mt-1 text-sm text-gray-500">
            A table of freight shipment data with validation status.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleProcess}
            disabled={isProcessing || errors.length > 0}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Process Emissions'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Export
          </button>
        </div>
      </div>

      {/* Overall Progress Indicator */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Processing emissions...</span>
            <span className="text-sm text-blue-700">{overallProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CO₂e (kg)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => {
              const rowErrors = errors.filter(e => e.row === index);
              const hasError = (field: string) => rowErrors.some(e => e.field === field);
              const result = rowResults[index];
              const status = result?.status || (isValidRow(index) ? 'pending' : 'error');
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className={`px-6 py-4 text-left text-sm font-medium ${hasError('shipment_id') ? 'bg-red-100 text-red-800' : 'text-gray-900'}`}>
                    {row.shipment_id}
                  </td>
                  <td className={`px-6 py-4 text-left text-sm ${hasError('origin_address') ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                    {row.origin_address}
                  </td>
                  <td className={`px-6 py-4 text-left text-sm ${hasError('destination_address') ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                    {row.destination_address}
                  </td>
                  <td className={`px-6 py-4 text-left text-sm ${hasError('mode') ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                    {row.mode}
                  </td>
                  <td className={`px-6 py-4 text-left text-sm ${hasError('weight_kg') ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                    {row.weight_kg}
                  </td>
                  <td className="px-6 py-4 text-left text-sm">
                    {isValidRow(index) ? (
                      <StatusBadge status={status} error={result?.error} />
                    ) : (
                      <StatusBadge
                        status="invalid"
                        error={rowErrors.map((e) => `${e.field}: ${e.message}`).join(', ')}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    {result?.co2e_kg !== undefined ? result.co2e_kg.toFixed(2) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
