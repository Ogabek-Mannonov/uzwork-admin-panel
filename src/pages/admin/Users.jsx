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
  Card,
  CardBody,
} from "@chakra-ui/react";
import { SearchIcon, EditIcon, NotAllowedIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import api from "../../lib/api";

const GLASS_CARD = {
  bg: "rgba(10, 18, 38, 0.55)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.10)",
  borderRadius: "2xl",
  boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  backdropFilter: "blur(12px)",
  overflow: "hidden",
};

const inputStyle = {
  bg: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.14)",
  color: "whiteAlpha.900",
  _placeholder: { color: "whiteAlpha.500" },
  _hover: { borderColor: "rgba(255,255,255,0.28)" },
  _focus: {
    borderColor: "rgba(66,153,225,0.9)",
    boxShadow: "0 0 0 3px rgba(66,153,225,0.25)",
  },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
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
    if (role === "admin") {
      return (
        <Badge bg="rgba(170,90,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(170,90,255,0.26)">
          {label}
        </Badge>
      );
    }
    if (role === "freelancer") {
      return (
        <Badge bg="rgba(30,144,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(30,144,255,0.28)">
          {label}
        </Badge>
      );
    }
    return (
      <Badge bg="rgba(0,220,130,0.14)" color="whiteAlpha.900" border="1px solid rgba(0,220,130,0.22)">
        {label}
      </Badge>
    );
  };

  const statusBadge = (status) => {
    const isActive = status === "active";
    return isActive ? (
      <Badge bg="rgba(0,220,130,0.14)" color="whiteAlpha.900" border="1px solid rgba(0,220,130,0.22)">
        Faol
      </Badge>
    ) : (
      <Badge bg="rgba(255,0,80,0.10)" color="whiteAlpha.900" border="1px solid rgba(255,0,80,0.18)">
        Bloklangan
      </Badge>
    );
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

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

    if (selectedRole !== "all") {
      result = result.filter((u) => u.role === selectedRole);
    }

    if (selectedStatus !== "all") {
      result = result.filter((u) => (u.status ?? "active") === selectedStatus);
    }

    return result;
  }, [users, searchTerm, selectedRole, selectedStatus]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.300" thickness="4px" />
        <Text ml={4} fontSize="lg" color="whiteAlpha.800">
          Foydalanuvchilar yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert
        status="error"
        borderRadius="xl"
        my={4}
        bg="rgba(255,0,80,0.10)"
        border="1px solid rgba(255,0,80,0.18)"
        color="whiteAlpha.900"
      >
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="whiteAlpha.900">
            Foydalanuvchilar
          </Heading>
          <Text mt={1} color="whiteAlpha.600" fontSize="sm">
            Qidirish, filtr va status boshqaruvi
          </Text>
        </Box>
      </Flex>

      {/* Filters (glass) */}
      <Card {...GLASS_CARD} mb={6} position="relative">
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          bgGradient="linear(to-b, rgba(255,255,255,0.10), rgba(255,255,255,0.02))"
        />
        <CardBody position="relative">
          <HStack spacing={4} wrap="wrap">
            <InputGroup maxW={{ base: "100%", md: "420px" }}>
              <InputLeftElement>
                <SearchIcon color="rgba(255,255,255,0.55)" />
              </InputLeftElement>
              <Input
                placeholder="Ism, username yoki email bo‘yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                {...inputStyle}
              />
            </InputGroup>

            <Select
              maxW={{ base: "100%", md: "220px" }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              bg="rgba(255,255,255,0.06)"
              borderColor="rgba(255,255,255,0.14)"
              color="whiteAlpha.900"
            >
              <option style={{ background: "#0A1226", color: "#fff" }} value="all">Barcha rollar</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="freelancer">Freelancer</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="client">Client</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="admin">Admin</option>
            </Select>


            <Select
              maxW={{ base: "100%", md: "220px" }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              bg="rgba(255,255,255,0.06)"
              borderColor="rgba(255,255,255,0.14)"
              color="whiteAlpha.900"
            >
              <option style={{ background: "#0A1226", color: "#fff" }} value="all">Barcha statuslar</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="active">Faol</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="blocked">Bloklangan</option>
            </Select>


            <Badge
              ml={{ base: 0, md: "auto" }}
              bg="rgba(30,144,255,0.14)"
              color="whiteAlpha.900"
              border="1px solid rgba(30,144,255,0.22)"
              borderRadius="lg"
              px={3}
              py={1}
            >
              Natija: {filteredUsers.length}
            </Badge>
          </HStack>
        </CardBody>
      </Card>

      {/* Table wrapper (glass) */}
      <Card {...GLASS_CARD} position="relative">
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          bgGradient="linear(to-b, rgba(255,255,255,0.10), rgba(255,255,255,0.02))"
        />
        <CardBody position="relative" p={0}>
          <Box overflowX="auto">
            <Table size="lg" variant="simple">
              <Thead>
                <Tr bg="rgba(255,255,255,0.04)">
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Foydalanuvchi</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Username</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Email</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Role</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Status</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Amallar</Th>
                </Tr>
              </Thead>

              <Tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const fullName =
                      `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Noma'lum";
                    const isActive = (user.status ?? "active") === "active";

                    return (
                      <Tr
                        key={user.id}
                        _hover={{ bg: "rgba(255,255,255,0.04)" }}
                        transition="background 0.12s"
                      >
                        <Td borderColor="rgba(255,255,255,0.06)">
                          <Link to={`/admin/users/${user.id}`}>
                            <Flex align="center" gap={3} cursor="pointer" _hover={{ opacity: 0.9 }}>
                              <Avatar name={fullName} size="md" />
                              <Box>
                                <Text fontWeight="semibold" color="whiteAlpha.900">
                                  {fullName}
                                </Text>
                                <Text fontSize="xs" color="whiteAlpha.600">
                                  ID: {user.id}
                                </Text>
                              </Box>
                            </Flex>
                          </Link>
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.800">
                          {user.username || "—"}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.800">
                          {user.email || "—"}
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)">{roleBadge(user.role)}</Td>
                        <Td borderColor="rgba(255,255,255,0.06)">{statusBadge(user.status ?? "active")}</Td>

                        <Td borderColor="rgba(255,255,255,0.06)">
                          <HStack spacing={2}>
                            <IconButton
                              as={Link}
                              to={`/admin/users/${user.id}`}
                              icon={<EditIcon />}
                              size="sm"
                              aria-label="Tahrirlash"
                              bg="rgba(30,144,255,0.12)"
                              color="whiteAlpha.900"
                              border="1px solid rgba(30,144,255,0.20)"
                              _hover={{ bg: "rgba(30,144,255,0.18)" }}
                            />

                            {isActive ? (
                              <IconButton
                                icon={<NotAllowedIcon />}
                                size="sm"
                                aria-label="Bloklash"
                                bg="rgba(255,0,80,0.10)"
                                color="whiteAlpha.900"
                                border="1px solid rgba(255,0,80,0.18)"
                                _hover={{ bg: "rgba(255,0,80,0.14)" }}
                                onClick={() => toggleStatus(user.id, "blocked")}
                              />
                            ) : (
                              <IconButton
                                icon={<CheckCircleIcon />}
                                size="sm"
                                aria-label="Faollashtirish"
                                bg="rgba(0,220,130,0.12)"
                                color="whiteAlpha.900"
                                border="1px solid rgba(0,220,130,0.20)"
                                _hover={{ bg: "rgba(0,220,130,0.16)" }}
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
                    <Td colSpan={6} textAlign="center" color="whiteAlpha.600" py={10}>
                      Hech qanday natija topilmadi
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
