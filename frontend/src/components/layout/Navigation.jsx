import {
    Box,
    Flex,
    Heading,
    Button,
    Spacer,
    HStack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const Navigation = () => {
    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();
    const currentUser = authService.getCurrentUser();

    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    const handleLogout = () => {
        authService.logout();
        navigate("/");
    };

    return (
        <Box bg={bg} borderBottom='1px' borderColor={borderColor} px={4} py={3}>
            <Flex align='center' maxW='1200px' mx='auto'>
                {/* Логотип приложения */}
                <Heading
                    as={Link}
                    to='/'
                    size='lg'
                    color='blue.500'
                    cursor='pointer'
                >
                    My Cloud
                </Heading>

                <Spacer />

                {/* Навигационные элементы */}
                <HStack spacing={4}>
                    {!isAuthenticated ? (
                        // Меню для неавторизованных пользователей
                        <>
                            <Button
                                as={Link}
                                to='/login'
                                variant='ghost'
                                colorScheme='blue'
                            >
                                Вход
                            </Button>
                            <Button
                                as={Link}
                                to='/register'
                                colorScheme='blue'
                                size='sm'
                            >
                                Регистрация
                            </Button>
                        </>
                    ) : (
                        // Меню для авторизованных пользователей
                        <>
                            {/* Приветствие пользователя */}
                            <Text fontSize='sm' color='gray.600'>
                                Привет, <strong>{currentUser?.username}</strong>
                                {isAdmin && (
                                    <Text
                                        as='span'
                                        ml={2}
                                        color='red.500'
                                        fontSize='xs'
                                    >
                                        (Администратор)
                                    </Text>
                                )}
                            </Text>

                            {/* Основные разделы */}
                            <Button
                                as={Link}
                                to='/files'
                                variant='ghost'
                                colorScheme='blue'
                            >
                                Мои файлы
                            </Button>

                            {/* Админская панель - только для администраторов */}
                            {isAdmin && (
                                <Button
                                    as={Link}
                                    to='/admin'
                                    variant='ghost'
                                    colorScheme='red'
                                >
                                    Админ-панель
                                </Button>
                            )}

                            {/* Выход из системы */}
                            <Button
                                onClick={handleLogout}
                                variant='outline'
                                size='sm'
                            >
                                Выход
                            </Button>
                        </>
                    )}
                </HStack>
            </Flex>
        </Box>
    );
};

export default Navigation;
