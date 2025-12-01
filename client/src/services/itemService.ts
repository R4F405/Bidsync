import apiClient from './apiClient';

// Tipos basados en los DTOs del backend
interface CreateItemTextDto {
  title: string;
  description: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  images: { id: string; url: string }[];
  auctions?: {
    id: string;
    status: string;
    currentPrice: number;
    startTime: string;
    endTime: string;
  }[];
}

export const itemService = {
  /**
   * Llama al endpoint GET /items/:id para obtener los detalles de un artículo.
   */
  getItemById: async (itemId: string): Promise<Item> => {
    const response = await apiClient.get<Item>(`/items/${itemId}`);
    return response.data;
  },

  /**
   * Llama al endpoint POST /items para crear un nuevo artículo.
   * Envía los datos como FormData.
   */
  createItem: async (
    textData: CreateItemTextDto,
    files: FileList,
  ): Promise<Item> => {

    // 1. Crear el objeto FormData
    const formData = new FormData();
    formData.append('title', textData.title);
    formData.append('description', textData.description);

    // 2. Adjuntar todos los archivos
    // El 'images' debe coincidir con el FilesInterceptor del backend
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    // 3. Enviar la petición.
    const response = await apiClient.post<Item>('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};