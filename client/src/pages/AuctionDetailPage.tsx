// client/src/pages/AuctionDetailPage.tsx
import { useState, useEffect, FormEvent } from 'react';
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

  // Efecto para cargar datos Y LUEGO conectar al WebSocket
  useEffect(() => {
    if (!auctionId) return;

    let isMounted = true;

    const setupAuctionAndSocket = async () => {
      try {
        setIsLoading(true);
        // Cargar datos públicos de la subasta
        const data = await auctionService.getAuctionById(auctionId);
        if (!isMounted) return;
        setAuction(data);

        let userMaxBid: number | null = null;

        // Si estamos logueados, cargar nuestra puja máxima
        if (isAuthenticated && user) {
          const myBid = await bidService.getMyBid(auctionId);
          if (isMounted && myBid) {
            setMyMaxBid(myBid.maxAmount);
            userMaxBid = myBid.maxAmount;
          }
        }

        // Inicializar el input de puja
        if (data.highestBidderId === user?.userId) {
          // Si SOMOS el pujador más alto, pre-rellenamos con nuestra puja máxima
          if (userMaxBid) {
            setBidAmount(userMaxBid.toFixed(2));
          }
        } else {
          // Si NO somos el pujador más alto, sugerimos un incremento
          setBidAmount((data.currentPrice + 1).toFixed(2));
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError('No se pudo cargar la subasta.');
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // Conectar al WebSocket
      if (isMounted) {
        socket.connect();
        socket.emit('joinAuction', auctionId);
        socket.on('auctionUpdate', handleAuctionUpdate);
      }
    };

    const handleAuctionUpdate = (payload: any) => {
      if (!isMounted) return;

      console.log('¡Actualización de WebSocket recibida!', payload);
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

      // Si nos han sobrepujado
      if (payload.highestBidderId !== user?.userId) {
        setBidAmount((payload.currentPrice + 1).toFixed(2));
        setMyMaxBid(null); // Ya no tenemos la puja máxima
        setLastSuccessfulBidAmount(null); // Ocultar el mensaje verde
      }
    };

    setupAuctionAndSocket();

    // Limpieza al desmontar el componente
    return () => {
      isMounted = false;
      console.log('Saliendo de la sala y desconectando...');
      socket.off('auctionUpdate', handleAuctionUpdate);
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [auctionId, user, isAuthenticated]); // Dependencias correctas

  // Función para manejar el envío de la puja
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

      // Actualizamos AMBOS estados para feedback inmediato
      setLastSuccessfulBidAmount(amount); // Para el mensaje verde temporal
      setMyMaxBid(amount); // Para el mensaje persistente
    } catch (err: any) {
      console.error(err);
      setBidError(err.response?.data?.message || 'Error al procesar la puja.');
    } finally {
      setIsBidding(false);
    }
  };

  if (isLoading) return <div>Cargando subasta... ⏳</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!auction) return <div>No se encontró la subasta.</div>;

  const isOwner = user?.userId === auction.item.ownerId;
  const isHighestBidder = user?.userId === auction.highestBidderId;

  return (
    <div>
      {/* Carrusel de imágenes */}
      {auction.item.images && auction.item.images.length > 0 ? (
        <img
          src={`${API_URL}${auction.item.images[0].url}`}
          alt={auction.item.title}
          style={{ maxWidth: '400px', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '400px',
            height: '300px',
            background: '#555',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Sin imagen
        </div>
      )}

      <h1>{auction.item.title}</h1>
      <p>{auction.item.description}</p>

      <hr />

      {/* --- BLOQUE DE ESTADO DE PUJA --- */}
      <div style={{ padding: '1rem', background: '#333' }}>
        <p style={{ fontSize: '1.5rem', color: '#87CEEB', margin: 0 }}>
          Precio actual: <strong>€{auction.currentPrice.toFixed(2)}</strong>
        </p>

        {/* Lógica de renderizado persistente */}
        {isHighestBidder ? (
          <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            ¡Tú eres el pujador más alto!
            {myMaxBid && (
              <span
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 'normal',
                  color: '#ccc',
                }}
              >
                (Tu puja máxima está configurada en €{myMaxBid.toFixed(2)})
              </span>
            )}
          </p>
        ) : (
          <p>
            Pujador más alto:{' '}
            {auction.highestBidderId
              ? 'Otro usuario'
              : 'Nadie (precio inicial)'}
          </p>
        )}

        <p>Termina en: {new Date(auction.endTime).toLocaleString()}</p>
        <p>Estado: <strong>{auction.status}</strong></p>
      </div>

      {auction.status === 'ACTIVE' && (
        <form onSubmit={handleBidSubmit} style={{ marginTop: '1rem' }}>
          <h3>Realizar Puja</h3>
          {isOwner && (
            <p style={{ color: 'orange' }}>
              No puedes pujar en tu propio artículo.
            </p>
          )}
          {!isAuthenticated && (
            <p style={{ color: 'orange' }}>
              Debes <Link to="/login">iniciar sesión</Link> para pujar.
            </p>
          )}

          <input
            id="bidAmount"
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
          />
          <button
            id="placeBidBtn"
            type="submit"
            disabled={isBidding || isOwner || !isAuthenticated}
          >
            {isBidding ? 'Pujando...' : 'Pujar (Máx. €)'}
          </button>
        </form>
      )}

      {/* Mensaje de error */}
      {bidError && <p style={{ color: 'red', marginTop: '1rem' }}>{bidError}</p>}

      {/* Mensaje verde de confirmación */}
      {lastSuccessfulBidAmount &&
        isHighestBidder &&
        auction.status === 'ACTIVE' && (
          <div
            style={{
              color: '#4CAF50',
              marginTop: '1rem',
              border: '1px solid #4CAF50',
              padding: '0.5rem',
              background: 'rgba(76, 175, 80, 0.1)',
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>¡Puja máxima aceptada!</strong>
            </p>
          </div>
        )}

      {auction.status !== 'ACTIVE' && (
        <h3 style={{ color: 'orange' }}>La subasta ha finalizado.</h3>
      )}
    </div>
  );
};