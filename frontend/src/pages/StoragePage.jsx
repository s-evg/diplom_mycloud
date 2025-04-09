import React, { useState, useEffect } from "react";
import { Box, Heading, Button, VStack, Text, Spinner, useToast, Input, FormControl, FormLabel, Textarea, HStack } from "@chakra-ui/react";
import api from '../api/api';
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const StoragePage = () => {
  const { accessToken, isInitialized } = useAuth();  // Получаем accessToken и флаг инициализации
  const navigate = useNavigate();
  
  const toast = useToast();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);  // Убираем начальную загрузку
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedComment, setEditedComment] = useState("");
  const [fetchError, setFetchError] = useState(false);  // Для отслеживания ошибки

  const fetchFiles = async () => {
    setLoading(true);  // Включаем индикатор загрузки перед вызовом
    try {
      const response = await api.get(`${import.meta.env.VITE_API_URL}/storage/files/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFiles(response.data);  // Загружаем файлы
    } catch (error) {
      setFetchError(true);  // Устанавливаем флаг ошибки
      // Показываем ошибку только один раз, если это не 401 ошибка
      if (error.response?.status !== 401) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить файлы",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);  // Завершаем загрузку
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`${import.meta.env.VITE_API_URL}/storage/files/`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast({ title: "Файл загружен", status: "success", duration: 3000, isClosable: true });
      fetchFiles();  // Загружаем файлы после успешной загрузки
    } catch (error) {
      toast({ title: "Ошибка загрузки", description: error.response?.data?.message, status: "error", duration: 3000, isClosable: true });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await api.delete(`${import.meta.env.VITE_API_URL}/storage/files/${fileId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: "Файл удалён", status: "success", duration: 3000, isClosable: true });
      setFiles(files.filter((file) => file.id !== fileId));
    } catch (error) {
      toast({ title: "Ошибка удаления", status: "error", duration: 3000, isClosable: true });
    }
  };

  const startEditing = (file) => {
    setEditingFile(file);
    setEditedName(file.name);
    setEditedComment(file.comment || "");
  };

  const cancelEditing = () => {
    setEditingFile(null);
    setEditedName("");
    setEditedComment("");
  };

  const saveChanges = async () => {
    if (!editingFile) return;

    try {
      await api.patch(
        `${import.meta.env.VITE_API_URL}/storage/files/${editingFile.id}/`,
        { name: editedName, comment: editedComment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast({ title: "Файл обновлён", status: "success", duration: 3000, isClosable: true });
      fetchFiles();
      cancelEditing();
    } catch (error) {
      toast({ title: "Ошибка обновления", status: "error", duration: 3000, isClosable: true });
    }
  };

  const formatSize = (size) => {
    if (size < 1024) return `${size} Б`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} КБ`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} МБ`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <VStack spacing={6} mt={10} align="center">
      <Text fontSize="lg"><strong>Имя пользователя:</strong> {user?.username}</Text>
      <Heading size="xl">Мои файлы</Heading>

      {/* Отображение общего объема */}
      <Text fontSize="lg" fontWeight="bold">
        Общий объем файлов: {formatSize(totalSize)}
      </Text>

      <FormControl>
        <FormLabel>Выберите файл</FormLabel>
        <Input type="file" onChange={handleFileChange} />
        <Button colorScheme="blue" onClick={uploadFile} isLoading={uploading} mt={2}>
          Загрузить
        </Button>
      </FormControl>

      {loading ? (
        <Spinner size="xl" />
      ) : files.length === 0 ? (
        <Text>Файлы отсутствуют</Text>
      ) : (
        <VStack spacing={4} w="80%">
          {files.map((file) => (
            <Box key={file.id} p={4} shadow="md" borderWidth="1px" borderRadius="lg" w="100%">
              {editingFile && editingFile.id === file.id ? (
                <>
                  <FormControl>
                    <FormLabel>Название</FormLabel>
                    <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Комментарий</FormLabel>
                    <Textarea value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
                  </FormControl>
                  <HStack mt={2}>
                    <Button colorScheme="green" onClick={saveChanges}>Сохранить</Button>
                    <Button colorScheme="red" onClick={cancelEditing}>Отмена</Button>
                  </HStack>
                </>
              ) : (
                <>
                  <Text fontSize="lg"><strong>Название:</strong> {file.name}</Text>
                  <Text fontSize="sm"><strong>Размер:</strong> {formatSize(file.size)}</Text>
                  <Text fontSize="sm"><strong>Дата загрузки:</strong> {new Date(file.published).toLocaleString()}</Text>
                  <HStack mt={2}>
                    <Button colorScheme="blue" size="sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/storage/files/${file.id}/download/`, "_blank")}>
                      Скачать
                    </Button>
                    <Button colorScheme="yellow" size="sm" onClick={() => startEditing(file)}>Редактировать</Button>
                    <Button colorScheme="red" size="sm" onClick={() => deleteFile(file.id)}>Удалить</Button>
                  </HStack>
                </>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
};

export default StoragePage;


// import React, { useState, useEffect } from "react";
// import { 
//   Box, Heading, Button, VStack, Text, Spinner, 
//   useToast, Input, FormControl, FormLabel, Textarea, HStack 
// } from "@chakra-ui/react";
// import api from '../api/api';
// import { useAuth } from "../providers/AuthProvider";
// import { useNavigate } from "react-router-dom";

// const StoragePage = () => {
//   const { accessToken, isInitialized, user } = useAuth();  // Получаем accessToken и флаг инициализации
//   const navigate = useNavigate();
//   const toast = useToast();
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [editingFile, setEditingFile] = useState(null);
//   const [editedName, setEditedName] = useState("");
//   const [editedComment, setEditedComment] = useState("");

//   // useEffect(() => {
//   //   if (!isInitialized) return;  // Ждем, пока данные пользователя будут инициализированы
//   //   if (!accessToken) {
//   //     console.log('Нет токена');
//   //     navigate("/login");  // Если токен отсутствует, редиректим на страницу логина
//   //     return;
//   //   }
//   //   fetchFiles();  // Загружаем файлы, если токен доступен
//   // }, [accessToken, isInitialized, navigate]);  // Следим за изменениями в токене и состоянии инициализации

//   // const fetchFiles = async () => {
//   //   try {
//   //     const response = await api.get(`${import.meta.env.VITE_API_URL}/storage/files/`, {
//   //       headers: { Authorization: `Bearer ${accessToken}` },
//   //     });
//   //     setFiles(response.data);  // Загружаем файлы
//   //   } catch (error) {
//   //     toast({
//   //       title: "Ошибка",
//   //       description: "Не удалось загрузить файлы",
//   //       status: "error",
//   //       duration: 3000,
//   //       isClosable: true,
//   //     });
//   //   } finally {
//   //     setLoading(false);  // Завершаем загрузку
//   //   }
//   // };
//   useEffect(() => {
//     if (!isInitialized) return;  // Ждем, пока данные пользователя будут инициализированы
//     if (!accessToken) {
//       console.log('Нет токена');
//       navigate("/login");  // Если токен отсутствует, редиректим на страницу логина
//       return;
//     }
//     setLoading(true);  // Включаем индикатор загрузки перед вызовом
//     fetchFiles();  // Загружаем файлы, если токен доступен
//   }, [accessToken, isInitialized, navigate]);  // Следим за изменениями в токене и состоянии инициализации
  
//   const fetchFiles = async () => {
//     try {
//       const response = await api.get(`${import.meta.env.VITE_API_URL}/storage/files/`, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       setFiles(response.data);  // Загружаем файлы
//     } catch (error) {
//       // Не показываем ошибку сразу, только если попытка загрузки не успешна
//       if (error.response?.status !== 401) {
//         toast({
//           title: "Ошибка",
//           description: "Не удалось загрузить файлы",
//           status: "error",
//           duration: 3000,
//           isClosable: true,
//         });
//       }
//     } finally {
//       setLoading(false);  // Завершаем загрузку
//     }
//   };

//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   const uploadFile = async () => {
//     if (!file) return;
//     setUploading(true);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       await api.post(`${import.meta.env.VITE_API_URL}/storage/files/`, formData, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       toast({ title: "Файл загружен", status: "success", duration: 3000, isClosable: true });
//       fetchFiles();
//     } catch (error) {
//       toast({ title: "Ошибка загрузки", description: error.response?.data?.message, status: "error", duration: 3000, isClosable: true });
//     } finally {
//       setUploading(false);
//       setFile(null);
//     }
//   };

//   const deleteFile = async (fileId) => {
//     try {
//       await api.delete(`${import.meta.env.VITE_API_URL}/storage/files/${fileId}/`, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       toast({ title: "Файл удалён", status: "success", duration: 3000, isClosable: true });
//       setFiles(files.filter((file) => file.id !== fileId));
//     } catch (error) {
//       toast({ title: "Ошибка удаления", status: "error", duration: 3000, isClosable: true });
//     }
//   };

//   const startEditing = (file) => {
//     setEditingFile(file);
//     setEditedName(file.name);
//     setEditedComment(file.comment || "");
//   };

//   const cancelEditing = () => {
//     setEditingFile(null);
//     setEditedName("");
//     setEditedComment("");
//   };

//   const saveChanges = async () => {
//     if (!editingFile) return;

//     try {
//       await api.patch(
//         `${import.meta.env.VITE_API_URL}/storage/files/${editingFile.id}/`,
//         { name: editedName, comment: editedComment },
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );

//       toast({ title: "Файл обновлён", status: "success", duration: 3000, isClosable: true });
//       fetchFiles();
//       cancelEditing();
//     } catch (error) {
//       toast({ title: "Ошибка обновления", status: "error", duration: 3000, isClosable: true });
//     }
//   };

//   const formatSize = (size) => {
//     if (size < 1024) return `${size} Б`;
//     if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} КБ`;
//     if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} МБ`;
//     return `${(size / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
//   };

//   const totalSize = files.reduce((sum, file) => sum + file.size, 0);

//   return (
//     <VStack spacing={6} mt={10} align="center">
//       <Text fontSize="lg"><strong>Имя пользователя:</strong> {user?.username}</Text>
//       <Heading size="xl">Мои файлы</Heading>

//       {/* Отображение общего объема */}
//       <Text fontSize="lg" fontWeight="bold">
//         Общий объем файлов: {formatSize(totalSize)}
//       </Text>

//       <FormControl>
//         <FormLabel>Выберите файл</FormLabel>
//         <Input type="file" onChange={handleFileChange} />
//         <Button colorScheme="blue" onClick={uploadFile} isLoading={uploading} mt={2}>
//           Загрузить
//         </Button>
//       </FormControl>

//       {loading ? (
//         <Spinner size="xl" />
//       ) : files.length === 0 ? (
//         <Text>Файлы отсутствуют</Text>
//       ) : (
//         <VStack spacing={4} w="80%">
//           {files.map((file) => (
//             <Box key={file.id} p={4} shadow="md" borderWidth="1px" borderRadius="lg" w="100%">
//               {editingFile && editingFile.id === file.id ? (
//                 <>
//                   <FormControl>
//                     <FormLabel>Название</FormLabel>
//                     <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
//                   </FormControl>
//                   <FormControl>
//                     <FormLabel>Комментарий</FormLabel>
//                     <Textarea value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
//                   </FormControl>
//                   <HStack mt={2}>
//                     <Button colorScheme="green" onClick={saveChanges}>Сохранить</Button>
//                     <Button colorScheme="red" onClick={cancelEditing}>Отмена</Button>
//                   </HStack>
//                 </>
//               ) : (
//                 <>
//                   <Text fontSize="lg"><strong>Название:</strong> {file.name}</Text>
//                   <Text fontSize="sm"><strong>Размер:</strong> {formatSize(file.size)}</Text>
//                   <Text fontSize="sm"><strong>Дата загрузки:</strong> {new Date(file.published).toLocaleString()}</Text>
//                   <HStack mt={2}>
//                     <Button colorScheme="blue" size="sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/storage/files/${file.id}/download/`, "_blank")}>
//                       Скачать
//                     </Button>
//                     <Button colorScheme="yellow" size="sm" onClick={() => startEditing(file)}>Редактировать</Button>
//                     <Button colorScheme="red" size="sm" onClick={() => deleteFile(file.id)}>Удалить</Button>
//                   </HStack>
//                 </>
//               )}
//             </Box>
//           ))}
//         </VStack>
//       )}
//     </VStack>
//   );
// };

// export default StoragePage;

