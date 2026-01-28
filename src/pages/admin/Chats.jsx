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
import { Ban, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import socket from "../../utils/socket";

export default function AdminChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    socket.connect();

    const fetchChats = async () => {
      try {
        const res = await api("/messages");

        let fetchedChats = [];
        if (res.data?.chats && Array.isArray(res.data.chats)) fetchedChats = res.data.chats;
        else if (res.data?.data?.chats) fetchedChats = res.data.data.chats;
        else if (Array.isArray(res.data)) fetchedChats = res.data;

        // ✅ status yo‘q bo‘lsa active deb olamiz
        const normalized = (fetchedChats || []).map((c) => ({
          ...c,
          status: c.status ?? "active",
        }));

        setChats(normalized);
      } catch (err) {
        console.error("Chatlarni olishda xato:", err);
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    socket.on("newMessage", (newMessage) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.chat_id === newMessage.chat_id) {
            return {
              ...chat,
              last_message_content: newMessage.content,
              last_message_at: newMessage.created_at,
              unread_count: (chat.unread_count || 0) + 1,
            };
          }
          return chat;
        })
      );

      toast({
        title: "Yangi xabar!",
        description: `Yangi xabar: ${newMessage.content?.slice(0, 30) || "..."}`,
        status: "info",
        duration: 3500,
        isClosable: true,
      });
    });

    socket.on("unreadUpdate", ({ chatId, unreadCount }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chat_id === chatId ? { ...chat, unread_count: unreadCount } : chat
        )
      );
    });

    // ✅ chat status update real-time (backend emit qilsa)
    socket.on("chatStatusUpdated", ({ chat_id, status }) => {
      setChats((prev) =>
        prev.map((c) => (c.chat_id === chat_id ? { ...c, status } : c))
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("unreadUpdate");
      socket.off("chatStatusUpdated");
      socket.disconnect();
    };
  }, [toast]);

  const statusBadge = (status) => {
    const isActive = (status ?? "active") === "active";
    return (
      <Badge colorScheme={isActive ? "green" : "red"}>
        {isActive ? "ACTIVE" : "BLOCKED"}
      </Badge>
    );
  };

  const toggleChatStatus = async (chatId, currentStatus) => {
    const nextStatus = currentStatus === "blocked" ? "active" : "blocked";

    const ok = window.confirm(
      nextStatus === "blocked"
        ? "Chatni bloklamoqchimisiz? (xabar yuborish to‘xtaydi)"
        : "Chatni faollashtirmoqchimisiz?"
    );
    if (!ok) return;

    try {
      setBusyId(chatId);

      // ✅ route: PATCH /messages/chats/:id/status
      const res = await api.patch(`/messages/chats/${chatId}/status`, { status: nextStatus });

      const payload = res?.data ?? res;
      const updated = payload?.data?.chat || payload?.chat || { id: chatId, status: nextStatus };

      setChats((prev) =>
        prev.map((c) => (c.chat_id === chatId ? { ...c, status: updated.status ?? nextStatus } : c))
      );

      toast({
        title: "OK",
        description: nextStatus === "blocked" ? "Chat bloklandi" : "Chat faollashtirildi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Chat status update error:", err);
      toast({
        title: "Xato",
        description: "Chat statusini o‘zgartirishda xato",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const partnerName = `${chat.partner?.first_name || ""} ${chat.partner?.last_name || ""}`.toLowerCase();
    const jobKey = String(chat.job_id || chat.contract_id || "").toLowerCase();
    const q = searchTerm.toLowerCase();
    return partnerName.includes(q) || jobKey.includes(q);
  });

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

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Foydalanuvchi</Th>
              <Th>Oxirgi xabar</Th>
              <Th>Vaqt</Th>
              <Th>O‘qilmagan</Th>
              <Th>Status</Th>
              <Th>Amallar</Th>
            </Tr>
          </Thead>

          <Tbody>
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const chatStatus = chat.status ?? "active";
                const isBlocked = chatStatus === "blocked";

                return (
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
                        ? new Date(chat.last_message_at).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" })
                        : chat.chat_created_at
                        ? new Date(chat.chat_created_at).toLocaleString("uz-UZ", { dateStyle: "short" })
                        : "—"}
                    </Td>

                    <Td>
                      {chat.unread_count > 0 && (
                        <Badge colorScheme="red" borderRadius="full" px={3} py={1}>
                          {chat.unread_count}
                        </Badge>
                      )}
                    </Td>

                    <Td>{statusBadge(chatStatus)}</Td>

                    <Td>
                      <HStack spacing={1}>
                        {/* Open chat */}
                        <IconButton
                          as={Link}
                          to={`/admin/chats/${chat.chat_id}`}
                          icon={<MessageSquare size={18} />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          aria-label="Chatni ochish"
                        />

                        {/* Block / Unblock */}
                        <IconButton
                          icon={isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                          size="sm"
                          colorScheme={isBlocked ? "green" : "red"}
                          variant="ghost"
                          aria-label={isBlocked ? "Faollashtirish" : "Bloklash"}
                          isLoading={busyId === chat.chat_id}
                          onClick={() => toggleChatStatus(chat.chat_id, chatStatus)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center" py={10} color="gray.500">
                  Hozircha chatlar yo‘q.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
