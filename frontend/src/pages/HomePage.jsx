import { Link } from 'react-router-dom';
import { Button, Heading, VStack } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <VStack spacing={4}>
    <Heading>Облачный сервис для хранения файлов -  MyCloud</Heading>
    {/* <Button onClick={logout}>Выйти</Button> */}
  </VStack>
    // <div>
    //   <h1>Облачный сервис для хранения файлов -  MyCloud</h1>
    //   <div>
    //     {/* <Link to="/login">Войти</Link> или <Link to="/register">Зарегистрироваться</Link> */}
    //   </div>
    // </div>
  );
}