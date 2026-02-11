import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/helpers';
import Skeleton from './Skeleton';
import Pagination from './Pagination';

/**
 * Table component — sortable, filterable, paginated, selectable rows, loading skeleton
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  sortable = true,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  pageSize = 10,
  paginated = true,
  emptyMessage = 'No data available',
  className,
  stickyHeader = false,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState('');

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterQuery.trim()) return data;
    return data.filter((row) =>
      columns.some((col) => {
        const value = col.accessor ? row[col.accessor] : '';
        return String(value).toLowerCase().includes(filterQuery.toLowerCase());
      })
    );
  }, [data, filterQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = paginated
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = () => {
    if (!selectable || !onSelectionChange) return;
    if (selectedRows.length === paginatedData.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(paginatedData.map((_, i) => i));
    }
  };

  const handleSelectRow = (index) => {
    if (!selectable || !onSelectionChange) return;
    const selected = selectedRows.includes(index)
      ? selectedRows.filter((i) => i !== index)
      : [...selectedRows, index];
    onSelectionChange(selected);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown size={14} className="text-text-muted" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={14} className="text-primary" />
    ) : (
      <ChevronDown size={14} className="text-primary" />
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Filter bar */}
      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filter records..."
            className="w-full h-9 pl-9 pr-3 text-[12px] border border-border rounded-[var(--radius-md)] bg-white font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-[var(--radius-lg)] bg-white">
        <table className="w-full text-left">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="bg-surface border-b border-border">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  className={cn(
                    'px-4 py-3 text-[12px] font-heading font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap',
                    sortable && col.sortable !== false && 'cursor-pointer select-none hover:text-text-primary transition-colors',
                    col.headerClassName
                  )}
                  style={{ width: col.width }}
                  onClick={() => sortable && col.sortable !== false && col.accessor && handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortable && col.sortable !== false && col.accessor && (
                      <SortIcon columnKey={col.accessor} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-border last:border-b-0">
                  {selectable && (
                    <td className="px-4 py-3">
                      <Skeleton variant="line" width={16} height={16} />
                    </td>
                  )}
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton variant="line" width="80%" height={14} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-[13px] text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  className={cn(
                    'border-b border-border last:border-b-0 transition-colors',
                    'hover:bg-surface/50',
                    onRowClick && 'cursor-pointer',
                    selectable && selectedRows.includes(rowIndex) && 'bg-primary-bg/30',
                    rowIndex % 2 === 1 && 'bg-surface/30'
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(rowIndex)}
                        onChange={() => handleSelectRow(rowIndex)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        'px-4 py-3 text-[13px] font-body text-text-body',
                        col.cellClassName
                      )}
                    >
                      {col.render
                        ? col.render(row[col.accessor], row, rowIndex)
                        : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && !loading && sortedData.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12px] text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default Table;
