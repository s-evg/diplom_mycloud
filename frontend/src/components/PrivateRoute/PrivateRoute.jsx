import { Heading } from "@chakra-ui/react";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate} from "react-router-dom";

export const PrivateRoute =({children}) => {

  const { isAuthenticated, loading} = useAuth(); 
  const nav = useNavigate();

  if (loading) {
    return <Heading>Загрузка...</Heading>
  }

  if (isAuthenticated) {
    return children
  } else {
    nav('/login')
  }
}
