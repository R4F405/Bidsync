// Tipo para el Item anidado
interface AuctionItem {
  title: string;
  description: string;
  images: { url: string }[];
  ownerId: string;
}

// Nuestro tipo principal de Subasta
export interface Auction {
  id: string;
  status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'SOLD' | 'CANCELLED';
  startTime: string;
  endTime: string;
  startPrice: number;
  currentPrice: number;
  highestBidderId: string | null;
  itemId: string;
  item: AuctionItem;
  buyNowPrice?: number | null;
  reservePrice?: number | null;
}