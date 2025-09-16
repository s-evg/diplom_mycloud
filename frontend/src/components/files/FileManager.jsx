import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Button,
    VStack,
    HStack,
    Heading,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Switch,
    Badge,
    useToast,
    Container,
    Spinner,
    useColorModeValue,
    Select,
} from "@chakra-ui/react";
import {
    FiUpload,
    FiDownload,
    FiEdit,
    FiTrash2,
    FiLink,
    FiEye,
} from "react-icons/fi";
import apiService from "../../services/apiService";
import authService from "../../services/authService";
import API_BASE_URL from "../../services/path";

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadData, setUploadData] = useState({
        file: null,
        comment: "",
        isPublic: false,
    });

    const {
        isOpen: isUploadOpen,
        onOpen: onUploadOpen,
        onClose: onUploadClose,
    } = useDisclosure();
    const {
        isOpen: isEditOpen,
        onOpen: onEditOpen,
        onClose: onEditClose,
    } = useDisclosure();

    const toast = useToast();
    const bg = useColorModeValue("white", "gray.800");
    const currentUser = authService.getCurrentUser();

    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const loadAllUsers = async () => {
        if (authService.isAdmin()) {
            const result = await apiService.getUsers();
            if (result.success) {
                setAllUsers(result.data);
            }
        }
    };

    // Загрузка списка файлов
    const loadFiles = useCallback(async () => {
        setLoading(true);
        const result = await apiService.getFiles(selectedUserId);
        if (result.success) {
            setFiles(result.data);
        } else {
            toast({
                title: "Ошибка загрузки файлов",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
        setLoading(false);
    }, [selectedUserId, toast]);

    useEffect(() => {
        loadFiles();
        // Mode is Dirty Harry
        loadAllUsers();
    }, [selectedUserId]);

    // Загрузка файла
    const handleUpload = async () => {
        if (!uploadData.file) {
            toast({
                title: "Выберите файл",
                status: "warning",
                duration: 2000,
            });
            return;
        }

        setUploadLoading(true);
        const result = await apiService.uploadFile(
            uploadData.file,
            uploadData.comment,
            uploadData.isPublic
        );

        if (result.success) {
            toast({
                title: "Файл загружен успешно",
                status: "success",
                duration: 3000,
            });
            //Очищаем форму
            setUploadData({ file: null, comment: "", isPublic: false });
            // Закрываем модальное окно
            onUploadClose();
            // Обновляем список файлов
            loadFiles();
        } else {
            toast({
                title: "Ошибка загрузки",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
        setUploadLoading(false);
    };

    // Удаление файла
    const handleDelete = async (fileId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот файл?")) {
            return;
        }

        const result = await apiService.deleteFile(fileId);

        if (result.success) {
            toast({
                title: "Файл удален",
                status: "success",
                duration: 2000,
            });
            loadFiles();
        } else {
            toast({
                title: "Ошибка удаления",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
    };

    // Переименование файла
    const handleRename = async () => {
        if (!selectedFile?.newName) return;

        const result = await apiService.renameFile(
            selectedFile.id,
            selectedFile.newName
        );

        if (result.success) {
            toast({
                title: "Файл переименован",
                status: "success",
                duration: 2000,
            });
            onEditClose();
            loadFiles();
        } else {
            toast({
                title: "Ошибка переименования",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
    };

    // Изменение публичности файла
    const handleTogglePublic = async (fileId, isPublic) => {
        const result = await apiService.toggleFilePublic(fileId, !isPublic);

        if (result.success) {
            toast({
                title: `Файл ${!isPublic ? "опубликован" : "скрыт"}`,
                status: "success",
                duration: 2000,
            });
            loadFiles();
        } else {
            toast({
                title: "Ошибка изменения настроек",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
    };

    // Копирование публичной ссылки
    const copyPublicLink = (linkDownload) => {
        const url = `${API_BASE_URL}/api/storage/public/${linkDownload}/`;
        navigator.clipboard.writeText(url);
        toast({
            title: "Ссылка скопирована",
            status: "success",
            duration: 2000,
        });
    };

    // Скачивание файла
    const downloadFile = async (fileId, fileName) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/storage/files/${fileId}/download/`,
                {
                    headers: {
                        Authorization: `Bearer ${authService.getToken()}`,
                    },
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast({
                    title: "Файл скачан",
                    status: "success",
                    duration: 2000,
                });
            } else {
                throw new Error("Ошибка скачивания");
            }
        } catch (error) {
            toast({
                title: "Ошибка скачивания файла",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        }
    };

    const handleUploadClose = () => {
        setUploadData({ file: null, comment: "", isPublic: false });
        // Принудительный сброс input file. Иногда после загрузки файла, кнопка Загрузить файл не срабатывает
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        onUploadClose();
    };

    // Открытие модального окна редактирования
    const openEditModal = (file) => {
        setSelectedFile({ ...file, newName: file.name });
        onEditOpen();
    };

    return (
        <Container maxW='6xl' py={8}>
            <VStack spacing={6} align='stretch'>
                {/* Заголовок */}
                <HStack justify='space-between' align='center'>
                    <Heading size='lg' color='blue.500'>
                        Мои файлы
                    </Heading>
                    <HStack>
                        <Button
                            leftIcon={<FiUpload />}
                            colorScheme='blue'
                            onClick={onUploadOpen}
                        >
                            Загрузить файл
                        </Button>
                    </HStack>
                </HStack>
                {/* Селектор пользователя для админов */}
                {authService.isAdmin() && allUsers.length > 0 && (
                    <Box
                        bg='red.50'
                        p={4}
                        borderRadius='md'
                        border='1px'
                        borderColor='red.200'
                    >
                        <FormControl>
                            <FormLabel fontSize='sm' color='red.800' mb={2}>
                                Управление файлами пользователя (только для
                                администраторов):
                            </FormLabel>
                            <Select
                                placeholder='Выберите пользователя или оставьте пустым для своих файлов'
                                value={selectedUserId || ""}
                                onChange={(e) => {
                                    const userId = e.target.value
                                        ? parseInt(e.target.value)
                                        : null;
                                    setSelectedUserId(userId);
                                }}
                                bg='white'
                                size='sm'
                            >
                                {allUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} ({user.email})
                                        {user.id === currentUser?.id
                                            ? " - Ваши файлы"
                                            : ""}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                )}
                {/* Информация о пользователе */}
                <Box bg='blue.50' p={4} borderRadius='md'>
                    <Text fontSize='sm'>
                        Пользователь: <strong>{currentUser?.username}</strong>
                        {currentUser?.is_admin && (
                            <Badge ml={2} colorScheme='red' size='sm'>
                                Администратор
                            </Badge>
                        )}
                    </Text>
                </Box>

                {/* Таблица файлов */}
                <Box
                    bg={bg}
                    borderRadius='lg'
                    overflow='hidden'
                    boxShadow='sm'
                    border='1px'
                    borderColor='gray.200'
                >
                    {loading ? (
                        <Box p={8} textAlign='center'>
                            <Spinner size='lg' color='blue.500' />
                            <Text mt={4} color='gray.600'>
                                Загрузка файлов...
                            </Text>
                        </Box>
                    ) : files.length === 0 ? (
                        <Box p={8} textAlign='center'>
                            <Text color='gray.600' mb={4}>
                                У вас пока нет загруженных файлов
                            </Text>
                            <Button colorScheme='blue' onClick={onUploadOpen}>
                                Загрузить первый файл
                            </Button>
                        </Box>
                    ) : (
                        <Table variant='simple'>
                            <Thead bg='gray.50'>
                                <Tr>
                                    <Th>Имя файла</Th>
                                    <Th>Размер</Th>
                                    <Th>Загружен</Th>
                                    <Th>Доступ</Th>
                                    <Th>Действия</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {files.map((file) => (
                                    <Tr key={file.id}>
                                        <Td>
                                            <VStack align='start' spacing={1}>
                                                <Text fontWeight='medium'>
                                                    {file.name}
                                                </Text>
                                                {file.comment && (
                                                    <Text
                                                        fontSize='sm'
                                                        color='gray.600'
                                                    >
                                                        {file.comment}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Td>
                                        <Td>{file.size_formatted}</Td>
                                        <Td>
                                            <Text fontSize='sm'>
                                                {new Date(
                                                    file.published
                                                ).toLocaleDateString("ru-RU")}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge
                                                colorScheme={
                                                    file.is_public
                                                        ? "green"
                                                        : "gray"
                                                }
                                            >
                                                {file.is_public
                                                    ? "Публичный"
                                                    : "Приватный"}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <HStack spacing={1}>
                                                <IconButton
                                                    icon={<FiDownload />}
                                                    size='sm'
                                                    title='Скачать'
                                                    onClick={() =>
                                                        downloadFile(
                                                            file.id,
                                                            file.name
                                                        )
                                                    }
                                                />
                                                <IconButton
                                                    icon={<FiEdit />}
                                                    size='sm'
                                                    title='Переименовать'
                                                    onClick={() =>
                                                        openEditModal(file)
                                                    }
                                                />
                                                {file.is_public && (
                                                    <IconButton
                                                        icon={<FiLink />}
                                                        size='sm'
                                                        title='Копировать ссылку'
                                                        onClick={() =>
                                                            copyPublicLink(
                                                                file.link_download
                                                            )
                                                        }
                                                    />
                                                )}
                                                <IconButton
                                                    icon={<FiEye />}
                                                    size='sm'
                                                    title='Изменить доступ'
                                                    onClick={() =>
                                                        handleTogglePublic(
                                                            file.id,
                                                            file.is_public
                                                        )
                                                    }
                                                />
                                                <IconButton
                                                    icon={<FiTrash2 />}
                                                    size='sm'
                                                    colorScheme='red'
                                                    title='Удалить'
                                                    onClick={() =>
                                                        handleDelete(file.id)
                                                    }
                                                />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Box>
            </VStack>

            {/* Модальное окно загрузки */}
            <Modal isOpen={isUploadOpen} onClose={handleUploadClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Загрузить файл</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Выберите файл</FormLabel>
                                <Input
                                    type='file'
                                    // Принудительный ре-рендер
                                    // key={
                                    //     uploadData.file
                                    //         ? uploadData.file.name
                                    //         : "file-input"
                                    // }
                                    onChange={(e) =>
                                        setUploadData((prev) => ({
                                            ...prev,
                                            file: e.target.files[0],
                                        }))
                                    }
                                    p={1}
                                    border='2px dashed'
                                    borderColor='gray.300'
                                    _hover={{ borderColor: "blue.400" }}
                                    _focus={{
                                        borderColor: "blue.500",
                                        boxShadow: "outline",
                                    }}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Комментарий</FormLabel>
                                <Textarea
                                    placeholder='Описание файла (необязательно)'
                                    value={uploadData.comment}
                                    onChange={(e) =>
                                        setUploadData((prev) => ({
                                            ...prev,
                                            comment: e.target.value,
                                        }))
                                    }
                                />
                            </FormControl>

                            <FormControl display='flex' alignItems='center'>
                                <FormLabel mb='0'>Публичный доступ</FormLabel>
                                <Switch
                                    isChecked={uploadData.isPublic}
                                    onChange={(e) =>
                                        setUploadData((prev) => ({
                                            ...prev,
                                            isPublic: e.target.checked,
                                        }))
                                    }
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={handleUploadClose}>
                            Отмена
                        </Button>
                        <Button
                            colorScheme='blue'
                            onClick={handleUpload}
                            isLoading={uploadLoading}
                        >
                            Загрузить
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Модальное окно редактирования */}
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Редактировать файл</ModalHeader>
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Новое имя файла</FormLabel>
                            <Input
                                value={selectedFile?.newName || ""}
                                onChange={(e) =>
                                    setSelectedFile((prev) => ({
                                        ...prev,
                                        newName: e.target.value,
                                    }))
                                }
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={onEditClose}>
                            Отмена
                        </Button>
                        <Button colorScheme='blue' onClick={handleRename}>
                            Сохранить
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default FileManager;
