import { useState } from 'react';
import { Search, Filter, Eye, X } from 'lucide-react';
import type { CrawlResult } from '../App';
import { StatusBadge } from './StatusBadge';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "./ui/dropdown-menu";
import { Pagination } from "./ui/pagination";
import { SortableHeader } from "./ui/sortable-header";

interface DashboardProps {
  results: CrawlResult[];
  onViewDetail: (result: CrawlResult) => void;
}

export const Dashboard = ({ results, onViewDetail }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [brokenLinksFilter, setBrokenLinksFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'createdAt', direction: 'desc' });

  // Add null check for results
  const safeResults = results || [];

  const filteredResults = safeResults.filter(result => {
    // Search filter
    const matchesSearch = result.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(result.status);
    
    // Broken links filter
    let matchesBrokenLinks = true;
    if (brokenLinksFilter === 'has-broken') {
      matchesBrokenLinks = result.brokenLinks > 0;
    } else if (brokenLinksFilter === 'no-broken') {
      matchesBrokenLinks = result.brokenLinks === 0;
    }
    
    return matchesSearch && matchesStatus && matchesBrokenLinks;
  });

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

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    if (checked) {
      setStatusFilter(prev => [...prev, status]);
    } else {
      setStatusFilter(prev => prev.filter(s => s !== status));
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setBrokenLinksFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter.length > 0 || brokenLinksFilter !== 'all' || searchTerm !== '';

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-3 sm:p-6 h-full overflow-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Crawl Results Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Monitor and analyze your web crawling results</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search URLs or titles..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          
          <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {statusFilter.length + (brokenLinksFilter !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <h4 className="font-medium text-sm mb-2">Status</h4>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('queued')}
                  onCheckedChange={(checked) => handleStatusFilterChange('queued', checked)}
                >
                  Queued
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('running')}
                  onCheckedChange={(checked) => handleStatusFilterChange('running', checked)}
                >
                  Running
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('completed')}
                  onCheckedChange={(checked) => handleStatusFilterChange('completed', checked)}
                >
                  Completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('error')}
                  onCheckedChange={(checked) => handleStatusFilterChange('error', checked)}
                >
                  Error
                </DropdownMenuCheckboxItem>
              </div>
              
              <div className="p-2 border-t">
                <h4 className="font-medium text-sm mb-2">Broken Links</h4>
                <DropdownMenuCheckboxItem
                  checked={brokenLinksFilter === 'all'}
                  onCheckedChange={() => {
                    setBrokenLinksFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={brokenLinksFilter === 'has-broken'}
                  onCheckedChange={() => {
                    setBrokenLinksFilter('has-broken');
                    setCurrentPage(1);
                  }}
                >
                  Has Broken Links
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={brokenLinksFilter === 'no-broken'}
                  onCheckedChange={() => {
                    setBrokenLinksFilter('no-broken');
                    setCurrentPage(1);
                  }}
                >
                  No Broken Links
                </DropdownMenuCheckboxItem>
              </div>
              
              {hasActiveFilters && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="w-full justify-start text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasActiveFilters && (
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {sortedResults.length} of {safeResults.length} results
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
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
                  label="HTML Version"
                  sortKey="htmlVersion"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="hidden lg:table-cell"
                />
                <SortableHeader
                  label="Internal Links"
                  sortKey="internalLinks"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="hidden lg:table-cell"
                />
                <SortableHeader
                  label="External Links"
                  sortKey="externalLinks"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="hidden lg:table-cell"
                />
                <SortableHeader
                  label="Broken Links"
                  sortKey="brokenLinks"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-900 text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-3">
                    <div className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                         onClick={() => onViewDetail(result)}>
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
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{result.htmlVersion}</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{result.internalLinks}</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{result.externalLinks}</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                    <span className={result.brokenLinks > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {result.brokenLinks}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <StatusBadge status={result.status} />
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail(result)}
                      className="text-xs px-2 py-1"
                    >
                      <Eye className="h-3 w-3 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
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
          <p className="text-gray-500 text-sm sm:text-base">No crawl results found</p>
        </div>
      )}
    </div>
  );
};
