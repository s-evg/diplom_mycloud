import React from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <Box textAlign="center" mt={20}>
      <Heading size="2xl">404</Heading>
      <Text fontSize="xl" mt={4}>Страница не найдена</Text>
      <Button as={Link} to="/" colorScheme="blue" mt={6}>
        На главную
      </Button>
    </Box>
  );
};

export default NotFoundPage;
