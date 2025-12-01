import { useState, useEffect } from 'react';
import { auctionService } from '../services/auctionService';
import type { Auction } from '../types/auction';
import { AuctionCard } from '../components/auctions/AuctionCard';

export const HomePage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Hardcoded categories for the filter bar
  const categories = [
    "Todas las categorías",
    "Coches",
    "Tecnología y electrónica",
    "Cine, libros y música",
    "Moda y accesorios",
    "Hogar y jardín"
  ];

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        setIsLoading(true);
        const data = await auctionService.getActiveAuctions();
        setAuctions(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las subastas.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuctions();
  }, []);

  const filteredAuctions = auctions.filter(auction =>
    auction.item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Filter Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="w-full">
          <div className="flex items-center space-x-8 overflow-x-auto py-4 scrollbar-hide">
            <button className="flex items-center text-gray-900 font-medium whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              Todas las categorías
            </button>
            {categories.slice(1).map((category, index) => (
              <button
                key={index}
                className="text-gray-500 hover:text-primary whitespace-nowrap transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white py-16 text-center px-4">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-center w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-32 py-4 rounded-full border-gray-300 shadow-sm focus:ring-primary focus:border-primary text-lg"
              placeholder="Buscar en todas las categorías"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-2 top-2 bottom-2 bg-primary text-white px-8 rounded-full font-bold hover:bg-opacity-90 transition-colors">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Subastas Grid */}
      <div className="w-full py-12 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Subastas Activas</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAuctions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron resultados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};