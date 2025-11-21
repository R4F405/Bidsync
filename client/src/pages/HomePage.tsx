import { useState, useEffect } from 'react';
import { auctionService } from '../services/auctionService';
import type { Auction } from '../types/auction';
import { AuctionCard } from '../components/auctions/AuctionCard';

export const HomePage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return <div>Cargando subastas... ⏳</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h1>Subastas Activas</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {auctions.length === 0 ? (
          <p>No hay subastas activas en este momento.</p>
        ) : (
          auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))
        )}
      </div>
    </div>
  );
};