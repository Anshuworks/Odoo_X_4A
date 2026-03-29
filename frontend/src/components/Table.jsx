import React from 'react';
import { Inbox } from 'lucide-react';

const Table = ({ columns, data, emptyMessage = 'No data found' }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {columns.map((col) => (
              <th key={col.key} className="th" style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Inbox size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} className="tr">
                {columns.map((col) => (
                  <td key={col.key} className="td">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
