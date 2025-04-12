import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  HStack,
  useToast,
  Divider,
  Switch,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import api from '../api/api';
import { useAuth } from '../providers/AuthProvider';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { accessToken, user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/admin/users/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      toast({ title: 'Ошибка загрузки пользователей', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleFiles = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await api.delete(`/storage/files/${fileId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: 'Файл удалён', status: 'success' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Ошибка удаления файла', status: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/auth/admin/users/${userId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: 'Пользователь удалён', status: 'success' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Ошибка удаления пользователя', status: 'error' });
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      const updatedUser = { ...user, is_staff: !user.is_staff };
      await api.put(`/auth/admin/users/${user.id}/`, updatedUser, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id ? { ...u, is_staff: updatedUser.is_staff } : u
        )
      );
      toast({ title: 'Права обновлены', status: 'success' });
    } catch (error) {
      toast({ title: 'Ошибка при изменении прав', status: 'error' });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Админ-панель</Heading>
      {loading ? (
        <Spinner />
      ) : (
        <VStack spacing={6} align="stretch">
          {users
            .filter((user) => user.id !== currentUser?.id)
            .map((user) => (
              <Box key={user.id} p={4} borderWidth="1px" borderRadius="lg">
                <HStack justifyContent="space-between">
                  <Box>
                    <Text><strong>Имя:</strong> {user.username}</Text>
                    <Text><strong>Email:</strong> {user.email}</Text>
                    <Text><strong>Файлов:</strong> {user.storage_stats?.file_count || 0}</Text>
                    <Text><strong>Общий размер:</strong> {user.storage_stats?.total_size_mb.toFixed(2)} МБ</Text>
                  </Box>
                  <VStack>
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => window.location.href = `/storage/${user.id}`}
                      >
                        Хранилище
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Удалить
                      </Button>
                    </HStack>
                    {/* Логика отображения файлов каждого пользователя */}
                    {/* <HStack>
                      <Button
                        leftIcon={expandedUserId === user.id ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => toggleFiles(user.id)}
                      >
                        {expandedUserId === user.id ? 'Скрыть' : 'Файлы'}
                      </Button>
                      <IconButton
                        icon={<DeleteIcon />} colorScheme="red"
                        onClick={() => handleDeleteUser(user.id)}
                      />
                    </HStack> */}
                    <HStack>
                      <Text>Админ</Text>
                      <Switch
                        isChecked={user.is_staff}
                        onChange={() => handleToggleAdmin(user)}
                      />
                    </HStack>
                  </VStack>
                </HStack>
                {expandedUserId === user.id && (
                  <Box mt={4} pl={4}>
                    <Divider mb={2} />
                    <VStack align="start" spacing={3}>
                      {user.files && user.files.length > 0 ? (
                        user.files.map((file) => (
                          <HStack key={file.id} justifyContent="space-between" w="100%">
                            <Box>
                              <Text><strong>Имя:</strong> {file.name}</Text>
                              <Text><strong>Размер:</strong> {(file.size / 1024 / 1024).toFixed(2)} МБ</Text>
                              <Text><strong>Загружен:</strong> {new Date(file.published).toLocaleString()}</Text>
                            </Box>
                            <HStack>
                              <a href={file.file} target="_blank" rel="noopener noreferrer">
                                <IconButton icon={<DownloadIcon />} />
                              </a>
                              <IconButton
                                icon={<DeleteIcon />} colorScheme="red"
                                onClick={() => handleDeleteFile(file.id)}
                              />
                            </HStack>
                          </HStack>
                        ))
                      ) : (
                        <Text>Файлы отсутствуют.</Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </Box>
            ))}
        </VStack>
      )}
    </Box>
  );
};

export default Admin;
