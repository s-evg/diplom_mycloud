// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   VStack,
//   Heading,
//   Text,
//   Spinner,
//   Button,
//   Input,
//   FormControl,
//   FormLabel,
//   Textarea,
//   HStack,
//   useToast,
// } from "@chakra-ui/react";
// import { useAuth } from "../providers/AuthProvider";
// import { useNavigate } from "react-router-dom";
// import api from "../api/api";

// const StoragePage = () => {
//   const { accessToken, user } = useAuth();
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [editingFile, setEditingFile] = useState(null);
//   const [editedName, setEditedName] = useState("");
//   const [editedComment, setEditedComment] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const toast = useToast();
//   const navigate = useNavigate();

//   const fetchFiles = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get("/storage/files/");
//       setFiles(response.data);
//     } catch (error) {
//       toast({
//         title: "Ошибка",
//         description: "Не удалось загрузить файлы",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       toast({
//         title: "Выберите файл",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setUploading(true);
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append('name', file.name);  // Передаем имя файла
//     formData.append('comment', '');  // Дополнительные поля


//     try {
//       const response = await api.post("/storage/files/", formData);
//       toast({
//         title: "Файл загружен",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });
//       fetchFiles();
//       setFile(null);
//     } catch (error) {
//       toast({
//         title: "Ошибка загрузки",
//         description: error.response?.data?.message || "Ошибка при загрузке файла",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const deleteFile = async (fileId) => {
//     try {
//       await api.delete(`/storage/files/${fileId}/`);
//       toast({
//         title: "Файл удалён",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });
//       setFiles((prev) => prev.filter((f) => f.id !== fileId));
//     } catch {
//       toast({
//         title: "Ошибка удаления",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   const startEditing = (file) => {
//     setEditingFile(file);
//     setEditedName(file.name);
//     setEditedComment(file.comment || "");
//     setIsModalOpen(true);  // Открытие модального окна
//   };

//   const cancelEditing = () => {
//     setEditingFile(null);
//     setEditedName("");
//     setEditedComment("");
//   };

//   const saveChanges = async () => {
//   try {
//     // Создаём объект FormData, если редактируем файл
//     const formData = new FormData();
//     formData.append('name', editedName);  // Используем editedName, а не editingFile.name
//     formData.append('comment', editedComment);  // Также редактируем комментарий
  
//     // Отправляем PATCH-запрос с правильным заголовком
//     await api.patch(
//       `storage/files/${editingFile.id}/`,
//       formData, // Отправляем данные как FormData
//       {
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           // Не указываем Content-Type для FormData
//         },
//       }
//     );
  
//     // Обновляем список файлов
//     fetchFiles();
//     // После успешного обновления сбрасываем редактируемые данные
//     setEditingFile(null);
//     setEditedName("");
//     setEditedComment("");
//   } catch (error) {
//     console.error("Ошибка при сохранении изменений:", error);
//     alert('Не удалось сохранить изменения!');
//   }
// };
  

//   const formatSize = (size) => {
//     if (size < 1024) return `${size} Б`;
//     if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
//     if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} МБ`;
//     return `${(size / 1024 / 1024 / 1024).toFixed(1)} ГБ`;
//   };

//   const totalSize = files.reduce((sum, f) => sum + f.size, 0);

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   return (
//     <VStack spacing={6} mt={10}>
//       <Text><strong>Пользователь:</strong> {user?.username}</Text>
//       <Heading size="lg">Мои файлы</Heading>

//       <Text fontWeight="bold">Общий объём: {formatSize(totalSize)}</Text>

//       <FormControl>
//         <FormLabel>Загрузить файл</FormLabel>
//         <Input type="file" onChange={handleFileChange} />
//         <Button mt={2} colorScheme="blue" onClick={handleUpload} isLoading={uploading}>
//           Загрузить
//         </Button>
//       </FormControl>

//       {loading ? (
//         <Spinner size="xl" />
//       ) : files.length === 0 ? (
//         <Text>Нет файлов</Text>
//       ) : (
//         <VStack spacing={4} w="80%">
//           {files.map((file) => (
//             <Box
//               key={file.id}
//               w="100%"
//               p={4}
//               borderWidth="1px"
//               borderRadius="lg"
//               shadow="md"
//             >
//               {editingFile?.id === file.id ? (
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
//                   <Text><strong>Имя:</strong> {file.name}</Text>
//                   <Text><strong>Размер:</strong> {formatSize(file.size)}</Text>
//                   {file.comment && <Text><strong>Комментарий:</strong> {file.comment}</Text>}
//                   <HStack mt={2}>
//                     <Button size="sm" onClick={() => startEditing(file)}>Редактировать</Button>
//                     <Button size="sm" colorScheme="red" onClick={() => deleteFile(file.id)}>Удалить</Button>
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

// StoragePage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Button,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate, useParams } from "react-router-dom"; // 💡 добавили useParams
import api from "../api/api";

const StoragePage = () => {
  const { accessToken, user } = useAuth();
  const { userId } = useParams(); // 💡 получаем userId из URL
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedComment, setEditedComment] = useState("");
  const toast = useToast();

  const isOwner = !userId || user?.id === parseInt(userId); // 💡 владелец
  const isAdmin = user?.is_admin; // 💡 админ
  const canEdit = isOwner || isAdmin; // 💡 разрешение на действия

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const url = userId ? `/storage/files/?user_id=${userId}` : `/storage/files/`;
      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setFiles(response.data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файлы",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return toast({
      title: "Выберите файл", status: "warning", duration: 3000, isClosable: true,
    });

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("comment", "");

    try {
      const response = await api.post("/storage/files/", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast({ title: "Файл загружен", status: "success", duration: 3000, isClosable: true });
      fetchFiles();
      setFile(null);
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: error.response?.data?.message || "Ошибка при загрузке файла",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await api.delete(`/storage/files/${fileId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast({ title: "Файл удалён", status: "success", duration: 3000, isClosable: true });
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
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
    try {
      const formData = new FormData();
      formData.append("name", editedName);
      formData.append("comment", editedComment);
      await api.patch(`storage/files/${editingFile.id}/`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      fetchFiles();
      cancelEditing();
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось сохранить изменения", status: "error" });
    }
  };

  const formatSize = (size) => {
    if (size < 1024) return `${size} Б`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
    if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} МБ`;
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} ГБ`;
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  useEffect(() => {
    fetchFiles();
  }, [userId]);

  return (
    <VStack spacing={6} mt={10}>
      <Text><strong>Просмотр:</strong> {isOwner ? "Ваше хранилище" : `Хранилище пользователя #${userId}`}</Text>
      <Heading size="lg">Файлы</Heading>
      <Text fontWeight="bold">Общий объём: {formatSize(totalSize)}</Text>

      {canEdit && (
        <FormControl>
          <FormLabel>Загрузить файл</FormLabel>
          <Input type="file" onChange={handleFileChange} />
          <Button mt={2} colorScheme="blue" onClick={handleUpload} isLoading={uploading}>
            Загрузить
          </Button>
        </FormControl>
      )}

      {loading ? (
        <Spinner size="xl" />
      ) : files.length === 0 ? (
        <Text>Нет файлов</Text>
      ) : (
        <VStack spacing={4} w="80%">
          {files.map((file) => (
            <Box key={file.id} w="100%" p={4} borderWidth="1px" borderRadius="lg" shadow="md">
              {editingFile?.id === file.id ? (
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
                  <Text><strong>Имя:</strong> {file.name}</Text>
                  <Text><strong>Размер:</strong> {formatSize(file.size)}</Text>
                  {file.comment && <Text><strong>Комментарий:</strong> {file.comment}</Text>}
                  {canEdit && (
                    <HStack mt={2}>
                      <Button size="sm" onClick={() => startEditing(file)}>Редактировать</Button>
                      <Button size="sm" colorScheme="red" onClick={() => deleteFile(file.id)}>Удалить</Button>
                    </HStack>
                  )}
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
