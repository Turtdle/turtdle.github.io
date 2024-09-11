
import { Search } from 'lucide-react';
import React, {useEffect,  useState} from 'react';
import './index.css';
const Card = ({ children }) => <div className="border rounded-lg shadow-lg p-4">{children}</div>;
const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;
const onWebsiteLoadBeautyProductWebsite = async () => {
  console.log('Beauty Product Website loaded');
  // Add any other logic you want to run on load
};

// Use useEffect to run the function when the component mounts

const ProductVideo = ({ username, views, length, summary, thumbnail }) => (
  
  <div className="mt-4">
    <div className="relative">
      <div className="w-1/4">
      <img src={thumbnail} alt="Placeholder" className="w-full rounded-lg" />
      </div>
      <div className="w-3/4 pl-4">
      <div className="absolute bottom-2 right-2 bg-gray-900 text-white rounded-md px-2 py-1 text-xs">
        {length}
      </div>
    </div>
    </div>
    <div className="mt-2">
      <p className="text-sm">
        <span className="font-semibold">{username}</span> {views} • {length}
      </p>
      <p className="text-gray-600 text-sm mt-1">{summary}</p>
      <div className="mt-2 flex items-center">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded text-sm mr-2">
          K-Beauty
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded text-sm mr-2">
          Gel cleanser
        </button>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-2 rounded text-sm mr-2">
          Good for acne-prone skin
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded text-sm">
          Hydrating
        </button>
      </div>
    </div>
  </div>  
);

const BeautyProductWebsite = () => {
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const response = await fetch('/path/to/your/file.txt');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        setFileContent(content);
        console.log('File content loaded:', content);
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    };    fetchFileContent();
  }, []);
  return (
  
  <div className="bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
        <div className="flex justify-start lg:w-0 lg:flex-1">
          <span className="text-2xl font-bold text-gray-900">LOGO</span>
        </div>
        <div className="flex items-center justify-end md:flex-1 lg:w-0">
          <div className="relative mt-1 rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search the latest beauty products"
              className="block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <a
            href="#"
            className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Log In
          </a>
          <a
            href="#"
            className="ml-4 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Industry-vetted videos<br />
        Product expertise in seconds
      </h1>
      <h2 className="text-xl font-medium text-gray-900 mb-4">
        Finding helpful product review videos takes time. We do it for you in seconds. Get up to speed on the latest beauty products from industry-vetted videos that actually help you decide what's right for you.  
      </h2>
      <a
        href="#"
        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Sign up
      </a>

      <div className="mt-12 w-full h-[1200px]">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold mb-4">Trend Report</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-8">
              Our AI-generated summaries provide a snapshot of what people are saying about the latest beauty products. With each search, you'll get a quick overview of all the product videos approved by industry veterans.
            </p>

            <ProductVideo
              username="username123"
              views="288.2k"
              length="1:60"
              summary="(AI SUMMARY OF SPECIFIC VIDEO) Description Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
              thumbnail="https://i.ytimg.com/vi/ohWeFBTHUr0/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLC_lDO-3rW04mF3C5eoesDEhA-C4w"
            />

            <ProductVideo 
              username="username123"
              views="288.2k"
              length="1:60"
              summary="(AI SUMMARY OF SPECIFIC VIDEO) Description Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
              thumbnail="https://i.ytimg.com/vi/ohWeFBTHUr0/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLC_lDO-3rW04mF3C5eoesDEhA-C4w"
              />
  

            <ProductVideo
              username="username123" 
              views="288.2k"
              length="1:60"
              summary="(AI SUMMARY OF SPECIFIC VIDEO) Description Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
              thumbnail="https://i.ytimg.com/vi/ohWeFBTHUr0/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLC_lDO-3rW04mF3C5eoesDEhA-C4w"
              />
  
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
}
export default BeautyProductWebsite;
export { onWebsiteLoadBeautyProductWebsite }