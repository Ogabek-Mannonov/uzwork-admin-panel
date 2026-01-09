// src/pages/admin/UserDetail.jsx
import React from "react";
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
} from "@chakra-ui/react";
import { ArrowLeft, Mail, Phone, Shield, Ban, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function UserDetail() {
  const { userId } = useParams();

  // Mock data – keyin backend dan olamiz
  const user = {
    id: userId || "1",
    name: "Ogabek Dev",
    username: "ogabek_dev",
    email: "ogabek@example.com",
    phone: "+998901234567",
    role: "freelancer",
    isVerified: true,
    isPremium: false,
    balanceUZS: "2,500,000 so‘m",
    balanceUSD: "$150",
    rating: 4.8,
    completedJobs: 45,
    joinedAt: "2025-06-15",
    lastActive: "5 daqiqa oldin",
    status: "active", // active, blocked
    recentJobs: [
      { title: "React JS sayt", budget: "5,000,000 so‘m", status: "completed" },
      { title: "Flutter ilova", budget: "15,000,000 so‘m", status: "in_progress" },
    ],
  };

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
              <Avatar name={user.name} size="xl" />
              <Box>
                <Heading size="lg">{user.name}</Heading>
                <Flex align="center" gap={4} mt={2}>
                  <Text color="gray.600">@{user.username}</Text>
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                  {user.isVerified && <Badge colorScheme="green"><HStack spacing={1}><Shield size={14} /><Text>Tasdiqlangan</Text></HStack></Badge>}
                  {user.isPremium && <Badge colorScheme="yellow">Premium</Badge>}
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
                  <Text>{user.phone}</Text>
                </Flex>
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Balans</Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>{user.balanceUZS}</Text>
                <Text fontSize="sm" color="gray.600">{user.balanceUSD}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="gray.600">Rating</Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>{user.rating} ⭐</Text>
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Ro‘yxatdan o‘tgan</Text>
                <Text mt={1}>{user.joinedAt}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="gray.600">Oxirgi faollik</Text>
                <Text mt={1}>{user.lastActive}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="gray.600">Tugallangan loyihalar</Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>{user.completedJobs}</Text>
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
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Loyiha nomi</Th>
                <Th>Byudjet</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {user.recentJobs.map((job, index) => (
                <Tr key={index}>
                  <Td>{job.title}</Td>
                  <Td fontWeight="semibold">{job.budget}</Td>
                  <Td>{getStatusBadge(job.status)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
}