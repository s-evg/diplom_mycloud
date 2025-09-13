import {
    Box,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Container,
    SimpleGrid,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import {
    FiCloud,
    FiUpload,
    FiDownload,
    FiShield,
    FiUsers,
} from "react-icons/fi";
import authService from "../services/authService";

const HomePage = () => {
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();
    const bg = useColorModeValue("white", "gray.800");
    const cardBg = useColorModeValue("gray.50", "gray.700");

    const features = [
        {
            icon: FiUpload,
            title: "Загрузка файлов",
            description: "Загружайте файлы любых типов с комментариями",
        },
        {
            icon: FiDownload,
            title: "Публичные ссылки",
            description: "Делитесь файлами через безопасные ссылки",
        },
        {
            icon: FiShield,
            title: "Безопасность",
            description: "JWT авторизация и контроль доступа",
        },
        {
            icon: FiUsers,
            title: "Управление пользователями",
            description: "Административная панель для управления",
        },
    ];

    return (
        <Container maxW='6xl' py={10}>
            <VStack spacing={8} textAlign='center'>
                {/* Заголовок */}
                <Box>
                    <Heading size='2xl' color='blue.500' mb={4}>
                        <Icon as={FiCloud} mr={3} />
                        My Cloud
                    </Heading>
                    <Text fontSize='xl' color='gray.600' maxW='2xl' mx='auto'>
                        Облачное хранилище для безопасного хранения и обмена
                        файлами. Загружайте, управляйте и делитесь вашими
                        документами с полным контролем доступа.
                    </Text>
                </Box>

                {/* Кнопки действий */}
                {!isAuthenticated ? (
                    <HStack spacing={4}>
                        <Button
                            as={Link}
                            to='/register'
                            colorScheme='blue'
                            size='lg'
                        >
                            Зарегистрироваться
                        </Button>
                        <Button
                            as={Link}
                            to='/login'
                            variant='outline'
                            colorScheme='blue'
                            size='lg'
                        >
                            Войти в систему
                        </Button>
                    </HStack>
                ) : (
                    <VStack spacing={4}>
                        <Box bg={cardBg} p={6} borderRadius='lg' minW='300px'>
                            <Text fontSize='lg' mb={2}>
                                Добро пожаловать,{" "}
                                <strong>{currentUser?.username}</strong>!
                            </Text>
                            {currentUser?.is_admin && (
                                <Text color='red.500' fontSize='sm' mb={4}>
                                    Права администратора активны
                                </Text>
                            )}
                            <HStack spacing={3}>
                                <Button
                                    as={Link}
                                    to='/files'
                                    colorScheme='blue'
                                    size='md'
                                >
                                    Мои файлы
                                </Button>
                                {currentUser?.is_admin && (
                                    <Button
                                        as={Link}
                                        to='/admin'
                                        colorScheme='red'
                                        variant='outline'
                                        size='md'
                                    >
                                        Админ-панель
                                    </Button>
                                )}
                            </HStack>
                        </Box>
                    </VStack>
                )}

                {/* Особенности приложения */}
                <Box w='full' mt={16}>
                    <Heading
                        size='lg'
                        textAlign='center'
                        mb={8}
                        color='gray.700'
                    >
                        Возможности My Cloud
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                        {features.map((feature, index) => (
                            <Box
                                key={index}
                                bg={bg}
                                p={6}
                                borderRadius='lg'
                                boxShadow='sm'
                                border='1px'
                                borderColor='gray.200'
                                textAlign='center'
                                _hover={{
                                    boxShadow: "md",
                                    transform: "translateY(-2px)",
                                    transition: "all 0.2s",
                                }}
                            >
                                <Icon
                                    as={feature.icon}
                                    w={10}
                                    h={10}
                                    color='blue.500'
                                    mb={4}
                                />
                                <Heading size='md' mb={2} color='gray.800'>
                                    {feature.title}
                                </Heading>
                                <Text fontSize='sm' color='gray.600'>
                                    {feature.description}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>

                {/* Дополнительная информация */}
                <Box bg={cardBg} p={8} borderRadius='lg' w='full' mt={12}>
                    <VStack spacing={4}>
                        <Heading size='md' color='gray.700'>
                            О приложении
                        </Heading>
                        <Text textAlign='center' color='gray.600' maxW='4xl'>
                            My Cloud - это современное веб-приложение для
                            управления файлами, разработанное с использованием
                            Django и React. Приложение обеспечивает безопасное
                            хранение файлов с возможностью создания публичных
                            ссылок для обмена документами. Административная
                            панель позволяет управлять пользователями и их
                            файловыми хранилищами.
                        </Text>

                        <VStack spacing={2} fontSize='sm' color='gray.500'>
                            <Text>
                                Backend: Django 5 + PostgreSQL + JWT
                                Authentication
                            </Text>
                            <Text>
                                Frontend: React 19 + Chakra UI + React Router
                            </Text>
                        </VStack>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default HomePage;
