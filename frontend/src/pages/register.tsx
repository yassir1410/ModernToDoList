import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import {
  EmailIcon,
  LockIcon,
  AtSignIcon,
  ViewIcon,
  ViewOffIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/router";
import axios from "axios";

export default function Register() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        user
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      router.push("/");
      toast({
        title: "Registration successful",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data || "An error occurred",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.sm">
        <VStack spacing={8}>
          <Heading color="blue.500">Register</Heading>
          <Card bg={bgColor} shadow="lg" borderRadius="xl" w="100%">
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AtSignIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Username"
                      value={user.username}
                      onChange={(e) =>
                        setUser({ ...user, username: e.target.value })
                      }
                      size="lg"
                      variant="filled"
                      _hover={{ bg: "gray.100" }}
                      _focus={{ bg: "white", borderColor: "blue.500" }}
                    />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <EmailIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={user.email}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                      size="lg"
                      variant="filled"
                      _hover={{ bg: "gray.100" }}
                      _focus={{ bg: "white", borderColor: "blue.500" }}
                    />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <LockIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={user.password}
                      onChange={(e) =>
                        setUser({ ...user, password: e.target.value })
                      }
                      size="lg"
                      variant="filled"
                      _hover={{ bg: "gray.100" }}
                      _focus={{ bg: "white", borderColor: "blue.500" }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="lg"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    isLoading={isLoading}
                    _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Register
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
          <HStack>
            <Text>Already have an account?</Text>
            <Link href="/login" color="blue.500">
              Login
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
