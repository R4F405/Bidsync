import apiClient from './apiClient';

// Este DTO ahora solo es para la entrada de texto
interface CreateItemTextDto {
  title: string;
  description: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  images: { id: string; url: string }[];
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
    
    // Crear el objeto FormData
    const formData = new FormData();
    formData.append('title', textData.title);
    formData.append('description', textData.description);

    // Adjuntar todos los archivos
    // El 'images' debe coincidir con el FilesInterceptor del backend
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    // 3. Enviar la petición.
    // DEBEMOS sobreescribir el 'Content-Type' header que pone apiClient para que el navegador lo ponga automáticamente como 'multipart/form-data' junto con el 'boundary' correcto.
    const response = await apiClient.post<Item>('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};