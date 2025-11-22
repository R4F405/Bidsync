import apiClient from './apiClient';

export const payTransaction = async (transactionId: string) => {
    const response = await apiClient.patch(`/transactions/${transactionId}/pay`);
    return response.data;
};

export const shipItem = async (transactionId: string) => {
    const response = await apiClient.patch(`/transactions/${transactionId}/ship`);
    return response.data;
};

export const confirmReceipt = async (transactionId: string) => {
    const response = await apiClient.patch(`/transactions/${transactionId}/complete`);
    return response.data;
};
