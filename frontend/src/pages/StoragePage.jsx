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
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const StoragePage = () => {
  const { accessToken, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedComment, setEditedComment] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/storage/files/");
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

  
  const fileInputRef = React.useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Выберите файл",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Проверка на дубликат по имени файла
    const duplicate = files.find((f) => f.name === file.name);
    if (duplicate) {
      toast({
        title: "Файл уже существует",
        description: `Файл с именем "${file.name}" уже загружен`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("comment", "");

    try {
      await api.post("/storage/files/", formData);
      toast({
        title: "Файл загружен",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchFiles();
      setFile(null);
      // Очистка input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      await api.delete(`/storage/files/${fileId}/`);
      toast({
        title: "Файл удалён",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
      toast({
        title: "Ошибка удаления",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
      // formData.append("name", editedName);
      // Отделяем расширение от оригинального имени
      const originalExt = editingFile.name.split(".").pop(); // jpg
      let finalName = editedName;

      // Если новое имя не содержит точку (расширения), добавляем его
      if (!editedName.includes(".")) {
        finalName = `${editedName}.${originalExt}`;
      }

      formData.append("name", finalName);
      formData.append("comment", editedComment);

      await api.patch(`/storage/files/${editingFile.id}/`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      fetchFiles();
      setEditingFile(null);
      setEditedName("");
      setEditedComment("");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const copyLink = async (fileId) => {
    const url = `http://localhost:8000/api/storage/files/${fileId}/download/`; // Указываем правильный адрес бэкенда
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка на файл скопирована в буфер обмена",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Ошибка копирования",
        description: "Не удалось скопировать ссылку",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };
  
  
  // const copyLink = async (fileId) => {
  //   const url = `${window.location.origin}/storage/download/${fileId}/`;
  //   try {
  //     await navigator.clipboard.writeText(url);
  //     toast({
  //       title: "Ссылка скопирована",
  //       description: "Ссылка на файл скопирована в буфер обмена",
  //       status: "success",
  //       duration: 2000,
  //       isClosable: true,
  //     });
  //   } catch (err) {
  //     toast({
  //       title: "Ошибка копирования",
  //       description: "Не удалось скопировать ссылку",
  //       status: "error",
  //       duration: 2000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const formatSize = (size) => {
    if (size < 1024) return `${size} Б`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
    if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} МБ`;
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} ГБ`;
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <VStack spacing={6} mt={10}>
      <Text><strong>Пользователь:</strong> {user?.fullname || user?.username}</Text>
      <Heading size="lg">Мои файлы</Heading>
      <Text fontWeight="bold">Общий объём: {formatSize(totalSize)}</Text>

      <FormControl>
        <FormLabel>Загрузить файл</FormLabel>
        {/* <Input type="file" onChange={handleFileChange} /> */}
        <Input type="file" onChange={handleFileChange} ref={fileInputRef} />
        <Button mt={2} colorScheme="blue" onClick={handleUpload} isLoading={uploading}>
          Загрузить
        </Button>
      </FormControl>

      {loading ? (
        <Spinner size="xl" />
      ) : files.length === 0 ? (
        <Text>Нет файлов</Text>
      ) : (
        <VStack spacing={4} w="80%">
          {files.map((file) => (
            <Box
              key={file.id}
              w="100%"
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              shadow="md"
            >
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
                  <Text><strong>Дата загрузки:</strong> {new Date(file.published).toLocaleString()}</Text>
                  <Text><strong>Последнее скачивание:</strong> {file.last_download ? new Date(file.last_download).toLocaleString() : "Нет данных"}</Text>
                  <HStack mt={2}>
                    <Button size="sm" colorScheme="yellow" onClick={() => startEditing(file)}>Редактировать</Button>
                    <Button size="sm" colorScheme="red" onClick={() => deleteFile(file.id)}>Удалить</Button>
                    <Button size="sm" colorScheme="blue" onClick={() => copyLink(file.id)}>Скопировать ссылку</Button>
                    <Button size="sm" colorScheme="green"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = file.download_url; // URL, предоставленный бекендом
                          link.setAttribute("download", file.name); // имя файла при сохранении
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Скачать
                      </Button>
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