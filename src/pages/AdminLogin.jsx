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
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState(""); // email yoki username
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cardBg = "rgba(10, 18, 38, 0.72)";
  const borderCol = "rgba(255,255,255,0.14)";
  const textMuted = "whiteAlpha.700";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken || "");
      if (data.data?.user?.id != null) localStorage.setItem("userId", String(data.data.user.id));
      if (data.data?.user?.role) localStorage.setItem("userRole", data.data.user.role);

      if (data.data.user.role !== "admin") {
        throw new Error("Faqat admin foydalanuvchilar kirishi mumkin");
      }

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
      px={4}
      bgGradient="linear(to-br, #06142D 0%, #0B2C5B 40%, #0A4AA6 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* dekor glow */}
      <Box
        position="absolute"
        w="520px"
        h="520px"
        bg="rgba(0, 140, 255, 0.25)"
        filter="blur(120px)"
        top="-140px"
        left="-140px"
        borderRadius="full"
      />
      <Box
        position="absolute"
        w="520px"
        h="520px"
        bg="rgba(90, 40, 255, 0.18)"
        filter="blur(140px)"
        bottom="-180px"
        right="-180px"
        borderRadius="full"
      />

      <Box
        w={{ base: "100%", sm: "420px", md: "520px" }}
        p={{ base: 7, md: 10 }}
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderCol}
        boxShadow="0 22px 60px rgba(0,0,0,0.35)"
        backdropFilter="blur(14px)"
        position="relative"
        overflow="hidden"
      >
        {/* ✅ premium shine overlay */}
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          bgGradient="linear(to-b, rgba(255,255,255,0.10), rgba(255,255,255,0.02))"
        />

        <VStack spacing={7} as="form" onSubmit={handleLogin} align="stretch" position="relative" zIndex={1}>
          {/* ✅ logo-title spacing yaxshilandi */}
          <VStack spacing={3} textAlign="center">
            <Box
              w="72px"
              h="72px"
              borderRadius="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 18px 40px rgba(0,0,0,0.25)"
              backgroundColor="transparent"
            >
              <Image
                src="/UzWork transparent.png"
                alt="UzWork Logo"
                boxSize="100px"
                objectFit="contain"
              />
            </Box>

            <Heading size="lg" color="whiteAlpha.900">
              UzWork Admin
            </Heading>
            <Text fontSize="md" color={textMuted}>
              Platformani boshqarish uchun tizimga kiring
            </Text>
          </VStack>

          {error && (
            <Alert status="error" borderRadius="xl">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          )}

          <FormControl>
            <FormLabel color="whiteAlpha.900" fontWeight="semibold">
              Email yoki Username
            </FormLabel>
            <InputGroup>
              <InputLeftElement h="52px" pointerEvents="none">
                <EmailIcon color="whiteAlpha.700" />
              </InputLeftElement>
              <Input
                placeholder="Email kiriting"
                h="52px"
                borderRadius="xl"
                bg="rgba(255,255,255,0.06)"
                borderColor="rgba(255,255,255,0.14)"
                color="whiteAlpha.900"
                _placeholder={{ color: "whiteAlpha.500" }}   // ✅ ochroq
                _hover={{ borderColor: "rgba(255,255,255,0.28)" }}
                _focus={{
                  borderColor: "rgba(66,153,225,0.9)",
                  boxShadow: "0 0 0 3px rgba(66,153,225,0.25)",
                }}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel color="whiteAlpha.900" fontWeight="semibold">
              Parol
            </FormLabel>
            <InputGroup>
              <InputLeftElement h="52px" pointerEvents="none">
                <LockIcon color="whiteAlpha.700" />
              </InputLeftElement>

              <Input
                type={showPass ? "text" : "password"}
                placeholder="Parol kiriting"
                h="52px"
                borderRadius="xl"
                bg="rgba(255,255,255,0.06)"
                borderColor="rgba(255,255,255,0.14)"
                color="whiteAlpha.900"
                _placeholder={{ color: "whiteAlpha.500" }}   // ✅ ochroq
                _hover={{ borderColor: "rgba(255,255,255,0.28)" }}
                _focus={{
                  borderColor: "rgba(66,153,225,0.9)",
                  boxShadow: "0 0 0 3px rgba(66,153,225,0.25)",
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <InputRightElement h="52px">
                <IconButton
                  aria-label={showPass ? "Hide password" : "Show password"}
                  icon={showPass ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  variant="ghost"
                  color="whiteAlpha.800"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => setShowPass((s) => !s)}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            h="52px"
            borderRadius="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, #1E90FF, #2B6CB0)"
            color="white"
            boxShadow="0 16px 30px rgba(30,144,255,0.25)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 22px 40px rgba(30,144,255,0.35)",
              filter: "brightness(1.05)",
            }}
            _active={{ transform: "translateY(0px)" }}
            transition="all 0.18s"
            isLoading={loading}
            loadingText="Kirilmoqda..."
          >
            Kirish
          </Button>

          <Text fontSize="sm" color="whiteAlpha.500" textAlign="center">
            © {new Date().getFullYear()} UzWork — Admin Panel
          </Text>
        </VStack>
      </Box>
    </Center>
  );
}
