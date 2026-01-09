// src/pages/admin/Disputes.jsx
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
  Button,
  Flex,
  Text,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Divider,
  VStack,
  Textarea,
} from "@chakra-ui/react";
import { ViewIcon, CheckCircleIcon, CloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export default function AdminDisputes() {
  // Mock data – keyin backend dan olamiz
  const disputes = [
    {
      id: 1,
      jobTitle: "React JS sayt",
      client: "Kamola Company",
      freelancer: "Ogabek Dev",
      raisedBy: "client",
      reason: "Ish to'liq bajarilmadi, admin panel ishlamayapti",
      amount: "5,000,000 so'm",
      status: "open",
      createdAt: "2026-01-02",
    },
    {
      id: 2,
      jobTitle: "Logo dizayn",
      client: "Shaxsiy",
      freelancer: "Sardor Designer",
      raisedBy: "freelancer",
      reason: "Client qo'shimcha o'zgartirishlar talab qilyapti, lekin pul to'lamayapti",
      amount: "1,500,000 so'm",
      status: "in_review",
      createdAt: "2025-12-30",
    },
    {
      id: 3,
      jobTitle: "Flutter mobil ilova",
      client: "Tech Startup",
      freelancer: "Ali Pro",
      raisedBy: "client",
      reason: "Ilova App Store da rad etildi",
      amount: "15,000,000 so'm",
      status: "resolved",
      createdAt: "2025-12-25",
    },
  ];

  const getStatusBadge = (status) => {
    const colorScheme = {
      open: "orange",
      in_review: "blue",
      resolved: "green",
      cancelled: "gray",
    };
    const label = {
      open: "Ochiq",
      in_review: "Ko'rib chiqilmoqda",
      resolved: "Hal qilingan",
      cancelled: "Bekor qilingan",
    };
    return <Badge colorScheme={colorScheme[status] || "gray"} fontSize="md" px={3} py={1}>
      {label[status] || status}
    </Badge>;
  };

  const getRaisedByBadge = (raisedBy) => {
    return raisedBy === "client" ? (
      <Badge colorScheme="red">Client tomonidan</Badge>
    ) : (
      <Badge colorScheme="purple">Freelancer tomonidan</Badge>
    );
  };

  return (
    <Box>
      <Heading size="xl" mb={8}>
        Nizolar (Disputes)
      </Heading>

      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="lg">
          <Thead>
            <Tr bg="gray.50">
              <Th>Nizo ID</Th>
              <Th>Loyiha</Th>
              <Th>Tomoni</Th>
              <Th>Sababi</Th>
              <Th>Summa</Th>
              <Th>Status</Th>
              <Th>Yaratilgan</Th>
              <Th>Amallar</Th>
            </Tr>
          </Thead>
          <Tbody>
            {disputes.map((dispute) => (
              <Tr key={dispute.id} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="medium">#{dispute.id}</Td>
                <Td>
                  <Text fontWeight="medium">{dispute.jobTitle}</Text>
                </Td>
                <Td>
                  <Flex direction="column" gap={1}>
                    <Flex align="center" gap={2}>
                      <Avatar name={dispute.client} size="xs" />
                      <Text fontSize="sm">{dispute.client}</Text>
                    </Flex>
                    <Flex align="center" gap={2}>
                      <Avatar name={dispute.freelancer} size="xs" />
                      <Text fontSize="sm">{dispute.freelancer}</Text>
                    </Flex>
                    {getRaisedByBadge(dispute.raisedBy)}
                  </Flex>
                </Td>
                <Td maxW="300px">
                  <Text noOfLines={2}>{dispute.reason}</Text>
                </Td>
                <Td fontWeight="semibold">{dispute.amount}</Td>
                <Td>{getStatusBadge(dispute.status)}</Td>
                <Td>{dispute.createdAt}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Link to={`/admin/disputes/${dispute.id}`}>
                      <IconButton
                        icon={<ViewIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        aria-label="Ko'rish"
                      />
                    </Link>
                    {dispute.status === "open" && (
                      <>
                        <IconButton
                          icon={<CheckCircleIcon />}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          aria-label="Hal qilish"
                        />
                        <IconButton
                          icon={<CloseIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          aria-label="Bekor qilish"
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