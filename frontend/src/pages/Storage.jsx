import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFiles, uploadFile, deleteFile, updateFile } from '../api/storage';
import { useAuth } from '../hooks/useAuth';

export default function Storage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchFiles = async () => {
      try {
        const response = await getFiles();
        setFiles(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [user, navigate]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await uploadFile(file, '', false);
      const response = await getFiles();
      setFiles(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTogglePublic = async (fileId, isPublic) => {
    try {
      await updateFile(fileId, { is_public: !isPublic });
      const response = await getFiles();
      setFiles(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>File Storage</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <div>
        <input type="file" onChange={handleUpload} />
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Тип</th>
            <th>Размер</th>
            <th>Добавлен</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.id}>
              <td>{file.name}</td>
              <td>{file.file_type}</td>
              <td>{file.size}</td>
              <td>{new Date(file.published).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleTogglePublic(file.id, file.is_public)}>
                  {file.is_public ? 'Публичный' : 'Частный'}
                </button>
              </td>
              <td>
                <button onClick={() => handleDelete(file.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}