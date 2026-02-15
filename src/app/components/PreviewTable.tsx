'use client';

import { ShipmentRow } from '../lib/csvParser';
import { ValidationError } from '../lib/validation';
import { exportToCSV } from '../lib/csvExport';

export default function PreviewTable({ data, errors }: { data: ShipmentRow[]; errors: ValidationError[] }) {
  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(data, `freight-emissions-${timestamp}.csv`);
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Freight Shipments</h2>
          <p className="mt-1 text-sm text-gray-500">
            A table of freight shipment data with validation status.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Export
        </button>
      </div>

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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => {
              const rowErrors = errors.filter(e => e.row === index);
              const hasError = (field: string) => rowErrors.some(e => e.field === field);
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${hasError('shipment_id') ? 'bg-red-100 text-red-800' : 'text-gray-900'}`}>
                    {row.shipment_id}
                  </td>
                  <td className={`px-6 py-4 text-sm max-w-xs truncate ${hasError('origin_address') ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                    {row.origin_address}
                  </td>
                  <td className={`px-6 py-4 text-sm max-w-xs truncate ${hasError('destination_address') ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                    {row.destination_address}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${hasError('mode') ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                    {row.mode}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${hasError('weight_kg') ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                    {row.weight_kg}
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
