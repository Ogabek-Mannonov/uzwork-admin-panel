// src/pages/admin/Users.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Select,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { SearchIcon, EditIcon, NotAllowedIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import api from "../../lib/api"; // admin panel uchun API

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Backenddan real foydalanuvchilar ro‘yxatini olamiz
        const res = await api("/admin/users");

        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Foydalanuvchilarni olishda xato:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} fontSize="lg">
          Foydalanuvchilar yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg" my={8}>
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="xl" mb={8}>
        Foydalanuvchilar
      </Heading>

      <HStack mb={6} spacing={4}>
        <InputGroup maxW="400px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input placeholder="Qidiruv..." />
        </InputGroup>
        <Select maxW="200px" placeholder="Role">
          <option>Freelancer</option>
          <option>Client</option>
          <option>Admin</option>
        </Select>
      </HStack>

      <Table variant="simple" size="lg">
        <Thead>
          <Tr bg="gray.50">
            <Th>Foydalanuvchi</Th>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Amallar</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user.id}>
              <Td>
                <Link to={`/admin/users/${user.id}`}>
                  <Flex align="center" gap={3} cursor="pointer" _hover={{ opacity: 0.8 }}>
                    <Avatar name={`${user.first_name || ''} ${user.last_name || ''}`} size="md" />
                    <Text fontWeight="medium" color="blue.600">
                      {user.first_name} {user.last_name}
                    </Text>
                  </Flex>
                </Link>
              </Td>
              <Td>{user.username}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge colorScheme={user.role === "admin" ? "purple" : user.role === "freelancer" ? "blue" : "green"}>
                  {user.role === "freelancer" ? "Freelancer" : user.role === "client" ? "Client" : "Admin"}
                </Badge>
              </Td>
              <Td>
                <Badge colorScheme={user.status === "active" ? "green" : "red"}>
                  {user.status === "active" ? "Faol" : "Bloklangan"}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton icon={<EditIcon />} size="sm" colorScheme="blue" variant="ghost" />
                  {user.status === "active" ? (
                    <IconButton icon={<NotAllowedIcon />} size="sm" colorScheme="red" variant="ghost" />
                  ) : (
                    <IconButton icon={<CheckCircleIcon />} size="sm" colorScheme="green" variant="ghost" />
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}