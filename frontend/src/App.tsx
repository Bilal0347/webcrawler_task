import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { URLManager } from './components/URLManager';
import { DetailView } from './components/DetailView';
import { apiService } from './services/api';

export type CrawlResult = {
  id: number;
  url: string;
  title: string;
  htmlVersion: string;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  hasLoginForm: boolean;
  brokenLinkList: BrokenLink[];
  createdAt: number;
  status: 'queued' | 'running' | 'completed' | 'error';
};

export type BrokenLink = {
  id: number;
  crawlResultId: number;
  url: string;
  statusCode: number;
};

const App = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'urls' | 'detail'>('dashboard');
  const [selectedResult, setSelectedResult] = useState<CrawlResult | null>(null);
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load crawl results on component mount
  useEffect(() => {
    loadCrawlResults();
  }, []);

  const loadCrawlResults = async () => {
    setLoading(true);
    setError(null);
    
    const response = await apiService.getCrawlResults();
    
    if (response.error) {
      setError(response.error);
      console.error('API Error:', response.error, response.details);
    } else if (response.data) {
      console.log('API Response:', response.data);
      setCrawlResults(response.data);
    }
    
    setLoading(false);
  };

  const handleViewDetail = (result: CrawlResult) => {
    setSelectedResult(result);
    setActiveTab('detail');
  };

  const handleDeleteResults = async (ids: number[]) => {
    setLoading(true);
    setError(null);

    const response = await apiService.deleteMultipleURLs(ids);
    
    if (response.error) {
      setError(response.error);
    } else {
      // Reload the data after successful deletion
      await loadCrawlResults();
    }
    
    setLoading(false);
  };

  const handleRerunAnalysis = async (ids: number[]) => {
    setLoading(true);
    setError(null);

    // Update status to queued for selected items
    setCrawlResults(prev => prev.map(result => 
      ids.includes(result.id) 
        ? { ...result, status: 'queued' as const }
        : result
    ));

    // Run crawler for each URL
    for (const id of ids) {
      const result = crawlResults.find(r => r.id === id);
      if (result) {
        const response = await apiService.runCrawler(result.url);
        if (response.error) {
          setError(response.error);
          break;
        }
      }
    }

    // Reload data after all crawls are complete
    await loadCrawlResults();
    setLoading(false);
  };

  const handleAddURL = async (url: string) => {
    setLoading(true);
    setError(null);

    const response = await apiService.addURL(url);
    
    if (response.error) {
      setError(response.error);
    } else {
      // Reload the data to get the new URL
      await loadCrawlResults();
    }
    
    setLoading(false);
  };

  const handleRunCrawler = async (url: string) => {
    setLoading(true);
    setError(null);

    // Update status to running
    setCrawlResults(prev => prev.map(result => 
      result.url === url 
        ? { ...result, status: 'running' as const }
        : result
    ));

    const response = await apiService.runCrawler(url);
    
    if (response.error) {
      setError(response.error);
      // Update status to error
      setCrawlResults(prev => prev.map(result => 
        result.url === url 
          ? { ...result, status: 'error' as const }
          : result
      ));
    } else {
      // Reload data to get updated results
      await loadCrawlResults();
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded relative m-2 sm:m-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-3 py-3"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-sm shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Processing...</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">Please wait while we process your request.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            results={crawlResults}
            onViewDetail={handleViewDetail}
          />
        )}
        
        {activeTab === 'urls' && (
          <URLManager 
            results={crawlResults}
            onAddURL={handleAddURL}
            onDeleteResults={handleDeleteResults}
            onRunCrawler={handleRunCrawler}
          />
        )}
        
        {activeTab === 'detail' && selectedResult && (
          <DetailView 
            result={selectedResult}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </main>
    </div>
  );
};

export default App;