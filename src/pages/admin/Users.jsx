// src/pages/admin/Users.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  useToast,
} from "@chakra-ui/react";
import { SearchIcon, EditIcon, NotAllowedIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import api from "../../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // ✅ NEW: status filter
  const [selectedStatus, setSelectedStatus] = useState("all"); // all | active | blocked

  const toast = useToast();

  const normalizePayload = (res) => {
    const payload = res?.data ?? res;

    const list =
      payload?.data?.users ||
      payload?.users ||
      payload?.data?.data?.users ||
      [];

    return Array.isArray(list) ? list : [];
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api("/admin/users");
        const allUsers = normalizePayload(res);

        const normalized = allUsers.map((u) => ({
          ...u,
          status: u.status ?? "active",
        }));

        setUsers(normalized);
      } catch (err) {
        console.error("Foydalanuvchilarni olishda xato:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleStatus = async (userId, nextStatus) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });

      const payload = res?.data ?? res;
      const updated = payload?.data?.user || payload?.user;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
      );

      toast({
        title: "OK",
        description: nextStatus === "blocked" ? "User bloklandi" : "User faollashtirildi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (e) {
      console.error("Status update error:", e);
      toast({
        title: "Xato",
        description: "Status o‘zgartirishda xato",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const roleBadge = (role) => {
    const label = role === "admin" ? "Admin" : role === "freelancer" ? "Freelancer" : "Client";
    const color = role === "admin" ? "purple" : role === "freelancer" ? "blue" : "green";
    return <Badge colorScheme={color}>{label}</Badge>;
  };

  const statusBadge = (status) => {
    const isActive = status === "active";
    return (
      <Badge colorScheme={isActive ? "green" : "red"}>
        {isActive ? "Faol" : "Bloklangan"}
      </Badge>
    );
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((u) => {
        const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        return (
          fullName.includes(q) ||
          (u.username || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
        );
      });
    }

    // role filter
    if (selectedRole !== "all") {
      result = result.filter((u) => u.role === selectedRole);
    }

    // ✅ NEW: status filter
    if (selectedStatus !== "all") {
      result = result.filter((u) => (u.status ?? "active") === selectedStatus);
    }

    return result;
  }, [users, searchTerm, selectedRole, selectedStatus]);

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

      {/* Filters */}
      <HStack mb={6} spacing={4} wrap="wrap">
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

        {/* ✅ NEW: Status select */}
        <Select
          maxW="200px"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">Barcha statuslar</option>
          <option value="active">Faol</option>
          <option value="blocked">Bloklangan</option>
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
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Noma'lum";
              const isActive = (user.status ?? "active") === "active";

              return (
                <Tr key={user.id}>
                  <Td>
                    <Link to={`/admin/users/${user.id}`}>
                      <Flex align="center" gap={3} cursor="pointer" _hover={{ opacity: 0.8 }}>
                        <Avatar name={fullName} size="md" />
                        <Text fontWeight="medium" color="blue.600">
                          {fullName}
                        </Text>
                      </Flex>
                    </Link>
                  </Td>

                  <Td>{user.username || "—"}</Td>
                  <Td>{user.email || "—"}</Td>

                  <Td>{roleBadge(user.role)}</Td>
                  <Td>{statusBadge(user.status ?? "active")}</Td>

                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        as={Link}
                        to={`/admin/users/${user.id}`}
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        aria-label="Tahrirlash"
                      />

                      {isActive ? (
                        <IconButton
                          icon={<NotAllowedIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          aria-label="Bloklash"
                          onClick={() => toggleStatus(user.id, "blocked")}
                        />
                      ) : (
                        <IconButton
                          icon={<CheckCircleIcon />}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          aria-label="Faollashtirish"
                          onClick={() => toggleStatus(user.id, "active")}
                        />
                      )}
                    </HStack>
                  </Td>
                </Tr>
              );
            })
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
  