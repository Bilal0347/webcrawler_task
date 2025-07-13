
import { useState } from 'react';
import { Plus, Trash2, Search, Play } from 'lucide-react';
import type { CrawlResult } from '../App';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { StatusBadge } from './StatusBadge';
import { Pagination } from "./ui/pagination";
import { SortableHeader } from "./ui/sortable-header";

interface URLManagerProps {
  results: CrawlResult[];
  onAddURL: (url: string) => void;
  onDeleteResults: (ids: number[]) => void;
  onRunCrawler: (url: string) => void;
}

export const URLManager = ({ results, onAddURL, onDeleteResults, onRunCrawler }: URLManagerProps) => {
  const [newURL, setNewURL] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'createdAt', direction: 'desc' });

  // Add null check for results
  const safeResults = results || [];

  const filteredResults = safeResults.filter(result =>
    result.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof CrawlResult];
    const bValue = b[sortConfig.key as keyof CrawlResult];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage;
  const endItem = startItem + itemsPerPage;
  const paginatedResults = sortedResults.slice(startItem, endItem);

  const handleAddURL = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newURL.trim()) {
      onAddURL(newURL.trim());
      setNewURL('');
      setCurrentPage(1); // Reset to first page after adding
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedResults.map(r => r.id) : []);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedIds(prev => 
      checked 
        ? [...prev, id]
        : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      onDeleteResults(selectedIds);
      setSelectedIds([]);
      setCurrentPage(1); // Reset to first page after deletion
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]); // Clear selection when changing pages
  };

  return (
    <div className="p-3 sm:p-6 h-full overflow-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">URL Manager</h1>
        <p className="text-sm sm:text-base text-gray-600">Add and manage URLs for web crawling</p>
      </div>

      {/* Add URL Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add New URL</h2>
        <form onSubmit={handleAddURL} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Input
            type="url"
            placeholder="https://example.com"
            value={newURL}
            onChange={(e) => setNewURL(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add URL
          </Button>
        </form>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search URLs..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 w-full sm:w-80"
          />
        </div>

        {selectedIds.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleDeleteSelected}
            className="text-red-600 hover:text-red-700 w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* URL List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedIds.length === paginatedResults.length && paginatedResults.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <SortableHeader
                  label="URL"
                  sortKey="url"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Title"
                  sortKey="title"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="hidden md:table-cell"
                />
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Added"
                  sortKey="createdAt"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="hidden lg:table-cell"
                />
                <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-900 text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(result.id)}
                      onCheckedChange={(checked: boolean) => handleSelectItem(result.id, checked)}
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <div className="text-xs sm:text-sm font-medium text-blue-600">
                      <div className="truncate max-w-[150px] sm:max-w-[200px] lg:max-w-none">
                        {result.url}
                      </div>
                      <div className="text-gray-500 text-xs md:hidden truncate max-w-[150px]">
                        {result.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    <div className="truncate max-w-[150px] lg:max-w-[200px]">
                      {result.title}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <StatusBadge status={result.status} />
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(result.createdAt * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRunCrawler(result.url)}
                      disabled={result.status === 'running'}
                      className="text-xs px-2 py-1"
                    >
                      <Play className="h-3 w-3 mr-1 sm:mr-2" />
                      {result.status === 'running' 
                        ? 'Running...' 
                        : result.status === 'completed' 
                          ? <span className="hidden sm:inline">Rerun Crawler</span>
                          : <span className="hidden sm:inline">Run Crawler</span>
                      }
                      {result.status === 'completed' && <span className="sm:hidden">Rerun</span>}
                      {result.status !== 'completed' && result.status !== 'running' && <span className="sm:hidden">Run</span>}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={sortedResults.length}
            itemsPerPage={itemsPerPage}
            startItem={startItem}
            endItem={endItem}
          />
        )}
      </div>

      {sortedResults.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-sm sm:text-base">No URLs found</p>
        </div>
      )}
    </div>
  );
};
