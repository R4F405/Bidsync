import apiClient from './apiClient';
import type { Bid } from '../types/bid';
import type { CreateBidDto } from '../types/bid';

export const bidService = {
  /**
   * Llama al endpoint POST /bids para colocar una puja
   */
  // Usamos el DTO, no el tipo Bid completo
  placeBid: async (data: CreateBidDto) => {
    // El BidsService se encarga de la lógica de proxy y de emitir el evento de WebSocket.
    const response = await apiClient.post('/bids', data);
    return response.data;
  },

  /**
   * Obtiene la puja máxima actual del usuario logueado para una subasta.
   */
  getMyBid: async (auctionId: string): Promise<Bid | null> => {
    try {
      const response = await apiClient.get<Bid>(`/bids/my-bid/${auctionId}`);
      return response.data;
    } catch (error: any) {
      // Si da 404 (porque no hay puja), el servicio devolverá null
      if (error.response && error.response.status === 404) {
        return null;
      }
      // Si es otro error, lo lanzamos
      throw error;
    }
  },
};