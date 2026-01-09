// src/pages/AdminLogin.jsx
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
} from "@chakra-ui/react";

export default function AdminLogin() {
  return (
    <Center
      minH="100vh"
      bgGradient="linear(to-br, blue.50, indigo.100)"
      p={4}
    >
      <Box
        w={{ base: "90%", sm: "400px", md: "500px" }}  // katta ekranlarda kengroq
        p={10}
        bg="white"
        borderRadius="2xl"
        boxShadow="0 20px 40px rgba(0, 0, 0, 0.1)"
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Heading size="2xl" color="blue.800" fontWeight="bold">
              UzWork Admin
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Platformani boshqarish uchun kirish
            </Text>
          </VStack>

          <FormControl>
            <FormLabel fontSize="lg" fontWeight="medium">
              Email yoki Username
            </FormLabel>
            <Input
              placeholder="admin@uzwork.uz"
              size="lg"
              h="56px"
              fontSize="lg"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
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
            />
          </FormControl>

          <Button
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
          >
            Kirish
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}