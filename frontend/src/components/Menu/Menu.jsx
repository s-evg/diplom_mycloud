import { VStack, Heading, Text, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { get_files, logout } from "../../endpoints/api.js";

export const Menu = () => { 
  const [files, setFiles] = useState([])
  const nav = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await get_files();
      setFiles(files)
      console.log(files)
    }
    fetchFiles();
  }, [])

  const handleLogout = async () =>{
    const success = await logout();
    if (success) {
      nav('/login')
    }

  }
  
  return (
    <VStack>
      <Heading>Добро пожаловать</Heading>
      <VStack>
      {files}
         {/* {files.map((file) => {
            return <Text>{file.name}</Text>
         })} */}
         {/* {files.map((file) => file)} */}
         Text
      </VStack>
      <Button onClick={handleLogout} colorScheme="red">Выход</Button>
    </VStack>
  )
  
}

