import { Link } from 'react-router-dom';
import type { Auction } from '../../types/auction';

interface AuctionCardProps {
  auction: Auction;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  const imageUrl = auction.item.images[0]?.url
    ? `${API_URL}${auction.item.images[0].url}`
    : 'https://via.placeholder.com/300x300?text=Sin+Imagen';

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={auction.item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-medium">Ver detalles</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-2" title={auction.item.title}>
            {auction.item.title}
          </h3>
        </div>

        <p className="text-xl font-bold text-primary mb-2">
          {auction.currentPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </p>

        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Termina: {new Date(auction.endTime).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
};