import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Checkbox,
  useToast,
  Flex,
  IconButton,
  useColorModeValue,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Textarea,
  Select,
  Badge,
  Progress,
  Tag,
  TagLabel,
  TagCloseButton,
  Collapse,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Link,
  Spacer,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  SearchIcon,
  CalendarIcon,
  AttachmentIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
} from "@chakra-ui/icons";
import axios from "axios";
import { useRouter } from "next/router";

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  updatedAt: string;
  tags: string[];
  subtasks: Subtask[];
  notes: string;
  attachmentUrl: string;
  progress: number;
  recurrenceType: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  recurrenceEndDate: string;
}

const PRIORITY_COLORS = {
  LOW: "green",
  MEDIUM: "yellow",
  HIGH: "red",
};

const CATEGORIES = ["Work", "Personal", "Shopping", "Health", "Other"];
const RECURRENCE_TYPES = ["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

export default function Home() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    category: "",
    dueDate: "",
    priority: "MEDIUM" as Todo["priority"],
    tags: [] as string[],
    recurrenceType: "NONE" as Todo["recurrenceType"],
    recurrenceEndDate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTodos();
  }, [router]);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
      toast({
        title: "Error fetching todos",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) {
      toast({
        title: "Title is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/api/todos", newTodo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewTodo({
        title: "",
        description: "",
        category: "",
        dueDate: "",
        priority: "MEDIUM" as Todo["priority"],
        tags: [],
        recurrenceType: "NONE" as Todo["recurrenceType"],
        recurrenceEndDate: "",
      });
      fetchTodos();
      toast({
        title: "Todo created",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error creating todo",
        status: "error",
        duration: 3000,
      });
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/todos/${todo.id}`,
        { ...todo, completed: !todo.completed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTodos();
    } catch (error) {
      toast({
        title: "Error updating todo",
        status: "error",
        duration: 3000,
      });
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTodos();
      toast({
        title: "Todo deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting todo",
        status: "error",
        duration: 3000,
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newTodo.tags.includes(newTag.trim())) {
      setNewTodo({
        ...newTodo,
        tags: [...newTodo.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTodo({
      ...newTodo,
      tags: newTodo.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addSubtask = async (todoId: number) => {
    if (!newSubtask.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/todos/${todoId}/subtasks`,
        {
          title: newSubtask.trim(),
          completed: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewSubtask("");
      fetchTodos();
    } catch (error) {
      toast({
        title: "Error adding subtask",
        status: "error",
        duration: 3000,
      });
    }
  };

  const toggleSubtask = async (
    todoId: number,
    subtaskId: number,
    completed: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/todos/${todoId}/subtasks/${subtaskId}?completed=${!completed}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTodos();
    } catch (error) {
      toast({
        title: "Error updating subtask",
        status: "error",
        duration: 3000,
      });
    }
  };

  const removeSubtask = async (todoId: number, subtaskId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/todos/${todoId}/subtasks/${subtaskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTodos();
    } catch (error) {
      toast({
        title: "Error removing subtask",
        status: "error",
        duration: 3000,
      });
    }
  };

  const updateNotes = async (todoId: number, notes: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/todos/${todoId}/notes`,
        notes,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTodos();
    } catch (error) {
      toast({
        title: "Error updating notes",
        status: "error",
        duration: 3000,
      });
    }
  };

  const updateAttachment = async (todoId: number, url: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/todos/${todoId}/attachment`,
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTodos();
    } catch (error) {
      toast({
        title: "Error updating attachment",
        status: "error",
        duration: 3000,
      });
    }
  };

  const searchTodos = async () => {
    if (!searchQuery.trim()) {
      fetchTodos();
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/todos/search?query=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTodos(response.data);
    } catch (error) {
      toast({
        title: "Error searching todos",
        status: "error",
        duration: 3000,
      });
    }
  };

  const filterTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "http://localhost:8080/api/todos";
      if (filterCategory) {
        url = `http://localhost:8080/api/todos/category/${filterCategory}`;
      } else if (filterPriority) {
        url = `http://localhost:8080/api/todos/priority/${filterPriority}`;
      } else if (showOverdue) {
        url = "http://localhost:8080/api/todos/overdue";
      }
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(response.data);
    } catch (error) {
      toast({
        title: "Error filtering todos",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    filterTodos();
  }, [filterCategory, filterPriority, showOverdue]);

  const filteredTodos = todos.filter((todo) => {
    if (searchQuery) {
      return (
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <Container maxW="container.xl" py={8}>
        <Flex mb={8} align="center">
          <Heading size="lg">Todo List</Heading>
          <Spacer />
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
        <VStack spacing={8} align="stretch">
          <Heading
            textAlign="center"
            color="blue.500"
            fontSize="4xl"
            fontWeight="extrabold"
          >
            Todo List
          </Heading>

          <Card bg={bgColor} shadow="lg" borderRadius="xl">
            <CardBody>
              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AddIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="What needs to be done?"
                      value={newTodo.title}
                      onChange={(e) =>
                        setNewTodo({ ...newTodo, title: e.target.value })
                      }
                      size="lg"
                      variant="filled"
                      _hover={{ bg: "gray.100" }}
                      _focus={{ bg: "white", borderColor: "blue.500" }}
                    />
                  </InputGroup>
                  <Textarea
                    placeholder="Add a description (optional)"
                    value={newTodo.description}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, description: e.target.value })
                    }
                    variant="filled"
                    _hover={{ bg: "gray.100" }}
                    _focus={{ bg: "white", borderColor: "blue.500" }}
                  />
                  <HStack spacing={4} w="100%">
                    <Select
                      placeholder="Select category"
                      value={newTodo.category}
                      onChange={(e) =>
                        setNewTodo({ ...newTodo, category: e.target.value })
                      }
                      variant="filled"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                    <Select
                      placeholder="Priority"
                      value={newTodo.priority}
                      onChange={(e) =>
                        setNewTodo({
                          ...newTodo,
                          priority: e.target.value as Todo["priority"],
                        })
                      }
                      variant="filled"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </Select>
                  </HStack>
                  <HStack spacing={4} w="100%">
                    <Input
                      type="datetime-local"
                      value={newTodo.dueDate}
                      onChange={(e) =>
                        setNewTodo({ ...newTodo, dueDate: e.target.value })
                      }
                      variant="filled"
                      _hover={{ bg: "gray.100" }}
                      _focus={{ bg: "white", borderColor: "blue.500" }}
                    />
                    <Select
                      placeholder="Recurrence"
                      value={newTodo.recurrenceType}
                      onChange={(e) =>
                        setNewTodo({
                          ...newTodo,
                          recurrenceType: e.target
                            .value as Todo["recurrenceType"],
                        })
                      }
                      variant="filled"
                    >
                      {RECURRENCE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                  {newTodo.recurrenceType !== "NONE" && (
                    <Input
                      type="datetime-local"
                      placeholder="Recurrence End Date"
                      value={newTodo.recurrenceEndDate}
                      onChange={(e) =>
                        setNewTodo({
                          ...newTodo,
                          recurrenceEndDate: e.target.value,
                        })
                      }
                      variant="filled"
                      _hover={{ bg: "gray.100" }}
                      _focus={{ bg: "white", borderColor: "blue.500" }}
                    />
                  )}
                  <HStack spacing={2} w="100%" flexWrap="wrap">
                    {newTodo.tags.map((tag) => (
                      <Tag
                        key={tag}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="blue"
                      >
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => removeTag(tag)} />
                      </Tag>
                    ))}
                    <InputGroup size="sm" maxW="200px">
                      <Input
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                      />
                      <InputRightElement>
                        <Button size="xs" onClick={addTag}>
                          Add
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </HStack>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Add Todo
                  </Button>
                </VStack>
              </Box>
            </CardBody>
          </Card>

          <HStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search todos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchTodos()}
              />
              <InputRightElement>
                <Button size="sm" onClick={searchTodos}>
                  Search
                </Button>
              </InputRightElement>
            </InputGroup>
            <Select
              placeholder="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              w="200px"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Filter by priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              w="200px"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
            <Button
              colorScheme={showOverdue ? "red" : "gray"}
              onClick={() => setShowOverdue(!showOverdue)}
            >
              Show Overdue
            </Button>
          </HStack>

          <VStack spacing={4} align="stretch">
            {filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4} flex={1}>
                        <Checkbox
                          isChecked={todo.completed}
                          onChange={() => toggleTodo(todo)}
                          colorScheme="blue"
                          size="lg"
                        />
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Text
                              fontSize="lg"
                              fontWeight="medium"
                              textDecoration={
                                todo.completed ? "line-through" : "none"
                              }
                              color={todo.completed ? "gray.500" : "inherit"}
                            >
                              {todo.title}
                            </Text>
                            <Badge colorScheme={PRIORITY_COLORS[todo.priority]}>
                              {todo.priority}
                            </Badge>
                            {todo.category && (
                              <Badge colorScheme="blue">{todo.category}</Badge>
                            )}
                            {todo.recurrenceType &&
                              todo.recurrenceType !== "NONE" && (
                                <Badge colorScheme="purple">
                                  {todo.recurrenceType.charAt(0) +
                                    todo.recurrenceType.slice(1).toLowerCase()}
                                </Badge>
                              )}
                          </HStack>
                          {todo.description && (
                            <Text
                              fontSize="sm"
                              color="gray.500"
                              textDecoration={
                                todo.completed ? "line-through" : "none"
                              }
                            >
                              {todo.description}
                            </Text>
                          )}
                          {todo.dueDate && (
                            <HStack spacing={1}>
                              <CalendarIcon color="gray.400" />
                              <Text fontSize="sm" color="gray.500">
                                Due: {new Date(todo.dueDate).toLocaleString()}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </HStack>
                      <HStack>
                        <IconButton
                          aria-label="Edit todo"
                          icon={<EditIcon />}
                          size="sm"
                          onClick={() => {
                            setSelectedTodo(todo);
                            onOpen();
                          }}
                        />
                        <IconButton
                          aria-label="Delete todo"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodo(todo.id)}
                          _hover={{ bg: "red.50" }}
                        />
                      </HStack>
                    </Flex>

                    {todo.tags && todo.tags.length > 0 && (
                      <HStack spacing={2} flexWrap="wrap">
                        {todo.tags.map((tag) => (
                          <Tag
                            key={tag}
                            size="sm"
                            borderRadius="full"
                            variant="solid"
                            colorScheme="blue"
                          >
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    )}

                    {todo.subtasks && todo.subtasks.length > 0 && (
                      <VStack align="stretch" spacing={2}>
                        <Progress
                          value={todo.progress}
                          colorScheme="blue"
                          size="sm"
                          borderRadius="full"
                        />
                        <Text fontSize="sm" color="gray.500">
                          Progress: {todo.progress}%
                        </Text>
                        {todo.subtasks.map((subtask) => (
                          <HStack key={subtask.id} spacing={2}>
                            <Checkbox
                              isChecked={subtask.completed}
                              onChange={() =>
                                toggleSubtask(
                                  todo.id,
                                  subtask.id,
                                  subtask.completed
                                )
                              }
                              size="sm"
                            />
                            <Text
                              fontSize="sm"
                              textDecoration={
                                subtask.completed ? "line-through" : "none"
                              }
                              color={subtask.completed ? "gray.500" : "inherit"}
                            >
                              {subtask.title}
                            </Text>
                            <IconButton
                              aria-label="Remove subtask"
                              icon={<DeleteIcon />}
                              size="xs"
                              variant="ghost"
                              onClick={() => removeSubtask(todo.id, subtask.id)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    )}

                    <HStack spacing={2}>
                      <InputGroup size="sm">
                        <Input
                          placeholder="Add subtask"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && addSubtask(todo.id)
                          }
                        />
                        <InputRightElement>
                          <Button size="xs" onClick={() => addSubtask(todo.id)}>
                            Add
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </VStack>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Todo</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTodo && (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={selectedTodo.notes || ""}
                    onChange={(e) =>
                      updateNotes(selectedTodo.id, e.target.value)
                    }
                    placeholder="Add notes..."
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Attachment URL</FormLabel>
                  <Input
                    value={selectedTodo.attachmentUrl || ""}
                    onChange={(e) =>
                      updateAttachment(selectedTodo.id, e.target.value)
                    }
                    placeholder="Add attachment URL..."
                  />
                </FormControl>
                {selectedTodo.attachmentUrl && (
                  <Link
                    href={selectedTodo.attachmentUrl}
                    isExternal
                    color="blue.500"
                  >
                    <HStack>
                      <AttachmentIcon />
                      <Text>View Attachment</Text>
                    </HStack>
                  </Link>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
