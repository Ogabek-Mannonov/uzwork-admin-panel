// src/pages/admin/Chats.jsx
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
  useToast,
} from "@chakra-ui/react";
import { SearchIcon, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import socket from "../../utils/socket";

export default function AdminChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  useEffect(() => {
    // Socket ulanish (real-time uchun)
    socket.connect();

    // Chatlar ro‘yxatini backenddan olish
    const fetchChats = async () => {
      try {
        const res = await api("/messages");
        const fetchedChats = res.data.data.chats || [];
        setChats(fetchedChats);
      } catch (err) {
        console.error("Chatlarni olishda xato:", err);
        toast({
          title: "Xato",
          description: "Chatlarni yuklashda muammo yuz berdi",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Yangi xabar kelganda ro‘yxatni yangilash
    socket.on("newMessage", (newMessage) => {
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.chat_id === newMessage.chat_id) {
            return {
              ...chat,
              last_message_content: newMessage.content,
              last_message_at: newMessage.created_at,
              unread_count: (chat.unread_count || 0) + 1,
            };
          }
          return chat;
        });
      });

      toast({
        title: "Yangi xabar!",
        description: `Yangi xabar keldi: ${newMessage.content?.slice(0, 30) || "..."}`,
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    });

    // O‘qilmagan xabarlar yangilanishi (agar kerak bo‘lsa)
    socket.on("unreadUpdate", ({ chatId, unreadCount }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chat_id === chatId ? { ...chat, unread_count: unreadCount } : chat
        )
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("unreadUpdate");
      socket.disconnect();
    };
  }, [toast]);

  // Qidiruv filtri (partner nomi bo‘yicha)
  const filteredChats = chats.filter((chat) =>
    `${chat.partner?.first_name || ""} ${chat.partner?.last_name || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="70vh">
        <Spinner size="xl" color="blue.500" />
        <Text ml={4}>Chatlar yuklanmoqda...</Text>
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={8}>Chatlar (UzWork Admin)</Heading>

      {/* Qidiruv */}
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="500px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Foydalanuvchi yoki loyiha bo‘yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </HStack>

      {/* Chatlar jadvali */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Foydalanuvchi</Th>
              <Th>Oxirgi xabar</Th>
              <Th>Vaqt</Th>
              <Th>O‘qilmagan</Th>
              <Th>Amallar</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <Tr key={chat.chat_id} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <HStack>
                      <Avatar
                        name={`${chat.partner?.first_name || "N"} ${chat.partner?.last_name || ""}`}
                        size="md"
                      />
                      <Box>
                        <Text fontWeight="medium">
                          {chat.partner?.first_name || "Noma'lum"} {chat.partner?.last_name || ""}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {chat.partner?.role || "Foydalanuvchi"} • Job/Contract #{chat.job_id || chat.contract_id || "—"}
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td maxW="300px">
                    <Text noOfLines={1} fontSize="sm">
                      {chat.last_message_content || "Hech qanday xabar yo‘q"}
                    </Text>
                  </Td>
                  <Td fontSize="sm" color="gray.600">
                    {chat.last_message_at
                      ? new Date(chat.last_message_at).toLocaleString("uz-UZ", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : new Date(chat.chat_created_at).toLocaleString("uz-UZ", {
                          dateStyle: "short",
                        })}
                  </Td>
                  <Td>
                    {chat.unread_count > 0 && (
                      <Badge colorScheme="red" borderRadius="full" px={3} py={1}>
                        {chat.unread_count}
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    <IconButton
                      as={Link}
                      to={`/admin/chats/${chat.chat_id}`}  // bitta chat sahifasiga o‘tish
                      icon={<MessageSquare size={18} />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      aria-label="Chatni ochish"
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10} color="gray.500">
                  Hozircha chatlar yo‘q. Yangi loyiha yoki contract ochilganda chatlar paydo bo‘ladi.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}