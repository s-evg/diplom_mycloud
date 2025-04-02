import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const userData = await login({ username, password });
      console.log('Login successful, user data:', userData);
      
      if (userData?.user?.id) {
        navigate(userData.user.is_admin ? '/admin' : '/storage');
      } else {
        throw new Error('Неполные данные пользователя');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message.includes('401') 
        ? 'Неверное имя пользователя или пароль' 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Вход в систему</h2>
      
      {error && (
        <div className="alert alert-danger">
          {error}
          <div className="mt-2 small text-muted">
            Проверьте правильность введённых данных
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label className="form-label">Имя пользователя:</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group mb-3">
          <label className="form-label">Пароль:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm me-2"></span>
          ) : null}
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}