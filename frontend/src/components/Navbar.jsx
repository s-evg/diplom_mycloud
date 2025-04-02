import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div style={{
      background: '#333',
      color: 'white',
      padding: '10px',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <div>
        <Link to="/" style={{ color: 'white', marginRight: '10px' }}>Главная</Link>
      </div>
      <div>
        {user ? (
          <>
            {user.is_admin && (
              <Link to="/admin" style={{ color: 'white', marginRight: '10px' }}>Администрирование</Link>
            )}
            <Link to="/storage" style={{ color: 'white', marginRight: '10px' }}>Хранилище</Link>
            <button onClick={logout} style={{ marginLeft: '10px' }}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', marginRight: '10px' }}>Войти</Link>
            <Link to="/register" style={{ color: 'white' }}>Регистрация</Link>
          </>
        )}
      </div>
    </div>
  );
}