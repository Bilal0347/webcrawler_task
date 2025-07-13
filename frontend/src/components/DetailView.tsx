import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import type { CrawlResult, BrokenLink } from '../App';
import { StatusBadge } from './StatusBadge';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DetailViewProps {
  result: CrawlResult;
  onBack: () => void;
}

export const DetailView = ({ result, onBack }: DetailViewProps) => {
  const linkData = [
    { name: 'Internal Links', value: result.internalLinks, color: '#3B82F6' },
    { name: 'External Links', value: result.externalLinks, color: '#10B981' },
    { name: 'Broken Links', value: result.brokenLinks, color: '#EF4444' }
  ];

  const headingData = [
    { name: 'H1', count: result.h1Count },
    { name: 'H2', count: result.h2Count },
    { name: 'H3', count: result.h3Count },
    { name: 'H4', count: result.h4Count },
    { name: 'H5', count: result.h5Count },
    { name: 'H6', count: result.h6Count }
  ];

  const formatDate = (timestamp: number) => {
    // Convert Unix timestamp (seconds) to milliseconds for JavaScript Date
    const dateInMs = timestamp * 1000;
    return new Date(dateInMs).toLocaleString();
  };

  return (
    <div className="p-3 sm:p-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{result.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
              <span className="text-xs sm:text-sm text-gray-600 break-all">{result.url}</span>
              <StatusBadge status={result.status} />
            </div>
          </div>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <ExternalLink className="h-4 w-4 mr-2" />
          Visit Site
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs sm:text-sm text-gray-500">HTML Version</span>
                <p className="font-medium text-sm sm:text-base">{result.htmlVersion}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Has Login Form</span>
                <p className="font-medium text-sm sm:text-base">{result.hasLoginForm ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Analyzed At</span>
                <p className="font-medium text-xs sm:text-sm">{formatDate(result.createdAt)}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Total Links</span>
                <p className="font-medium text-sm sm:text-base">{result.internalLinks + result.externalLinks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Link Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Link Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={linkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {linkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col sm:flex-row sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
              {linkData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Heading Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Heading Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={headingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Broken Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              <span>Broken Links</span>
              {result.brokenLinks > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {result.brokenLinks}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.brokenLinkList.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {result.brokenLinkList.map((brokenLink: BrokenLink) => (
                  <div key={brokenLink.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {brokenLink.url}
                      </p>
                    </div>
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      {brokenLink.statusCode}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="text-green-500 mb-2">
                  <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">No broken links found!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
