// client/src/pages/AuctionDetailPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { bidService } from '../services/bidService';
import { socket } from '../services/socketService';
import type { Auction } from '../types/auction';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export const AuctionDetailPage = () => {
  const { id: auctionId } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState<string | null>(null);
  const [isBidding, setIsBidding] = useState(false);

  // Para el mensaje verde temporal de "Puja Aceptada"
  const [lastSuccessfulBidAmount, setLastSuccessfulBidAmount] =
    useState<number | null>(null);

  // Para el mensaje gris persistente de "Tu puja máxima es X"
  const [myMaxBid, setMyMaxBid] = useState<number | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    let isMounted = true;

    const setupAuctionAndSocket = async () => {
      try {
        setIsLoading(true);
        const data = await auctionService.getAuctionById(auctionId);
        if (!isMounted) return;
        setAuction(data);

        let userMaxBid: number | null = null;

        if (isAuthenticated && user) {
          const myBid = await bidService.getMyBid(auctionId);
          if (isMounted && myBid) {
            setMyMaxBid(myBid.maxAmount);
            userMaxBid = myBid.maxAmount;
          }
        }

        if (data.highestBidderId === user?.userId) {
          if (userMaxBid) {
            setBidAmount(userMaxBid.toFixed(2));
          }
        } else {
          setBidAmount((data.currentPrice + 1).toFixed(2));
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError('No se pudo cargar la subasta.');
      } finally {
        if (isMounted) setIsLoading(false);
      }

      if (isMounted) {
        socket.connect();
        socket.emit('joinAuction', auctionId);
        socket.on('auctionUpdate', handleAuctionUpdate);
      }
    };

    const handleAuctionUpdate = (payload: any) => {
      if (!isMounted) return;

      setAuction((prevAuction) => {
        if (!prevAuction) return null;
        return {
          ...prevAuction,
          currentPrice: payload.currentPrice,
          highestBidderId: payload.highestBidderId,
          endTime: payload.endTime,
          status: payload.status,
        };
      });

      if (payload.highestBidderId !== user?.userId) {
        setBidAmount((payload.currentPrice + 1).toFixed(2));
        setMyMaxBid(null);
        setLastSuccessfulBidAmount(null);
      }
    };

    setupAuctionAndSocket();

    return () => {
      isMounted = false;
      socket.off('auctionUpdate', handleAuctionUpdate);
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [auctionId, user, isAuthenticated]);

  const handleBidSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auctionId) return;

    setBidError(null);
    setLastSuccessfulBidAmount(null);
    setIsBidding(true);
    try {
      const amount = parseFloat(bidAmount);
      await bidService.placeBid({
        auctionId,
        maxAmount: amount,
      });

      setLastSuccessfulBidAmount(amount);
      setMyMaxBid(amount);
    } catch (err: any) {
      console.error(err);
      setBidError(err.response?.data?.message || 'Error al procesar la puja.');
    } finally {
      setIsBidding(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      {error}
    </div>
  );

  if (!auction) return <div className="text-center mt-8">No se encontró la subasta.</div>;

  const isOwner = user?.userId === auction.item.ownerId;
  const isHighestBidder = user?.userId === auction.highestBidderId;
  const imageUrl = auction.item.images && auction.item.images.length > 0
    ? `${API_URL}${auction.item.images[0].url}`
    : null;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
        {/* Columna Izquierda: Imagen */}
        <div className="bg-gray-100 aspect-square md:aspect-auto relative flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={auction.item.title}
              className="w-full h-full object-contain md:object-cover"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <svg className="w-20 h-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Sin imagen</span>
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles y Puja */}
        <div className="p-6 md:p-8 flex flex-col">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{auction.item.title}</h1>
            <div className="flex items-center text-gray-500 mb-6">
              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium uppercase tracking-wide">
                {auction.status}
              </span>
              <span className="mx-2">•</span>
              <span className="text-sm">Termina: {new Date(auction.endTime).toLocaleDateString()} {new Date(auction.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {auction.item.description}
            </p>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Precio actual</p>
              <p className="text-4xl font-bold text-primary mb-4">
                {auction.currentPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </p>

              {isHighestBidder ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-green-700 font-medium">¡Vas ganando!</p>
                    {myMaxBid && (
                      <p className="text-green-600 text-sm">Tu puja máxima: {myMaxBid.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4 text-gray-500 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {auction.highestBidderId ? 'Última puja por otro usuario' : 'Sin pujas aún'}
                </div>
              )}

              {/* Mensaje de éxito temporal */}
              {lastSuccessfulBidAmount && isHighestBidder && auction.status === 'ACTIVE' && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm font-medium animate-pulse">
                  ¡Puja realizada con éxito!
                </div>
              )}

              {/* Formulario de Puja */}
              {auction.status === 'ACTIVE' && (
                <form onSubmit={handleBidSubmit} className="space-y-3">
                  {isOwner && (
                    <div className="text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                      Es tu producto, no puedes pujar.
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="text-gray-600 bg-gray-100 p-3 rounded-lg text-sm">
                      <Link to="/login" className="text-primary font-bold hover:underline">Inicia sesión</Link> para participar.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => {
                          setBidAmount(e.target.value);
                          setBidError(null);
                          setLastSuccessfulBidAmount(null);
                        }}
                        min={auction.currentPrice + 0.01}
                        step="0.01"
                        required
                        disabled={isBidding || isOwner || !isAuthenticated}
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-lg"
                        placeholder="Importe"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isBidding || isOwner || !isAuthenticated}
                      className={`px-6 py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 ${isBidding || isOwner || !isAuthenticated
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-primary hover:bg-opacity-90 shadow-md hover:shadow-lg'
                        }`}
                    >
                      {isBidding ? '...' : 'Pujar'}
                    </button>
                  </div>
                  {bidError && <p className="text-red-500 text-sm mt-1">{bidError}</p>}
                </form>
              )}

              {auction.status !== 'ACTIVE' && (
                <div className="bg-gray-100 text-gray-500 p-4 rounded-lg text-center font-medium">
                  Subasta finalizada
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};