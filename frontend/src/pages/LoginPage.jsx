import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, Heading, VStack, FormControl, FormLabel, Text } from "@chakra-ui/react";
import { login as loginUser, getCurrentUser } from "../api/auth";
import { useAuth } from "../providers/AuthProvider";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const tokenData = await loginUser(form);
      const userData = await getCurrentUser();
      login(tokenData, userData);           // Сохраняем токены и юзера
      navigate("/storage");                 // ✅ редирект после логина
    } catch (err) {
      setError("Неверные данные для входа");
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading mb={6} textAlign="center">Вход в аккаунт</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="username">
            <FormLabel>Логин</FormLabel>
            <Input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Пароль</FormLabel>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit" colorScheme="blue" width="full">
            Войти
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default LoginPage;
