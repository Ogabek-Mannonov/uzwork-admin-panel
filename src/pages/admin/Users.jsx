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
import api from "../../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // filtrlangan ro‘yxat
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // qidiruv so‘zi
  const [selectedRole, setSelectedRole] = useState("all"); // tanlangan role

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api("/admin/users");
        const allUsers = res.data.users || [];

        setUsers(allUsers);
        setFilteredUsers(allUsers); // boshida hammasi ko‘rinadi
      } catch (err) {
        console.error("Foydalanuvchilarni olishda xato:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Qidiruv va role filtri (real vaqt rejimida)
  useEffect(() => {
    let result = [...users];

    // Qidiruv bo‘yicha filter (ism, username, email)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((user) => {
        return (
          `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(lowerSearch) ||
          (user.username || '').toLowerCase().includes(lowerSearch) ||
          (user.email || '').toLowerCase().includes(lowerSearch)
        );
      });
    }

    // Role bo‘yicha filter
    if (selectedRole !== "all") {
      result = result.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(result);
  }, [searchTerm, selectedRole, users]);

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

      {/* Qidiruv va filter */}
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="400px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Ism, username yoki email bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select
          maxW="200px"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="all">Barcha rollar</option>
          <option value="freelancer">Freelancer</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </Select>
      </HStack>

      {/* Jadval */}
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
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
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
            ))
          ) : (
            <Tr>
              <Td colSpan={6} textAlign="center" color="gray.500">
                Hech qanday natija topilmadi
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
}