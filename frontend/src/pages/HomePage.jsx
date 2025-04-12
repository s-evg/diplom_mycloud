import { Heading, VStack, Text } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <VStack spacing={4}>
    <Heading>Облачный сервис для хранения файлов -  MyCloud</Heading>
      <Text>Веб-приложение, которое работает как облачное хранилище.</Text>
      <Text>Приложение позволяет пользователям отображать, загружать, отправлять, скачивать и переименовывать файлы.</Text>
  </VStack>
  );
}