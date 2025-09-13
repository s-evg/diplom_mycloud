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
    FormErrorMessage,
    useColorModeValue,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password2: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Если уже авторизован - редирект на файлы
    useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate("/files");
        }
    }, [navigate]);

    // Валидация логина согласно заданию
    const validateUsername = (username) => {
        const regex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;
        if (!username) {
            return "Логин обязателен";
        }
        if (!regex.test(username)) {
            return "Логин должен содержать только латинские буквы и цифры, начинаться с буквы и иметь длину от 4 до 20 символов";
        }
        return "";
    };

    // Валидация email согласно заданию
    const validateEmail = (email) => {
        const regex = /^[\w.-]+@[\w.-]+\.\w+$/;
        if (!email) {
            return "Email обязателен";
        }
        if (!regex.test(email)) {
            return "Некорректный формат email";
        }
        return "";
    };

    // Валидация пароля согласно заданию
    const validatePassword = (password) => {
        if (!password) {
            return "Пароль обязателен";
        }
        if (password.length < 6) {
            return "Пароль должен содержать не менее 6 символов";
        }
        if (!/[A-Z]/.test(password)) {
            return "Пароль должен содержать хотя бы одну заглавную букву";
        }
        if (!/\d/.test(password)) {
            return "Пароль должен содержать хотя бы одну цифру";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Пароль должен содержать хотя бы один специальный символ";
        }
        return "";
    };

    // Валидация повтора пароля
    const validatePassword2 = (password2, password) => {
        if (!password2) {
            return "Повторите пароль";
        }
        if (password2 !== password) {
            return "Пароли не совпадают";
        }
        return "";
    };

    // Валидация всей формы
    const validateForm = () => {
        const newErrors = {};

        newErrors.username = validateUsername(formData.username);
        newErrors.email = validateEmail(formData.email);
        newErrors.password = validatePassword(formData.password);
        newErrors.password2 = validatePassword2(
            formData.password2,
            formData.password
        );

        // Убираем пустые ошибки
        Object.keys(newErrors).forEach((key) => {
            if (!newErrors[key]) delete newErrors[key];
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Очищаем ошибку для конкретного поля
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Очищаем общую ошибку API
        if (apiError) setApiError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидируем форму
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setApiError("");

        try {
            const result = await authService.register(formData);

            if (result.success) {
                // Успешная регистрация - редирект на страницу с файлами
                navigate("/files");
            } else {
                setApiError(result.error);
            }
        } catch (error) {
            setApiError("Произошла ошибка при регистрации");
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
                        Регистрация в My Cloud
                    </Heading>

                    <Text textAlign='center' color='gray.600'>
                        Создайте аккаунт для доступа к облачному хранилищу
                    </Text>

                    {apiError && (
                        <Alert status='error' borderRadius='md'>
                            <AlertIcon />
                            {apiError}
                        </Alert>
                    )}

                    <Box as='form' onSubmit={handleSubmit} w='full'>
                        <VStack spacing={4}>
                            <FormControl isRequired isInvalid={errors.username}>
                                <FormLabel>Имя пользователя</FormLabel>
                                <Input
                                    name='username'
                                    type='text'
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder='Логин (4-20 символов, латиница)'
                                    size='lg'
                                    disabled={loading}
                                />
                                <FormErrorMessage>
                                    {errors.username}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl isRequired isInvalid={errors.email}>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    name='email'
                                    type='email'
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder='your@email.com'
                                    size='lg'
                                    disabled={loading}
                                />
                                <FormErrorMessage>
                                    {errors.email}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl isRequired isInvalid={errors.password}>
                                <FormLabel>Пароль</FormLabel>
                                <Input
                                    name='password'
                                    type='password'
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder='Минимум 6 символов'
                                    size='lg'
                                    disabled={loading}
                                />
                                <FormErrorMessage>
                                    {errors.password}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl
                                isRequired
                                isInvalid={errors.password2}
                            >
                                <FormLabel>Повторите пароль</FormLabel>
                                <Input
                                    name='password2'
                                    type='password'
                                    value={formData.password2}
                                    onChange={handleInputChange}
                                    placeholder='Повторите пароль'
                                    size='lg'
                                    disabled={loading}
                                />
                                <FormErrorMessage>
                                    {errors.password2}
                                </FormErrorMessage>
                            </FormControl>

                            <Button
                                type='submit'
                                colorScheme='blue'
                                size='lg'
                                w='full'
                                isLoading={loading}
                                loadingText='Создается аккаунт...'
                            >
                                Зарегистрироваться
                            </Button>
                        </VStack>
                    </Box>

                    <Box textAlign='center'>
                        <Text fontSize='sm' color='gray.600'>
                            Уже есть аккаунт?{" "}
                            <ChakraLink
                                as={Link}
                                to='/login'
                                color='blue.500'
                                fontWeight='medium'
                            >
                                Войти в систему
                            </ChakraLink>
                        </Text>
                    </Box>

                    {/* Требования к паролю */}
                    <Box
                        bg='blue.50'
                        p={4}
                        borderRadius='md'
                        w='full'
                        border='1px'
                        borderColor='blue.200'
                    >
                        <Text
                            fontSize='sm'
                            fontWeight='medium'
                            mb={2}
                            color='blue.800'
                        >
                            Требования к паролю:
                        </Text>
                        <VStack
                            align='start'
                            spacing={1}
                            fontSize='xs'
                            color='blue.700'
                        >
                            <Text>• Минимум 6 символов</Text>
                            <Text>• Хотя бы одна заглавная буква (A-Z)</Text>
                            <Text>• Хотя бы одна цифра (0-9)</Text>
                            <Text>
                                • Хотя бы один специальный символ (!@#$%^&*...)
                            </Text>
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </Container>
    );
};

export default RegisterForm;
