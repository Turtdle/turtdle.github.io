import React, { useState, useEffect } from 'react';

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading network data...</span>
    </div>
  );
}

// Error component
function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
      >
        Try Again
      </button>
    </div>
  );
}

// Main content extractor component
function KroosterContentExtractor() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    // Try multiple CORS proxies in case one fails
    const corsProxies = [
      'https://api.allorigins.win/get?url=',
      'https://api.codetabs.com/v1/proxy?quest='
    ];

    const targetUrl = 'https://www.krooster.com/network/lookup/turt';

    for (let proxy of corsProxies) {
      try {
        console.log(`Trying proxy: ${proxy}`);
        
        let response, data;
        
        if (proxy.includes('allorigins')) {
          response = await fetch(proxy + encodeURIComponent(targetUrl));
          const jsonData = await response.json();
          data = jsonData.contents;
        } else {
          response = await fetch(proxy + encodeURIComponent(targetUrl));
          data = await response.text();
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        
        // Look for the specific MuiBox element
        const targetElement = doc.querySelector('.MuiBox-root.css-yd8sa2');
        
        if (targetElement) {
          // Clean up the content a bit - remove any script tags for security
          const scripts = targetElement.querySelectorAll('script');
          scripts.forEach(script => script.remove());
          
          setContent(targetElement.innerHTML);
          setLoading(false);
          return; // Success, exit the loop
        } 
      } catch (err) {
        console.error(`Proxy ${proxy} failed:`, err);
        continue; // Try next proxy
      }
    }

    // If all proxies failed
    setError('Unable to load content. The website may be blocking requests or the content structure has changed.');
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchContent} />;
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p>No content found with the specified class</p>
          <button 
            onClick={fetchContent}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white">
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        className="krooster-content p-2"
        style={{
          fontSize: '10px',
          lineHeight: '1.2',
          transform: 'scale(0.8)',
          transformOrigin: 'top left',
          width: '125%',
          height: '125%'
        }}
      />
    </div>
  );
}

// Export just the content extractor for use in your existing div
export default KroosterContentExtractor;