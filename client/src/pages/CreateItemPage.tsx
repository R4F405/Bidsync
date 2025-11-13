import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';

export const CreateItemPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Procesamos las imágenes seleccionadas
    try {
      const newItem = await itemService.createItem(
        { title, description },
        files,
      );

      // ¡Éxito! Redirigimos al usuario al Paso 2: Crear la subasta para este item
      navigate(`/auctions/new/${newItem.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al crear el artículo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Paso 1: Describe tu Artículo</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
          />
        </div>
        <div>
          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
          />
        </div>
        <div>
          <label htmlFor="images">Imágenes (JPG, PNG):</label>
          <input
            id="images"
            type="file"
            multiple // Permitir múltiples archivos
            accept=".jpg,.jpeg,.png" // Restringir tipos de archivo
            onChange={handleFileChange}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Siguiente: Crear Subasta'}
        </button>
      </form>
    </div>
  );
};