// src/pages/admin/UserDetail.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  VStack,
  HStack,
  Tag,
  TagLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { ArrowLeft, Mail, Phone, Shield, Ban, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../lib/api";

export default function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Real backenddan foydalanuvchi tafsilotlarini olamiz
        const res = await api(`/admin/users/${userId}`);

        setUser(res.data.user || null);
      } catch (err) {
        console.error("Foydalanuvchi tafsilotlarini olishda xato:", err);
        setError("Foydalanuvchi ma'lumotlarini yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserDetail();
  }, [userId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} fontSize="lg">
          Foydalanuvchi tafsilotlari yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error || !user) {
    return (
      <Alert status="error" borderRadius="lg" my={8}>
        <AlertIcon />
        <Text>{error || "Foydalanuvchi topilmadi."}</Text>
      </Alert>
    );
  }

  const getRoleBadge = (role) => {
    const color = role === "admin" ? "purple" : role === "freelancer" ? "blue" : "green";
    const label = role === "admin" ? "Admin" : role === "freelancer" ? "Freelancer" : "Client";
    return <Badge colorScheme={color}>{label}</Badge>;
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge colorScheme="green">Faol</Badge>
    ) : (
      <Badge colorScheme="red">Bloklangan</Badge>
    );
  };

  return (
    <Box>
      {/* Back tugmasi */}
      <Flex align="center" mb={6} gap={4}>
        <Link to="/admin/users">
          <IconButton icon={<ArrowLeft size={20} />} colorScheme="gray" variant="ghost" />
        </Link>
        <Heading size="xl">Foydalanuvchi tafsilotlari</Heading>
      </Flex>

      <Card mb={8}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={4}>
              <Avatar name={`${user.first_name} ${user.last_name}`} size="xl" />
              <Box>
                <Heading size="lg">{user.first_name} {user.last_name}</Heading>
                <Flex align="center" gap={4} mt={2}>
                  <Text color="gray.600">@{user.username}</Text>
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status || "active")}
                  {user.is_verified && <Badge colorScheme="green"><HStack spacing={1}><Shield size={14} /><Text>Tasdiqlangan</Text></HStack></Badge>}
                  {user.is_premium && <Badge colorScheme="yellow">Premium</Badge>}
                </Flex>
              </Box>
            </Flex>
            <HStack spacing={3}>
              {user.status === "active" ? (
                <Button colorScheme="red" variant="outline" leftIcon={<Ban size={18} />}>
                  Bloklash
                </Button>
              ) : (
                <Button colorScheme="green" leftIcon={<CheckCircle size={18} />}>
                  Faollashtirish
                </Button>
              )}
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Email</Text>
                <Flex align="center" gap={2} mt={1}>
                  <Mail size={16} />
                  <Text>{user.email}</Text>
                </Flex>
              </Box>
              <Box>
                <Text fontWeight="medium" color="gray.600">Telefon</Text>
                <Flex align="center" gap={2} mt={1}>
                  <Phone size={16} />
                  <Text>{user.phone || "Kiritilmagan"}</Text>
                </Flex>
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Balans</Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>{user.balance_uzs || "0 so‘m"}</Text>
                <Text fontSize="sm" color="gray.600">{user.balance_usd || "$0"}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="gray.600">Rating</Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>{user.rating || "Noma'lum"} ⭐</Text>
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Ro‘yxatdan o‘tgan</Text>
                <Text mt={1}>{new Date(user.created_at).toLocaleDateString()}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="gray.600">Oxirgi faollik</Text>
                <Text mt={1}>Noma'lum (keyin qo'shiladi)</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="gray.600">Tugallangan loyihalar</Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>{user.completed_jobs || 0}</Text>
              </Box>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* So‘nggi loyihalar */}
      <Card>
        <CardHeader>
          <Heading size="md">So‘nggi loyihalar</Heading>
        </CardHeader>
        <CardBody>
          {user.recent_jobs && user.recent_jobs.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Loyiha nomi</Th>
                  <Th>Byudjet</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {user.recent_jobs.map((job, index) => (
                  <Tr key={index}>
                    <Td>{job.title}</Td>
                    <Td fontWeight="semibold">{job.budget}</Td>
                    <Td>{getStatusBadge(job.status)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500">Hozircha loyihalar yo‘q</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}