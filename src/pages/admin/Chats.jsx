// src/pages/admin/Chats.jsx
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
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { MessageSquare } from "lucide-react";  // lucide-react dan
import { Link } from "react-router-dom";

export default function AdminChats() {
  // Mock data – keyin backend dan olamiz
  const chats = [
    {
      id: 1,
      jobTitle: "React JS sayt",
      client: "Kamola Company",
      freelancer: "Ogabek Dev",
      lastMessage: "Admin panel ishlayapti, test qiling",
      lastMessageTime: "5 daqiqa oldin",
      unreadCount: 3,
    },
    {
      id: 2,
      jobTitle: "Logo dizayn",
      client: "Shaxsiy",
      freelancer: "Sardor Designer",
      lastMessage: "Yangi variantni yubordim",
      lastMessageTime: "1 soat oldin",
      unreadCount: 0,
    },
    {
      id: 3,
      jobTitle: "Flutter mobil ilova",
      client: "Tech Startup",
      freelancer: "Ali Pro",
      lastMessage: "Ilova App Store ga yuklandi",
      lastMessageTime: "2 kun oldin",
      unreadCount: 0,
    },
  ];

  return (
    <Box>
      <Heading size="xl" mb={8}>
        Chatlar
      </Heading>

      {/* Qidiruv */}
      <HStack mb={6}>
        <InputGroup maxW="500px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input placeholder="Loyiha, client yoki freelancer bo‘yicha qidirish" />
        </InputGroup>
      </HStack>

      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="lg">
          <Thead>
            <Tr bg="gray.50">
              <Th>Loyiha</Th>
              <Th>Tomoni</Th>
              <Th>Oxirgi xabar</Th>
              <Th>Vaqt</Th>
              <Th>O‘qilmagan</Th>
              <Th>Amallar</Th>
            </Tr>
          </Thead>
          <Tbody>
            {chats.map((chat) => (
              <Tr key={chat.id} _hover={{ bg: "gray.50" }}>
                <Td>
                  <Text fontWeight="medium">{chat.jobTitle}</Text>
                </Td>
                <Td>
                  <Flex direction="column" gap={2}>
                    <Flex align="center" gap={2}>
                      <Avatar name={chat.client} size="xs" />
                      <Text fontSize="sm">{chat.client}</Text>
                    </Flex>
                    <Flex align="center" gap={2}>
                      <Avatar name={chat.freelancer} size="xs" />
                      <Text fontSize="sm">{chat.freelancer}</Text>
                    </Flex>
                  </Flex>
                </Td>
                <Td maxW="300px">
                  <Text noOfLines={1}>{chat.lastMessage}</Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">{chat.lastMessageTime}</Text>
                </Td>
                <Td>
                  {chat.unreadCount > 0 && (
                    <Badge colorScheme="red" borderRadius="full" px={2}>
                      {chat.unreadCount}
                    </Badge>
                  )}
                </Td>
                <Td>
                  <Link to={`/admin/chats/${chat.id}`}>
                    <IconButton
                      icon={<MessageSquare size={18} />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      aria-label="Chatni ochish"
                    />
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}