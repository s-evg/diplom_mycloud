import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
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

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.username, formData.password);
    if (success) {
      navigate("/storage");
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt="100px" p="6" boxShadow="md" borderRadius="md">
      <Heading size="lg" textAlign="center">Вход</Heading>
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
            <FormLabel>Пароль</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button colorScheme="blue" type="submit">Войти</Button>
        </VStack>
      </form>
    </Box>
  );
};

export default LoginPage;
