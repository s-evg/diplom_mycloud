import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/layout/Navigation.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import RegisterForm from "./components/auth/RegisterForm.jsx";
import FileManager from "./components/files/FileManager.jsx";
import AdminPanel from "./components/admin/AdminPanel.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";

function App() {
    return (
        <ChakraProvider>
            <Router>
                <Box minH='100vh' bg='gray.50'>
                    <Navigation />
                    <Box maxW='1200px' mx='auto' px={4} py={8}>
                        <Routes>
                            <Route path='/' element={<HomePage />} />
                            <Route path='/login' element={<LoginForm />} />
                            <Route
                                path='/register'
                                element={<RegisterForm />}
                            />
                            <Route
                                path='/files'
                                element={
                                    <ProtectedRoute>
                                        <FileManager />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path='/admin'
                                element={
                                    <ProtectedRoute requireAdmin={true}>
                                        <AdminPanel />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ChakraProvider>
    );
}

export default App;
