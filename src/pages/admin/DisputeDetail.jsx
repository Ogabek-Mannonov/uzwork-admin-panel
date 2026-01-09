// src/pages/admin/DisputeDetail.jsx
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
  Icon,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,  // <--- BU YERGA QO‘SHILDI – XATO SHU YERDAN EDI
} from "@chakra-ui/react";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, MessageSquare, FileText, DollarSign } from "lucide-react";
import { useParams, Link } from "react-router-dom";

export default function DisputeDetail() {
  const { disputeId } = useParams();

  // Mock data – keyin backend dan olamiz
  const dispute = {
    id: disputeId || "1",
    jobTitle: "React JS da responsiv web sayt",
    client: { name: "Kamola Company", username: "kamola_client", avatar: null, rating: 4.9 },
    freelancer: { name: "Ogabek Dev", username: "ogabek_dev", avatar: null, rating: 4.8 },
    raisedBy: "client",
    reason: "Ish to'liq bajarilmadi, admin panel ishlamayapti va deadline o'tib ketdi",
    amount: "5,000,000 so'm",
    status: "open",
    createdAt: "2026-01-02",
    evidence: ["chat_screenshot_1.png", "milestone_file.pdf"],
    chatHistory: [
      { sender: "Client", message: "Admin panel ishlamayapti, deadline o'tib ketdi", time: "10:15" },
      { sender: "Freelancer", message: "Admin panel ishlayapti, client qo'shimcha o'zgartirishlar so'radi", time: "10:20" },
      { sender: "Client", message: "Hech qanday o'zgartirish so'ramadim, bu yolg'on", time: "10:25" },
    ],
    milestones: [
      { title: "Landing page", amount: "2,000,000 so'm", status: "approved" },
      { title: "Admin panel", amount: "3,000,000 so'm", status: "pending" },
    ],
  };

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
    return <Badge colorScheme={colorScheme[status] || "gray"} fontSize="md" px={3} py={1} borderRadius="full">
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
      {/* Back tugmasi */}
      <Flex align="center" mb={6} gap={4}>
        <Link to="/admin/disputes">
          <IconButton icon={<ArrowLeftIcon />} colorScheme="gray" variant="ghost" size="lg" />
        </Link>
        <Heading size="xl">Nizo tafsilotlari</Heading>
        <Badge fontSize="lg" colorScheme="orange">Nizo #{dispute.id}</Badge>
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
                <Text fontWeight="medium">Loyiha nomi</Text>
                <Text fontWeight="semibold">{dispute.jobTitle}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Summa</Text>
                <Text fontWeight="semibold">{dispute.amount}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Tomoni</Text>
                {getRaisedByBadge(dispute.raisedBy)}
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Status</Text>
                {getStatusBadge(dispute.status)}
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Yaratilgan sana</Text>
                <Text>{dispute.createdAt}</Text>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Sababi */}
        <Card>
          <CardHeader>
            <Heading size="md">Sababi</Heading>
          </CardHeader>
          <CardBody>
            <Text>{dispute.reason}</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Client va Freelancer info */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader>
            <Heading size="md">Client</Heading>
          </CardHeader>
          <CardBody>
            <Flex align="center" gap={4}>
              <Avatar name={dispute.client.name} size="lg" />
              <Box>
                <Text fontWeight="bold" fontSize="lg">{dispute.client.name}</Text>
                <Text fontSize="sm" color="gray.600">@{dispute.client.username}</Text>
                <Text fontSize="sm">Rating: {dispute.client.rating} ⭐</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Freelancer</Heading>
          </CardHeader>
          <CardBody>
            <Flex align="center" gap={4}>
              <Avatar name={dispute.freelancer.name} size="lg" />
              <Box>
                <Text fontWeight="bold" fontSize="lg">{dispute.freelancer.name}</Text>
                <Text fontSize="sm" color="gray.600">@{dispute.freelancer.username}</Text>
                <Text fontSize="sm">Rating: {dispute.freelancer.rating} ⭐</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Chat tarixi */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Chat tarixi</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            {dispute.chatHistory.map((msg, index) => (
              <Box key={index} p={4} bg={msg.sender === "Client" ? "blue.50" : "gray.50"} borderRadius="lg">
                <Flex justify="space-between" align="center">
                  <Text fontWeight="medium">{msg.sender}</Text>
                  <Text fontSize="sm" color="gray.600">{msg.time}</Text>
                </Flex>
                <Text mt={2}>{msg.message}</Text>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Evidence fayllar */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Dalillar (Evidence)</Heading>
        </CardHeader>
        <CardBody>
          <Wrap>
            {dispute.evidence.map((file, index) => (
              <WrapItem key={index}>
                <Tag size="lg" colorScheme="blue" variant="subtle">
                  <TagLabel>{file}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </CardBody>
      </Card>

      {/* Milestone lar */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Milestone lar</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Milestone nomi</Th>
                <Th>Summa</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dispute.milestones.map((milestone, index) => (
                <Tr key={index}>
                  <Td>{milestone.title}</Td>
                  <Td>{milestone.amount}</Td>
                  <Td>{getStatusBadge(milestone.status)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Qaror chiqarish tugmalari */}
      {dispute.status === "open" && (
        <HStack spacing={4} justify="center" mt={10}>
          <Button leftIcon={<CheckCircleIcon />} colorScheme="green" size="lg">
            Freelancerga pul berish
          </Button>
          <Button leftIcon={<XCircleIcon />} colorScheme="red" size="lg">
            Clientga refund qilish
          </Button>
          <Button variant="outline" colorScheme="gray" size="lg">
            Qaror chiqarmayman
          </Button>
        </HStack>
      )}
    </Box>
  );
}