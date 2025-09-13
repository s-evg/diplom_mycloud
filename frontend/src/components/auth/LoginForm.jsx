import { useState, useEffect } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    Alert,
    AlertIcon,
    Container,
    Link as ChakraLink,
    useColorModeValue,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Если уже авторизован - редирект на файлы
    useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate("/files");
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Очищаем ошибку при изменении полей
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Базовая валидация
        if (!formData.username.trim() || !formData.password.trim()) {
            setError("Пожалуйста, заполните все поля");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await authService.login(
                formData.username,
                formData.password
            );

            if (result.success) {
                // Успешная авторизация - редирект на страницу с файлами
                navigate("/files");
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError("Произошла ошибка при входе в систему");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW='md' py={12}>
            <Box
                bg={bg}
                p={8}
                borderRadius='lg'
                boxShadow='lg'
                border='1px'
                borderColor={borderColor}
            >
                <VStack spacing={6}>
                    <Heading size='lg' color='blue.500' textAlign='center'>
                        Вход в My Cloud
                    </Heading>

                    <Text textAlign='center' color='gray.600'>
                        Введите свои данные для входа в систему
                    </Text>

                    {error && (
                        <Alert status='error' borderRadius='md'>
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <Box as='form' onSubmit={handleSubmit} w='full'>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Имя пользователя</FormLabel>
                                <Input
                                    name='username'
                                    type='text'
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder='Введите имя пользователя'
                                    size='lg'
                                    disabled={loading}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Пароль</FormLabel>
                                <Input
                                    name='password'
                                    type='password'
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder='Введите пароль'
                                    size='lg'
                                    disabled={loading}
                                />
                            </FormControl>

                            <Button
                                type='submit'
                                colorScheme='blue'
                                size='lg'
                                w='full'
                                isLoading={loading}
                                loadingText='Выполняется вход...'
                            >
                                Войти
                            </Button>
                        </VStack>
                    </Box>

                    <Box textAlign='center'>
                        <Text fontSize='sm' color='gray.600'>
                            Еще нет аккаунта?{" "}
                            <ChakraLink
                                as={Link}
                                to='/register'
                                color='blue.500'
                                fontWeight='medium'
                            >
                                Зарегистрироваться
                            </ChakraLink>
                        </Text>
                    </Box>
                </VStack>
            </Box>
        </Container>
    );
};

export default LoginForm;
