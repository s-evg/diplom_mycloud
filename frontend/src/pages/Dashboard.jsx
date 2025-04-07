// import { useAuth } from "../contexts/AuthContext";
import { useAuth } from "../providers/AuthProvider";
import { Button, Heading, VStack } from "@chakra-ui/react";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <VStack spacing={4}>
      <Heading>Привет, {user?.user}!</Heading>
      <Button onClick={logout}>Выйти</Button>
    </VStack>
  );
};

export default Dashboard;
