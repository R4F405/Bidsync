import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
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

          // Check if there is an existing DRAFT auction
          if (item.auctions && item.auctions.length > 0) {
            const draftAuction = item.auctions.find((a: any) => a.status === 'DRAFT');
            if (draftAuction) {
              setNewAuction(draftAuction);
            }
          }
        })
        .catch(err => {
          console.error(err);
          setError('No se pudo cargar la información del artículo.');
        });
    }
  }, [itemId]);

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
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Borrador Creado!</h1>
          <p className="text-gray-600 mb-6">
            Tu subasta para <strong>{itemTitle}</strong> está lista para ser publicada.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-8 inline-block text-left">
            <p className="text-sm text-gray-500">Estado actual: <span className="font-medium text-gray-900">{newAuction.status}</span></p>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            onClick={handlePublishAuction}
            disabled={isLoading}
            className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-white transition-all ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-opacity-90 shadow-md hover:shadow-lg transform active:scale-95'
              }`}
          >
            {isLoading ? 'Publicando...' : 'Publicar Subasta Ahora'}
          </button>
        </div>
      </div>
    );
  }

  // Si no, mostramos el formulario de creación de subasta
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paso 2: Configurar Subasta</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6 pb-6 border-b border-gray-100">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Artículo seleccionado</p>
          <h2 className="text-xl font-bold text-gray-800 mt-1">{itemTitle || 'Cargando...'}</h2>
        </div>

        <form onSubmit={handleCreateAuction} className="space-y-6">
          <div>
            <label htmlFor="startPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Precio de Salida (€)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
              <input
                id="startPrice"
                type="number"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
                required
                step="0.01"
                min="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Opciones Avanzadas (Opcional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reservePrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Reserva
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                  <input
                    id="reservePrice"
                    type="number"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    placeholder="Ej: 50.00"
                    step="0.01"
                    min="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Mínimo oculto para vender.</p>
              </div>

              <div>
                <label htmlFor="buyNowPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  ¡Cómpralo Ya!
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                  <input
                    id="buyNowPrice"
                    type="number"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    placeholder="Ej: 150.00"
                    step="0.01"
                    min="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Precio de venta inmediata.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-opacity-90 shadow-md hover:shadow-lg transform active:scale-95'
              }`}
          >
            {isLoading ? 'Guardando...' : 'Guardar Borrador'}
          </button>
        </form>
      </div>
    </div>
  );
};