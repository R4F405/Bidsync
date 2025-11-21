import { Link } from 'react-router-dom';
import type { Auction } from '../../types/auction'; // Importamos nuestro nuevo tipo

interface AuctionCardProps {
  auction: Auction;
}

// Obtenemos la URL base de la API/servidor desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  
  // Construye la URL de la imagen correctamente
  const imageUrl = auction.item.images[0]?.url
    ? `${API_URL}${auction.item.images[0].url}`
    : 'https://via.placeholder.com/150';

  return (
    <Link 
      key={auction.id} 
      to={`/auctions/${auction.id}`} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ display: 'flex', gap: '1rem', border: '1px solid #555', padding: '1rem' }}>
        <img 
          src={imageUrl} 
          alt={auction.item.title} 
          style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
        />
        <div>
          <h3 style={{ margin: 0 }}>{auction.item.title}</h3>
          <p style={{ fontSize: '1.2rem', color: '#87CEEB', margin: '0.5rem 0' }}>
            Precio actual: <strong>€{auction.currentPrice.toFixed(2)}</strong>
          </p>
          <p style={{ fontSize: '0.9rem', color: '#999' }}>
            Termina en: {new Date(auction.endTime).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
};