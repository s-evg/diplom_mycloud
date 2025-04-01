import { VStack, Button, FormControl, FormLabel, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "react-router-dom";
// import { login } from "../../endpoints/api.js";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const { loginUser } = useAuth();

  const handleLogin = () => {
      loginUser(username, password)
  };

  const handleNav = () => {
    nav('/register')
  }
  return (
    // <h1>Login</h1>
    <VStack>
      <FormControl>
        <FormLabel>Имя пользователя</FormLabel>
        <Input onChange={(e) => setUsername(e.target.value)} value={username} type='text'/>
      </FormControl>
      <FormControl>
        <FormLabel>Пароль</FormLabel>
        <Input onChange={(e) => setPassword(e.target.value)} value={password} type='password'/>
      </FormControl>
      <Button onClick={handleLogin}>Войти</Button>
      <Text onClick={handleNav}>Нет аккаунта? Зарегистрироваться</Text>
    </VStack>
  );
};

// export default Login;
