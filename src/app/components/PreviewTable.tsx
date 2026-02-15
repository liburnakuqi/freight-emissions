export default function PreviewTable() {
  const dummyData = [
    { shipment_id: 'S-1001', origin_address: '대구광역시 광진구 압구정가 (은주김마을)', destination_address: 'Jennalaan 1, 7140TC, Daarlerveen', mode: 'rail', weight_kg: '4396.84' },
    { shipment_id: 'S-1002', origin_address: 'Marlene-Köhler-Straße 9/3, 13923 Hansestadttralsund', destination_address: '421 /,  9 Spears Dale, Wallerburgh, WA, 2451', mode: 'sea', weight_kg: '4116.94' },
    { shipment_id: 'S-1003', origin_address: 'Irisbaan 79, 5539 ZG, Hank', destination_address: '대구광역시 강북구 영동대732로 (숙자전면)', mode: 'sea', weight_kg: '4942.32' },
    { shipment_id: 'S-1004', origin_address: '32 Brandon prairie, North Jamieview, G97 1HR', destination_address: 'Juliettering 41, 5086 PO, Nijhuizum', mode: 'rail', weight_kg: '4803.84' },
    { shipment_id: 'S-1005', origin_address: '전라북도 논산시 가락241거리', destination_address: 'Boazstraat 073, 9751 IA, Bourtange', mode: 'sea', weight_kg: '5137.28' },
  ];

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipment ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dummyData.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.shipment_id}</td>
              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{row.origin_address}</td>
              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{row.destination_address}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{row.mode}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{row.weight_kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
