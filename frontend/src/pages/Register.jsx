import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Сбрасываем ошибку при изменении данных
    setErrorMessage('');
  };

  const validateForm = () => {
    // Клиентская валидация перед отправкой
    if (formData.password !== formData.password2) {
      setErrorMessage('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Пароль должен быть не менее 8 символов');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      // Просто показываем сообщение об ошибке, которое пришло с сервера
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="register-form">
      <h2>Регистрация</h2>
      
      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Имя пользователя:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Пароль (мин. 8 символов):</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
          />
        </div>

        <div className="form-group">
          <label>Подтвердите пароль:</label>
          <input
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}