// src/pages/admin/PaymentDetail.jsx
import React from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Divider,
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
  IconButton,
} from "@chakra-ui/react";
import { ArrowLeftIcon, CheckCircleIcon, CloseIcon } from "@chakra-ui/icons";
import { useParams, Link } from "react-router-dom";

export default function PaymentDetail() {
  const { paymentId } = useParams(); // URL dan payment ID ni olamiz

  // Mock data – keyin backend dan olamiz
  const payment = {
    id: paymentId || "3",
    user: {
      name: "Ali Pro",
      username: "ali_pro",
      avatar: null,
      email: "ali@example.com",
      phone: "+998901234567",
    },
    type: "withdrawal",
    amount: "2,000,000 so‘m",
    gateway: "Click",
    gatewayTransactionId: "CLICK-123456789",
    status: "pending",
    requestedAt: "2026-01-03 14:30",
    processedAt: null,
    notes: "Bank kartaga yechib olish so‘rovi",
    log: [
      { time: "2026-01-03 14:30", action: "So‘rov yuborildi", by: "Foydalanuvchi" },
      { time: "2026-01-03 15:00", action: "Admin ko‘rib chiqmoqda", by: "Admin" },
    ],
  };

  const getTypeBadge = (type) => {
    const colorScheme = {
      deposit: "green",
      withdrawal: "orange",
      escrow_release: "blue",
      fee: "purple",
      refund: "red",
    };
    const label = {
      deposit: "Depozit",
      withdrawal: "Yechib olish",
      escrow_release: "Escrow chiqarish",
      fee: "Platforma haqi",
      refund: "Qaytarish",
    };
    return <Badge colorScheme={colorScheme[type] || "gray"} fontSize="md" px={3} py={1} borderRadius="full">
      {label[type] || type}
    </Badge>;
  };

  const getStatusBadge = (status) => {
    const colorScheme = {
      completed: "green",
      pending: "yellow",
      in_progress: "blue",
      failed: "red",
    };
    const label = {
      completed: "Muvaffaqiyatli",
      pending: "Kutilmoqda",
      in_progress: "Jarayonda",
      failed: "Muvaffaqiyatsiz",
    };
    return <Badge colorScheme={colorScheme[status] || "gray"} fontSize="md" px={3} py={1} borderRadius="full">
      {label[status] || status}
    </Badge>;
  };

  return (
    <Box>
      {/* Back tugmasi */}
      <Flex align="center" mb={6} gap={4}>
        <Link to="/admin/payments">
          <IconButton icon={<ArrowLeftIcon />} colorScheme="gray" variant="ghost" size="lg" />
        </Link>
        <Heading size="xl">To‘lov tafsilotlari</Heading>
        <Badge fontSize="lg" colorScheme="orange">Transaction #{payment.id}</Badge>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        {/* Umumiy ma’lumotlar */}
        <Card>
          <CardHeader>
            <Heading size="md">Umumiy ma’lumotlar</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Flex justify="space-between">
                <Text fontWeight="medium">Foydalanuvchi</Text>
                <Flex align="center" gap={3}>
                  <Avatar name={payment.user.name} size="sm" />
                  <Box textAlign="right">
                    <Text fontWeight="semibold">{payment.user.name}</Text>
                    <Text fontSize="sm" color="gray.600">@{payment.user.username}</Text>
                  </Box>
                </Flex>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Turi</Text>
                {getTypeBadge(payment.type)}
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Summa</Text>
                <Text fontSize="xl" fontWeight="bold">{payment.amount}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Gateway</Text>
                <Tag colorScheme="teal" variant="subtle">
                  <TagLabel>{payment.gateway}</TagLabel>
                </Tag>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Status</Text>
                {getStatusBadge(payment.status)}
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">So‘rov vaqti</Text>
                <Text>{payment.requestedAt}</Text>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Gateway detallari */}
        <Card>
          <CardHeader>
            <Heading size="md">Gateway detallari</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Flex justify="space-between">
                <Text fontWeight="medium">Gateway Transaction ID</Text>
                <Text fontWeight="semibold">{payment.gatewayTransactionId || "-"}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Izoh</Text>
                <Text>{payment.notes || "-"}</Text>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Loglar */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Tranzaksiya loglari</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Vaqti</Th>
                <Th>Amal</Th>
                <Th>Kim tomonidan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {payment.log.map((log, index) => (
                <Tr key={index}>
                  <Td>{log.time}</Td>
                  <Td>{log.action}</Td>
                  <Td>{log.by}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Amallar tugmalari (faqat pending bo‘lganda) */}
      {payment.status === "pending" && (
        <HStack spacing={6} justify="center" mt={10}>
          <Button leftIcon={<CheckCircleIcon />} colorScheme="green" size="lg">
            Tasdiqlash
          </Button>
          <Button leftIcon={<CloseIcon />} colorScheme="red" size="lg">
            Rad etish
          </Button>
        </HStack>
      )}
    </Box>
  );
}