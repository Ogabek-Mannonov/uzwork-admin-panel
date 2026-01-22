// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Center,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Spinner,
} from "@chakra-ui/react";

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState(""); // email yoki username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier.includes("@") ? identifier : undefined,
          username: !identifier.includes("@") ? identifier : undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Kirishda xato yuz berdi");
      }

      // Tokenlarni saqlash
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken || ""); // agar refresh bo‘lsa
      if (data.data?.user?.id != null) {
        localStorage.setItem("userId", String(data.data.user.id));
      }
      if (data.data?.user?.role) {
        localStorage.setItem("userRole", data.data.user.role);
      }

      // Role tekshiruvi (backenddan qaytgan user role)
      if (data.data.user.role !== "admin") {
        throw new Error("Faqat admin foydalanuvchilar kirishi mumkin");
      }

      // Muvaffaqiyatli – admin panelga o‘tish
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message || "Xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center
      minH="100vh"
      bgGradient="linear(to-br, blue.50, indigo.100)"
      p={4}
    >
      <Box
        w={{ base: "90%", sm: "400px", md: "500px" }}
        p={10}
        bg="white"
        borderRadius="2xl"
        boxShadow="0 20px 40px rgba(0, 0, 0, 0.1)"
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack spacing={8} as="form" onSubmit={handleLogin}>
          <VStack spacing={2}>
            <Heading size="2xl" color="blue.800" fontWeight="bold">
              UzWork Admin
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Platformani boshqarish uchun kirish
            </Text>
          </VStack>

          {error && (
            <Alert status="error" borderRadius="lg" w="full">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          )}

          <FormControl>
            <FormLabel fontSize="lg" fontWeight="medium">
              Email yoki Username
            </FormLabel>
            <Input
              placeholder="admin@uzwork.uz yoki admin"
              size="lg"
              h="56px"
              fontSize="lg"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="lg" fontWeight="medium">
              Parol
            </FormLabel>
            <Input
              type="password"
              size="lg"
              h="56px"
              fontSize="lg"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            h="56px"
            w="full"
            fontSize="xl"
            fontWeight="bold"
            borderRadius="xl"
            boxShadow="lg"
            _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            transition="all 0.2s"
            isLoading={loading}
            loadingText="Kirilmoqda..."
          >
            Kirish
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
