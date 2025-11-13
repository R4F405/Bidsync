import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { itemService } from '../services/itemService';

// Helper para obtener fechas en formato 'datetime-local'
const getLocalDateTimeString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

export const CreateAuctionPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [itemTitle, setItemTitle] = useState<string | null>(null);

  // Estados del formulario
  const [startPrice, setStartPrice] = useState('10.00');
  const [startTime, setStartTime] = useState(getLocalDateTimeString(now));
  const [endTime, setEndTime] = useState(getLocalDateTimeString(tomorrow));
  const [reservePrice, setReservePrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');

  // Estado del flujo
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newAuction, setNewAuction] = useState<any | null>(null); // Almacena la subasta creada

  // Buscar los detalles del artículo al cargar la página
  useEffect(() => {
    if (itemId) {
      itemService.getItemById(itemId)
        .then(item => {
          setItemTitle(item.title); // Guardamos el título
        })
        .catch(err => {
          console.error(err);
          setError('No se pudo cargar la información del artículo.');
        });
    }
  }, [itemId]); // Se ejecuta cada vez que el itemId cambie

  const handleCreateAuction = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemId) {
      setError('No se ha proporcionado un ID de artículo.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const auctionData = {
        itemId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        startPrice: parseFloat(startPrice),
        reservePrice: reservePrice ? parseFloat(reservePrice) : undefined,
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : undefined,
      };

      const createdAuction = await auctionService.createAuction(auctionData);
      setNewAuction(createdAuction); // Guardamos la subasta creada
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al crear la subasta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishAuction = async () => {
    if (!newAuction) return;
    setError(null);
    setIsLoading(true);
    try {
      await auctionService.publishAuction(newAuction.id);
      // ¡Éxito! Redirigimos a la página principal (o a la de la subasta, si existiera)
      alert('¡Subasta publicada con éxito!');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al publicar la subasta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si la subasta ya se creó (está en DRAFT), mostramos el botón de Publicar
  if (newAuction) {
    return (
      <div>
        <h1>Subasta Creada en Borrador</h1>
        <p>Tu subasta para el artículo {newAuction.itemId} ha sido creada con el ID: {newAuction.id}.</p>
        <p>Estado actual: <strong>{newAuction.status}</strong></p>
        <p>Ahora puedes publicarla para que los usuarios puedan pujar.</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handlePublishAuction} disabled={isLoading}>
          {isLoading ? 'Publicando...' : 'Publicar Subasta Ahora'}
        </button>
      </div>
    );
  }

  // Si no, mostramos el formulario de creación de subasta
  return (
    <div>
      <h1>Paso 2: Configurar Subasta (para Artículo {itemTitle})</h1>
      <form onSubmit={handleCreateAuction}>
        <div>
          <label htmlFor="startPrice">Precio de Salida (€):</label>
          <input
            id="startPrice"
            type="number"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
            required
            step="0.01"
            min="0.01"
          />
        </div>
        <div>
          <label htmlFor="startTime">Fecha de Inicio:</label>
          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="endTime">Fecha de Fin:</label>
          <input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reservePrice">Precio de Reserva (Opcional):</label>
          <input
            id="reservePrice"
            type="number"
            value={reservePrice}
            onChange={(e) => setReservePrice(e.target.value)}
            placeholder="Ej: 50.00"
            step="0.01"
            min="0.01"
          />
        </div>
        <div>
          <label htmlFor="buyNowPrice">¡Cómpralo Ya! (Opcional):</label>
          <input
            id="buyNowPrice"
            type="number"
            value={buyNowPrice}
            onChange={(e) => setBuyNowPrice(e.target.value)}
            placeholder="Ej: 150.00"
            step="0.01"
            min="0.01"
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Borrador'}
        </button>
      </form>
    </div>
  );
};