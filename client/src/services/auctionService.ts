import apiClient from './apiClient';

interface CreateAuctionDto {
  itemId: string;
  startTime: string; // ISO Date String
  endTime: string; // ISO Date String
  startPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
}

// Usamos 'any' por ahora para la respuesta, podríamos definir un tipo Auction completo más tarde
type Auction = any;

export const auctionService = {
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