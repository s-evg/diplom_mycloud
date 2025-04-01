import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Login } from './components/Login/Login';
import { Menu } from './components/Menu/Menu';
import { AuthProvider } from './contexts/useAuth';
import { PrivateRoute } from './components/PrivateRoute/PrivateRoute'
import { Register } from './components/Register/Register';
function App() {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/login' element={<Login/>} />;
            <Route path='/register' element={<Register/>} />;
            <Route path='/' element={<PrivateRoute> <Menu /> </PrivateRoute>} />;
          </Routes>
          </AuthProvider>
      </Router>
    </ChakraProvider>

  );
}

export default App;