import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
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
    useColorModeValue,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Switch,
    FormControl,
    FormLabel,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    Card,
    CardBody,
} from "@chakra-ui/react";
import {
    FiUsers,
    FiTrash2,
    FiRefreshCw,
    FiSettings,
    FiHardDrive,
    FiFile,
} from "react-icons/fi";
import apiService from "../../services/apiService";
import authService from "../../services/authService";

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [toggleUserId, setToggleUserId] = useState(null);
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure();
    const cancelRef = React.useRef();

    const toast = useToast();
    const bg = useColorModeValue("white", "gray.800");
    const cardBg = useColorModeValue("gray.50", "gray.700");
    const currentUser = authService.getCurrentUser();

    // Загрузка списка пользователей
    const loadUsers = async () => {
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
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Подтверждение удаления пользователя
    const confirmDelete = (userId) => {
        setDeleteUserId(userId);
        onDeleteOpen();
    };

    // Удаление пользователя
    const handleDeleteUser = async () => {
        const result = await apiService.deleteUser(deleteUserId);

        if (result.success) {
            toast({
                title: "Пользователь удален",
                description: "Пользователь и все его файлы удалены",
                status: "success",
                duration: 3000,
            });
            loadUsers();
        } else {
            toast({
                title: "Ошибка удаления",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }

        onDeleteClose();
        setDeleteUserId(null);
    };

    // Изменение прав администратора
    const handleToggleAdmin = async (userId, currentIsAdmin) => {
        // Нельзя снять права у самого себя
        if (userId === currentUser?.id && currentIsAdmin) {
            toast({
                title: "Ошибка",
                description: "Нельзя снять админские права у самого себя",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        const result = await apiService.updateUserRights(
            userId,
            !currentIsAdmin
        );

        if (result.success) {
            toast({
                title: currentIsAdmin ? "Права сняты" : "Права предоставлены",
                description: `Пользователь ${
                    !currentIsAdmin ? "получил" : "лишился"
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

    // Подсчет общей статистики
    const getTotalStats = () => {
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

        return { totalUsers, totalAdmins, totalFiles, totalSize };
    };

    const stats = getTotalStats();

    return (
        <Container maxW='6xl' py={8}>
            <VStack spacing={6} align='stretch'>
                {/* Заголовок */}
                <HStack justify='space-between' align='center'>
                    <Heading size='lg' color='red.500'>
                        Администрирование системы
                    </Heading>
                    <Button
                        leftIcon={<FiRefreshCw />}
                        onClick={loadUsers}
                        variant='outline'
                        size='sm'
                    >
                        Обновить
                    </Button>
                </HStack>

                {/* Информация о текущем админе */}
                <Box
                    bg='red.50'
                    p={4}
                    borderRadius='md'
                    border='1px'
                    borderColor='red.200'
                >
                    <Text fontSize='sm'>
                        Администратор: <strong>{currentUser?.username}</strong>
                        <Badge ml={2} colorScheme='red'>
                            ADMIN
                        </Badge>
                    </Text>
                </Box>

                {/* Общая статистика */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Card bg={cardBg}>
                        <CardBody>
                            <Stat>
                                <StatLabel display='flex' alignItems='center'>
                                    <FiUsers style={{ marginRight: "8px" }} />
                                    Пользователи
                                </StatLabel>
                                <StatNumber>{stats.totalUsers}</StatNumber>
                                <StatHelpText>
                                    {stats.totalAdmins} админов
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg}>
                        <CardBody>
                            <Stat>
                                <StatLabel display='flex' alignItems='center'>
                                    <FiFile style={{ marginRight: "8px" }} />
                                    Файлы
                                </StatLabel>
                                <StatNumber>{stats.totalFiles}</StatNumber>
                                <StatHelpText>всего файлов</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg}>
                        <CardBody>
                            <Stat>
                                <StatLabel display='flex' alignItems='center'>
                                    <FiHardDrive
                                        style={{ marginRight: "8px" }}
                                    />
                                    Объем
                                </StatLabel>
                                <StatNumber>
                                    {stats.totalSize.toFixed(1)} MB
                                </StatNumber>
                                <StatHelpText>общий размер</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg}>
                        <CardBody>
                            <Stat>
                                <StatLabel>Средний размер</StatLabel>
                                <StatNumber>
                                    {stats.totalFiles > 0
                                        ? (
                                              stats.totalSize / stats.totalFiles
                                          ).toFixed(2)
                                        : "0"}{" "}
                                    MB
                                </StatNumber>
                                <StatHelpText>на файл</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Таблица пользователей */}
                <Box
                    bg={bg}
                    borderRadius='lg'
                    overflow='hidden'
                    boxShadow='sm'
                    border='1px'
                    borderColor='gray.200'
                >
                    <Box
                        p={4}
                        bg='gray.50'
                        borderBottom='1px'
                        borderColor='gray.200'
                    >
                        <Heading size='md'>Управление пользователями</Heading>
                    </Box>

                    {loading ? (
                        <Box p={8} textAlign='center'>
                            <Spinner size='lg' color='red.500' />
                            <Text mt={4} color='gray.600'>
                                Загрузка пользователей...
                            </Text>
                        </Box>
                    ) : (
                        <Table variant='simple'>
                            <Thead bg='gray.50'>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Пользователь</Th>
                                    <Th>Email</Th>
                                    <Th>Файлы</Th>
                                    <Th>Размер</Th>
                                    <Th>Права</Th>
                                    <Th>Действия</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {users.map((user) => (
                                    <Tr key={user.id}>
                                        <Td>{user.id}</Td>
                                        <Td>
                                            <Text fontWeight='medium'>
                                                {user.username}
                                            </Text>
                                        </Td>
                                        <Td>{user.email}</Td>
                                        <Td>
                                            <Text>
                                                {user.storage_stats
                                                    ?.file_count || 0}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text>
                                                {(
                                                    user.storage_stats
                                                        ?.total_size_mb || 0
                                                ).toFixed(1)}{" "}
                                                MB
                                            </Text>
                                        </Td>
                                        <Td>
                                            <HStack>
                                                <FormControl
                                                    display='flex'
                                                    alignItems='center'
                                                >
                                                    <Switch
                                                        isChecked={
                                                            user.is_admin
                                                        }
                                                        onChange={() =>
                                                            handleToggleAdmin(
                                                                user.id,
                                                                user.is_admin
                                                            )
                                                        }
                                                        colorScheme='red'
                                                        size='sm'
                                                        isDisabled={
                                                            user.id ===
                                                                currentUser?.id &&
                                                            user.is_admin
                                                        }
                                                    />
                                                </FormControl>
                                                <Badge
                                                    colorScheme={
                                                        user.is_admin
                                                            ? "red"
                                                            : "gray"
                                                    }
                                                    size='sm'
                                                >
                                                    {user.is_admin
                                                        ? "ADMIN"
                                                        : "USER"}
                                                </Badge>
                                            </HStack>
                                        </Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <IconButton
                                                    icon={<FiTrash2 />}
                                                    size='sm'
                                                    colorScheme='red'
                                                    title='Удалить пользователя'
                                                    onClick={() =>
                                                        confirmDelete(user.id)
                                                    }
                                                    isDisabled={
                                                        user.id ===
                                                        currentUser?.id
                                                    }
                                                />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Box>
            </VStack>

            {/* Диалог подтверждения удаления */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Удалить пользователя
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Вы уверены, что хотите удалить этого пользователя?
                            Все его файлы также будут удалены. Это действие
                            нельзя отменить.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Отмена
                            </Button>
                            <Button
                                colorScheme='red'
                                onClick={handleDeleteUser}
                                ml={3}
                            >
                                Удалить
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Container>
    );
};

export default AdminPanel;
