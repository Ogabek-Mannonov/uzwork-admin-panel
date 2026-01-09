// src/pages/admin/Payments.jsx
import React from "react";
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
  Flex,
  Text,
  Avatar,
  IconButton,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, CheckCircleIcon, CloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export default function AdminPayments() {
  // Mock data – keyin backend dan olamiz
  const transactions = [
    {
      id: 1,
      user: "Ogabek Dev",
      username: "ogabek_dev",
      type: "deposit",
      amount: "500,000 so'm",
      gateway: "Payme",
      status: "completed",
      date: "2026-01-05",
    },
    {
      id: 2,
      user: "Kamola Company",
      username: "kamola_client",
      type: "escrow_release",
      amount: "5,000,000 so'm",
      gateway: "Escrow",
      status: "completed",
      date: "2026-01-04",
    },
    {
      id: 3,
      user: "Ali Pro",
      username: "ali_pro",
      type: "withdrawal",
      amount: "2,000,000 so'm",
      gateway: "Click",
      status: "pending",
      date: "2026-01-03",
    },
    {
      id: 4,
      user: "Sardor Designer",
      username: "sardor_design",
      type: "fee",
      amount: "500,000 so'm",
      gateway: "Platform",
      status: "completed",
      date: "2026-01-02",
    },
    {
      id: 5,
      user: "Tech Startup",
      username: "tech_startup",
      type: "refund",
      amount: "15,000,000 so'm",
      gateway: "Escrow",
      status: "in_progress",
      date: "2026-01-01",
    },
  ];

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
    return <Badge colorScheme={colorScheme[type] || "gray"}>{label[type] || type}</Badge>;
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
    return <Badge colorScheme={colorScheme[status] || "gray"}>{label[status] || status}</Badge>;
  };

  return (
    <Box>
      <Heading size="xl" mb={8}>
        To'lovlar (Payments)
      </Heading>

      {/* Qidiruv va filter */}
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="500px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input placeholder="User, transaction ID yoki summa bo'yicha qidirish" />
        </InputGroup>

        <Select maxW="200px" placeholder="Turi">
          <option value="deposit">Depozit</option>
          <option value="withdrawal">Yechib olish</option>
          <option value="escrow_release">Escrow chiqarish</option>
          <option value="fee">Haq</option>
          <option value="refund">Qaytarish</option>
        </Select>

        <Select maxW="200px" placeholder="Status">
          <option value="completed">Muvaffaqiyatli</option>
          <option value="pending">Kutilmoqda</option>
          <option value="in_progress">Jarayonda</option>
          <option value="failed">Muvaffaqiyatsiz</option>
        </Select>

        <Select maxW="200px" placeholder="Gateway">
          <option value="payme">Payme</option>
          <option value="click">Click</option>
          <option value="escrow">Escrow</option>
          <option value="platform">Platform</option>
        </Select>
      </HStack>

      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="lg">
          <Thead>
            <Tr bg="gray.50">
              <Th>Transaction ID</Th>
              <Th>Foydalanuvchi</Th>
              <Th>Turi</Th>
              <Th>Summa</Th>
              <Th>Gateway</Th>
              <Th>Status</Th>
              <Th>Sana</Th>
              <Th>Amallar</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((tx) => (
              <Tr key={tx.id} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="medium">
                  <Link to={`/admin/payments/${tx.id}`}>
                    <Text color="blue.600">
                      #{tx.id}
                    </Text>
                  </Link>
                </Td>
                <Td>
                  <Flex align="center" gap={3}>
                    <Avatar name={tx.user} size="sm" />
                    <Box>
                      <Text fontWeight="medium">{tx.user}</Text>
                      <Text fontSize="sm" color="gray.600">@{tx.username}</Text>
                    </Box>
                  </Flex>
                </Td>
                <Td>{getTypeBadge(tx.type)}</Td>
                <Td fontWeight="semibold">{tx.amount}</Td>
                <Td>
                  <Tag colorScheme="teal" variant="subtle">
                    <TagLabel>{tx.gateway}</TagLabel>
                  </Tag>
                </Td>
                <Td>{getStatusBadge(tx.status)}</Td>
                <Td>{tx.date}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Link to={`/admin/payments/${tx.id}`}>
                      <IconButton
                        icon={<ViewIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        aria-label="Ko'rish"
                      />
                    </Link>
                    {tx.status === "pending" && (
                      <>
                        <IconButton
                          icon={<CheckCircleIcon />}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          aria-label="Tasdiqlash"
                        />
                        <IconButton
                          icon={<CloseIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          aria-label="Rad etish"
                        />
                      </>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}