import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Input, FormControl,
  FormLabel, Heading, VStack, Text,
} from "@chakra-ui/react";
import { useAuth } from "../providers/AuthProvider";
import { login as loginApi, getCurrentUser } from "../api/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // получаем user и setUser из контекста

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginApi(formData);
      const userData = await getCurrentUser();
      setUser(userData);
      navigate("/storage");
    } catch (err) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && window.location.pathname !== "/storage") {
      navigate("/storage");
    }
  }, [user, navigate]);
  

  return (
    <Box maxW="400px" mx="auto" mt="100px" p="6" boxShadow="md" borderRadius="md">
      <Heading size="lg" textAlign="center" mb={4}>Вход</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Логин</FormLabel>
            <Input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Пароль</FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button colorScheme="blue" type="submit" isLoading={loading} width="100%">
            Войти
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default LoginPage;
