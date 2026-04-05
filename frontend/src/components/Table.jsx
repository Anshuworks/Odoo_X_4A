import React from 'react';
import { Inbox } from 'lucide-react';

const Table = ({ columns, data, emptyMessage = 'No records found', onRowClick }) => {
  if (data.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
          <Inbox size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">Queue Empty</h4>
        <p className="text-xs text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50/50">
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th key={col.key} className="th text-left p-4" style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              className={`tr hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="td p-4">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
