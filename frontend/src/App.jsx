import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./providers/AuthProvider";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;
