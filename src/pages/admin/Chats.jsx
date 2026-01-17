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
  Flex,
  Text,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import socket from "../../utils/socket";

export default function AdminChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Socket ulanish
    socket.connect();

    // Real ma’lumotlarni olish
    const fetchChats = async () => {
      try {
        const res = await api("/messages"); // getChats endpointi
        setChats(res.data.data.chats || []);
      } catch (err) {
        console.error("Chatlarni olishda xato:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Yangi xabar kelganda yangilash
    socket.on("newMessage", (message) => {
      // Yangi xabar kelgan chatni yangilash
      setChats((prev) =>
        prev.map((chat) =>
          chat.partner_id === message.sender_id || chat.partner_id === message.receiver_id
            ? { ...chat, last_message: message.message_text, unread_count: chat.unread_count + 1 }
            : chat
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.partner?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.partner?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Spinner size="xl" />;

  return (
    <Box>
      <Heading size="xl" mb={8}>Chatlar</Heading>

      <HStack mb={6}>
        <InputGroup maxW="500px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Foydalanuvchi yoki loyiha bo‘yicha qidirish"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Foydalanuvchi</Th>
              <Th>Oxirgi xabar</Th>
              <Th>Vaqt</Th>
              <Th>O‘qilmagan</Th>
              <Th>Amallar</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredChats.map((chat) => (
              <Tr key={chat.partner_id}>
                <Td>
                  <HStack>
                    <Avatar name={`${chat.partner.first_name} ${chat.partner.last_name}`} size="md" />
                    <Box>
                      <Text fontWeight="medium">
                        {chat.partner.first_name} {chat.partner.last_name}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {chat.partner.role}
                      </Text>
                    </Box>
                  </HStack>
                </Td>
                <Td>{chat.last_message || "Hech qanday xabar yo‘q"}</Td>
                <Td>{chat.last_message_at ? new Date(chat.last_message_at).toLocaleString() : "—"}</Td>
                <Td>
                  {chat.unread_count > 0 && (
                    <Badge colorScheme="red" borderRadius="full" px={3}>
                      {chat.unread_count}
                    </Badge>
                  )}
                </Td>
                <Td>
                  <IconButton
                    as={Link}
                    to={`/admin/chats/${chat.partner_id}`}  // bitta chat sahifasiga
                    icon={<MessageSquare />}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}