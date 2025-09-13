import { useState, useEffect, useCallback } from "react";
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    Badge,
    useToast,
    Container,
    Spinner,
    Alert,
    AlertIcon,
    Switch,
    useColorModeValue,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Divider,
} from "@chakra-ui/react";
import { FiTrash2, FiUsers } from "react-icons/fi";
import apiService from "../../services/apiService";
import authService from "../../services/authService";

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const toast = useToast();
    const bg = useColorModeValue("white", "gray.800");
    const currentUser = authService.getCurrentUser();

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const result = await apiService.getUsers();

        if (result.success) {
            setUsers(result.data);
        } else {
            toast({
                title: "Ошибка загрузки пользователей",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
        setLoading(false);
    }, [toast]);
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Удаление пользователя
    const handleDeleteUser = async (userId, username) => {
        if (
            !window.confirm(
                `Вы уверены, что хотите удалить пользователя "${username}"? Это действие нельзя отменить. Все файлы пользователя будут удалены.`
            )
        ) {
            return;
        }

        const result = await apiService.deleteUser(userId);

        if (result.success) {
            toast({
                title: "Пользователь удален",
                description: `Пользователь ${username} и все его файлы удалены`,
                status: "success",
                duration: 3000,
            });
            loadUsers();
        } else {
            toast({
                title: "Ошибка удаления пользователя",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
    };

    // Изменение прав администратора
    const handleToggleAdmin = async (userId, currentAdminStatus, username) => {
        const newStatus = !currentAdminStatus;
        const result = await apiService.updateUserRights(userId, newStatus);

        if (result.success) {
            toast({
                title: "Права изменены",
                description: `Пользователь ${username} ${
                    newStatus ? "получил" : "лишен"
                } прав администратора`,
                status: "success",
                duration: 3000,
            });
            loadUsers();
        } else {
            toast({
                title: "Ошибка изменения прав",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
    };

    // Вычисляем статистику
    const totalUsers = users.length;
    const totalAdmins = users.filter((user) => user.is_admin).length;
    const totalFiles = users.reduce(
        (sum, user) => sum + (user.storage_stats?.file_count || 0),
        0
    );
    const totalSize = users.reduce(
        (sum, user) => sum + (user.storage_stats?.total_size_mb || 0),
        0
    );

    return (
        <Container maxW='6xl' py={8}>
            <VStack spacing={6} align='stretch'>
                {/* Заголовок */}
                <HStack justify='space-between' align='center'>
                    <Heading size='lg' color='red.500'>
                        Административная панель
                    </Heading>
                    {/* <Button
            leftIcon={<FiRefreshCw />}
            onClick={loadUsers}
            variant="outline"
            size="sm"
          >
            Обновить данные
          </Button> */}
                </HStack>

                {/* Информация о текущем админе */}
                <Alert status='info' borderRadius='md'>
                    <AlertIcon />
                    <Box>
                        <Text fontWeight='medium'>
                            Административный доступ:{" "}
                            <strong>{currentUser?.username}</strong>
                        </Text>
                        <Text fontSize='sm' color='gray.600'>
                            Управление пользователями и системными параметрами
                        </Text>
                    </Box>
                </Alert>

                {/* Общая статистика системы */}
                <Box
                    bg={bg}
                    p={6}
                    borderRadius='lg'
                    boxShadow='sm'
                    border='1px'
                    borderColor='gray.200'
                >
                    <Heading size='md' mb={4} color='gray.700'>
                        <FiUsers
                            style={{ display: "inline", marginRight: "8px" }}
                        />
                        Статистика системы
                    </Heading>
                    <StatGroup>
                        <Stat>
                            <StatLabel>Всего пользователей</StatLabel>
                            <StatNumber color='blue.500'>
                                {totalUsers}
                            </StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Администраторов</StatLabel>
                            <StatNumber color='red.500'>
                                {totalAdmins}
                            </StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Всего файлов</StatLabel>
                            <StatNumber color='green.500'>
                                {totalFiles}
                            </StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Общий объем</StatLabel>
                            <StatNumber color='purple.500'>
                                {totalSize.toFixed(2)} MB
                            </StatNumber>
                        </Stat>
                    </StatGroup>
                </Box>

                <Divider />

                {/* Управление пользователями */}
                <Box>
                    <Heading size='md' mb={4} color='gray.700'>
                        Управление пользователями
                    </Heading>

                    <Box
                        bg={bg}
                        borderRadius='lg'
                        overflow='hidden'
                        boxShadow='sm'
                        border='1px'
                        borderColor='gray.200'
                    >
                        {loading ? (
                            <Box p={8} textAlign='center'>
                                <Spinner size='lg' color='blue.500' />
                                <Text mt={4} color='gray.600'>
                                    Загрузка пользователей...
                                </Text>
                            </Box>
                        ) : (
                            <Table variant='simple'>
                                <Thead bg='gray.50'>
                                    <Tr>
                                        <Th>Пользователь</Th>
                                        <Th>Email</Th>
                                        <Th>Права доступа</Th>
                                        <Th>Файловое хранилище</Th>
                                        <Th>Действия</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {users.map((user) => (
                                        <Tr key={user.id}>
                                            <Td>
                                                <VStack
                                                    align='start'
                                                    spacing={1}
                                                >
                                                    <Text fontWeight='medium'>
                                                        {user.username}
                                                    </Text>
                                                    {user.id ===
                                                        currentUser?.id && (
                                                        <Badge
                                                            colorScheme='blue'
                                                            size='sm'
                                                        >
                                                            Текущий админ
                                                        </Badge>
                                                    )}
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <Text fontSize='sm'>
                                                    {user.email}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <VStack
                                                    align='start'
                                                    spacing={2}
                                                >
                                                    <Badge
                                                        colorScheme={
                                                            user.is_admin
                                                                ? "red"
                                                                : "gray"
                                                        }
                                                        variant={
                                                            user.is_admin
                                                                ? "solid"
                                                                : "outline"
                                                        }
                                                    >
                                                        {user.is_admin
                                                            ? "Администратор"
                                                            : "Пользователь"}
                                                    </Badge>
                                                    <HStack>
                                                        <Text
                                                            fontSize='xs'
                                                            color='gray.600'
                                                        >
                                                            Админ права:
                                                        </Text>
                                                        <Switch
                                                            size='sm'
                                                            isChecked={
                                                                user.is_admin
                                                            }
                                                            onChange={() =>
                                                                handleToggleAdmin(
                                                                    user.id,
                                                                    user.is_admin,
                                                                    user.username
                                                                )
                                                            }
                                                            isDisabled={
                                                                user.id ===
                                                                currentUser?.id
                                                            }
                                                        />
                                                    </HStack>
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <VStack
                                                    align='start'
                                                    spacing={1}
                                                >
                                                    <Text fontSize='sm'>
                                                        <strong>
                                                            {user.storage_stats
                                                                ?.file_count ||
                                                                0}
                                                        </strong>{" "}
                                                        файлов
                                                    </Text>
                                                    <Text
                                                        fontSize='xs'
                                                        color='gray.600'
                                                    >
                                                        {(
                                                            user.storage_stats
                                                                ?.total_size_mb ||
                                                            0
                                                        ).toFixed(2)}{" "}
                                                        MB
                                                    </Text>
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <VStack spacing={2}>
                                                    <IconButton
                                                        icon={<FiTrash2 />}
                                                        size='sm'
                                                        colorScheme='red'
                                                        variant='outline'
                                                        title='Удалить пользователя'
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                user.id,
                                                                user.username
                                                            )
                                                        }
                                                        isDisabled={
                                                            user.id ===
                                                            currentUser?.id
                                                        }
                                                    />
                                                    {user.id ===
                                                        currentUser?.id && (
                                                        <Text
                                                            fontSize='xs'
                                                            color='gray.500'
                                                            textAlign='center'
                                                        >
                                                            Нельзя удалить себя
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        )}
                    </Box>
                </Box>

                {/* Информационное сообщение */}
                <Box
                    bg='blue.50'
                    p={4}
                    borderRadius='md'
                    border='1px'
                    borderColor='blue.200'
                >
                    <Text fontSize='sm' color='blue.800'>
                        <strong>Примечание:</strong> Для управления файлами
                        пользователей используйте раздел "Мои файлы" с
                        возможностью выбора пользователя (доступно
                        администраторам). Данная панель предназначена только для
                        управления пользователями и системными параметрами.
                    </Text>
                </Box>
            </VStack>
        </Container>
    );
};

export default AdminPanel;
