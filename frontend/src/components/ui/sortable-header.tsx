import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface SortableHeaderProps {
  label: string
  sortKey: string
  currentSort: { key: string; direction: 'asc' | 'desc' }
  onSort: (key: string) => void
  className?: string
}

export function SortableHeader({ 
  label, 
  sortKey, 
  currentSort, 
  onSort, 
  className 
}: SortableHeaderProps) {
  const isActive = currentSort.key === sortKey
  
  return (
    <th 
      className={cn(
        "px-2 sm:px-4 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100 text-xs sm:text-sm select-none",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUp 
            className={cn(
              "h-3 w-3",
              isActive && currentSort.direction === 'asc' 
                ? "text-blue-600" 
                : "text-gray-400"
            )} 
          />
          <ChevronDown 
            className={cn(
              "h-3 w-3 -mt-1",
              isActive && currentSort.direction === 'desc' 
                ? "text-blue-600" 
                : "text-gray-400"
            )} 
          />
        </div>
      </div>
    </th>
  )
} 