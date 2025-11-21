export interface Bid {
  id: string;
  maxAmount: number;
  createdAt: string;
  auctionId: string;
  bidderId: string;
};

export interface CreateBidDto {
  auctionId: string;
  maxAmount: number;
}