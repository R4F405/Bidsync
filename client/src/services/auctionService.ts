import apiClient from './apiClient';
import type { Auction } from '../types/auction';

interface CreateAuctionDto {
  itemId: string;
  startTime: string; // ISO Date String
  endTime: string; // ISO Date String
  startPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
}

export const auctionService = {

  /**
   * Obtiene la lista de subastas activas.
   */
  getActiveAuctions: async (): Promise<Auction[]> => {
    const response = await apiClient.get<Auction[]>('/auctions');
    return response.data;
  },

  /**
   * Obtiene una subasta por su ID.
   */
  getAuctionById: async (id: string): Promise<Auction> => {
    const response = await apiClient.get<Auction>(`/auctions/${id}`);
    return response.data;
  },

  /**
   * Llama al endpoint POST /auctions para crear una nueva subasta (en estado DRAFT)
   */
  createAuction: async (data: CreateAuctionDto): Promise<Auction> => {
    const response = await apiClient.post<Auction>('/auctions', data);
    return response.data;
  },

  /**
   * Llama al endpoint PATCH /auctions/:id/status para publicar la subasta
   */
  publishAuction: async (auctionId: string): Promise<Auction> => {
    const response = await apiClient.patch<Auction>(
      `/auctions/${auctionId}/status`,
      { status: 'ACTIVE' }, // El backend espera este DTO
    );
    return response.data;
  },
};