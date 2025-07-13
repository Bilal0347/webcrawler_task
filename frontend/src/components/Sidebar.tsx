import { BarChart3, Link, Home } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: 'dashboard' | 'urls' | 'detail';
  onTabChange: (tab: 'dashboard' | 'urls' | 'detail') => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'urls' as const, label: 'URL Manager', icon: Link },
  ];

  return (
    <div className="w-full lg:w-64 bg-white border-b lg:border-r border-gray-200 shadow-sm">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
          <h1 className="text-lg lg:text-xl font-bold text-gray-900">Web Crawler</h1>
        </div>
      </div>
      
      <nav className="mt-4 lg:mt-6">
        <ul className="flex lg:flex-col lg:space-y-2 px-2 lg:px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex-1 lg:flex-none">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 py-2 lg:py-2 rounded-lg text-left transition-colors text-sm lg:text-base",
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600 border-b-2 lg:border-r-2 lg:border-b-0 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="font-medium hidden sm:inline">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};