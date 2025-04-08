import React from "react";
import { Box, Heading, Text, VStack, Button } from "@chakra-ui/react";
// import { useAuth } from "../contexts/AuthContext";
import { useAuth } from '../providers/AuthProvider';
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <VStack spacing={6} mt={10} align="center">
      <Heading size="xl">Профиль</Heading>
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
        <Text fontSize="lg"><strong>Имя пользователя:</strong> {user?.username}</Text>
        <Text fontSize="lg"><strong>Email:</strong> {user?.email}</Text>
        <Text fontSize="lg"><strong>Роль:</strong> {user?.is_admin ? "Администратор" : "Пользователь"}</Text>
      </Box>
      <Button colorScheme="red" onClick={handleLogout}>Выйти</Button>
    </VStack>
  );
};

export default ProfilePage;
