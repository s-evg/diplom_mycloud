import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import api from '../api/api';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,
  VStack,
  Text,
} from "@chakra-ui/react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/auth/register/", formData);
      // await axios.post("/api/auth/register/", formData);
      navigate("/login");
    } catch (err) {
      setError("Ошибка регистрации. Возможно, такой пользователь уже существует.");
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt="100px" p="6" boxShadow="md" borderRadius="md">
      <Heading size="lg" textAlign="center">Регистрация</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Логин</FormLabel>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormControl>
          <FormControl>
            <FormLabel>Пароль</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormControl>
          <FormControl>
            <FormLabel>Повторите пароль</FormLabel>
            <Input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button colorScheme="blue" type="submit">Зарегистрироваться</Button>
        </VStack>
      </form>
    </Box>
  );
};

export default RegisterPage;
