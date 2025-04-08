import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser } from '../api/auth';
import { useAuth } from '../providers/AuthProvider';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();  // Теперь setUser будет доступен

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData);
      const userData = await getCurrentUser();
      setUser(userData);  // Теперь setUser должен работать
      navigate('/storage');
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    }
  };

  return (
    <div className="login-page">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Логин</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Пароль</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default LoginPage;
