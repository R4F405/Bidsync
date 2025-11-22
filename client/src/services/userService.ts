import apiClient from './apiClient';

export interface UserItem {
    id: string;
    title: string;
    description: string;
    images: { url: string }[];
    auctions: {
        id: string;
        status: string;
        currentPrice: number;
        transaction?: {
            id: string;
            status: string;
        };
    }[];
}

export interface UserBid {
    id: string;
    maxAmount: number;
    createdAt: string;
    auction: {
        id: string;
        currentPrice: number;
        status: string;
        item: {
            title: string;
            images: { url: string }[];
        };
    };
}

export interface WonAuction {
    id: string;
    currentPrice: number;
    item: {
        title: string;
        images: { url: string }[];
    };
    transaction?: {
        id: string;
        status: string;
    };
}

export const getUserItems = async (): Promise<UserItem[]> => {
    const response = await apiClient.get('/users/me/items');
    return response.data;
};

export const getUserBids = async (): Promise<UserBid[]> => {
    const response = await apiClient.get('/users/me/bids');
    return response.data;
};

export const getUserWonAuctions = async (): Promise<WonAuction[]> => {
    const response = await apiClient.get('/users/me/won-auctions');
    return response.data;
};
