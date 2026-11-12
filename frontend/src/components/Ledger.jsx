import { useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  colorSchemeDark,
} from 'ag-grid-community';
import { ItemCard, StatusBadge, money, statusLabel } from './common';

ModuleRegistry.registerModules([AllCommunityModule]);
const darkTheme = themeQuartz.withPart(colorSchemeDark);

export default function Ledger({ items, onSync }) {
  const gridRef = useRef(null);
  const [quick, setQuick] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const selected = items.find((i) => i.id === selectedId);

  const columns = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: 'Time',
        width: 175,
        sort: 'desc',
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString() : ''),
      },
      { field: 'receiver', headerName: 'Recipient', width: 220 },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1,
        minWidth: 220,
        tooltipField: 'description',
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 120,
        type: 'rightAligned',
        filter: 'agNumberColumnFilter',
        valueFormatter: (p) => money(p.value),
      },
      {
        field: 'riskScore',
        headerName: 'Risk',
        width: 100,
        filter: 'agNumberColumnFilter',
        valueFormatter: (p) => (p.value == null ? '' : Number(p.value).toFixed(2)),
        cellStyle: (p) => ({
          fontWeight: 600,
          color: p.value >= 0.8 ? '#fca5a5' : p.value >= 0.4 ? '#fde047' : '#86efac',
        }),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 190,
        cellRenderer: (p) => <StatusBadge status={p.value} />,
        filterValueGetter: (p) => statusLabel(p.data.status),
      },
      {
        field: 'flags',
        headerName: 'Flags',
        width: 210,
        valueFormatter: (p) => (p.value || []).join(', '),
        filterValueGetter: (p) => (p.data.flags || []).join(' '),
      },
    ],
    []
  );

  async function sync() {
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          placeholder="Search the ledger..."
          className="flex-1 min-w-[200px] bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={sync}
          disabled={syncing}
          className="px-4 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-200 disabled:opacity-50 cursor-pointer"
        >
          {syncing ? 'Syncing...' : 'Sync PayPal status'}
        </button>
        <button
          onClick={() => gridRef.current?.api.exportDataAsCsv()}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
        >
          Export CSV
        </button>
      </div>

      <div style={{ height: 460 }}>
        <AgGridReact
          ref={gridRef}
          theme={darkTheme}
          rowData={items}
          columnDefs={columns}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          quickFilterText={quick}
          pagination
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
          getRowId={(p) => p.data.id}
          onRowClicked={(e) => setSelectedId(e.data.id)}
        />
      </div>

      <p className="text-xs text-slate-500">Click a row to see the agent's reasoning.</p>

      {selected && <ItemCard item={selected} open />}
    </div>
  );
}