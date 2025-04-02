import { useState, useEffect } from 'react';
import { getUsers } from '../api/admin';
import { useAuth } from '../hooks/useAuth';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (!user || !user.is_admin) {
    return <div>Access denied</div>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Панель администрирования</h2>
      <table>
        <thead>
          <tr>
            <th>Имя пользователя</th>
            <th>Email</th>
            <th>Администратор</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.is_admin ? 'Да' : 'Нет'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}