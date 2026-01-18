// src/pages/admin/ChatDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Box,
  Heading,
  Text,
  Flex,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft, Send, Paperclip, AlertTriangle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../lib/api";
import socket from "../../utils/socket";

export default function ChatDetail() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState({ client: null, freelancer: null });
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.connect();
    socket.emit("joinChat", chatId);

    const fetchData = async () => {
      try {
        const res = await api(`/messages/${chatId}`);
        console.log("Backenddan to'liq response:", res.data);

        // Xabarlar
        let fetchedMessages = [];
        if (res.data?.messages) {
          fetchedMessages = res.data.messages;
        } else if (res.data?.data?.messages) {
          fetchedMessages = res.data.data.messages;
        } else if (Array.isArray(res.data)) {
          fetchedMessages = res.data;
        }

        setMessages(fetchedMessages || []);

        // Client va freelancer ma'lumotlarini saqlash
        const clientData = res.data?.client || null;
        const freelancerData = res.data?.freelancer || null;

        setChatInfo({
          client: clientData,
          freelancer: freelancerData
        });

        console.log("Client info:", clientData);
        console.log("Freelancer info:", freelancerData);
        console.log("Client full name:", clientData ? `${clientData.first_name || ''} ${clientData.last_name || ''}`.trim() : 'N/A');
        console.log("Freelancer full name:", freelancerData ? `${freelancerData.first_name || ''} ${freelancerData.last_name || ''}`.trim() : 'N/A');
      } catch (err) {
        console.error("Ma'lumotlarni olishda xato:", err);
        toast({
          title: "Xato",
          description: "Chat ma'lumotlari yuklanmadi",
          status: "error",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on("newMessage", (newMsg) => {
      if (newMsg.chat_id === chatId) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    });

    socket.on("messagesRead", ({ chatId: updatedChatId }) => {
      if (updatedChatId === chatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            !msg.is_read && !msg.sender_is_admin ? { ...msg, is_read: true } : msg
          )
        );
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagesRead");
      socket.disconnect();
    };
  }, [chatId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await api.post("/messages", {
        chat_id: chatId,
        message_text: newMessage,
        type: "text",
      });

      console.log("Yuborilgan xabar response:", res.data);

      // Yangi xabarni qo'shish
      const sentMessage = res.data?.data?.message || res.data?.message;
      if (sentMessage) {
        setMessages((prev) => [...prev, sentMessage]);
      }
      
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Xabar yuborish xatosi:", err);
      toast({
        title: "Xato",
        description: "Xabar yuborilmadi",
        status: "error",
        duration: 5000,
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.500" />
        <Text ml={4}>Chat yuklanmoqda...</Text>
      </Flex>
    );
  }

  return (
    <Box h="calc(100vh - 100px)" display="flex" flexDirection="column">
      {/* Header */}
      <Card mb={4}>
        <CardHeader>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={4}>
              <Link to="/admin/chats">
                <IconButton icon={<ArrowLeft size={20} />} colorScheme="gray" variant="ghost" />
              </Link>
              <Box>
                <Heading size="md">Chat #{chatId.slice(0, 8)}...</Heading>
                <Flex align="center" gap={6} mt={2}>
                  {/* Client */}
                  {chatInfo.client && (
                    <Flex align="center" gap={2}>
                      <Avatar
                        name={`${chatInfo.client.first_name || ''} ${chatInfo.client.last_name || ''}`}
                        src={chatInfo.client.avatar_url || undefined}
                        size="sm"
                        bg="red.500"
                        color="white"
                      />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">
                          {chatInfo.client.first_name || chatInfo.client.last_name
                            ? `${chatInfo.client.first_name || ''} ${chatInfo.client.last_name || ''}`.trim()
                            : "Client"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          @{chatInfo.client.username || "client"}
                        </Text>
                      </Box>
                    </Flex>
                  )}

                  {/* Freelancer */}
                  {chatInfo.freelancer && (
                    <Flex align="center" gap={2}>
                      <Avatar
                        name={`${chatInfo.freelancer.first_name || ''} ${chatInfo.freelancer.last_name || ''}`}
                        src={chatInfo.freelancer.avatar_url || undefined}
                        size="sm"
                        bg="orange.500"
                        color="white"
                      />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">
                          {chatInfo.freelancer.first_name || chatInfo.freelancer.last_name
                            ? `${chatInfo.freelancer.first_name || ''} ${chatInfo.freelancer.last_name || ''}`.trim()
                            : "Freelancer"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          @{chatInfo.freelancer.username || "freelancer"}
                        </Text>
                      </Box>
                    </Flex>
                  )}
                </Flex>
              </Box>
            </Flex>
            <Button leftIcon={<AlertTriangle size={18} />} colorScheme="red" variant="outline">
              Dispute ochish
            </Button>
          </Flex>
        </CardHeader>
      </Card>

      {/* Xabarlar */}
      <Box flex="1" overflowY="auto" p={4} bg="gray.50" borderRadius="lg">
        <VStack align="stretch" spacing={4}>
          {messages.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={10}>
              Hozircha xabarlar yo'q
            </Text>
          ) : (
            messages.map((msg) => {
              // Yuboruvchini aniqlash - sender_role dan
              let sender = null;
              let senderName = "Unknown";
              let avatarBg = "gray.500";

              // Backend dan kelgan sender_role orqali aniqlash
              if (msg.sender_role === 'admin') {
                senderName = "Admin";
                avatarBg = "blue.500";
              } else if (msg.sender_role === 'client' || msg.sender_id === chatInfo.client?.id) {
                sender = chatInfo.client;
                senderName = sender?.first_name || sender?.last_name 
                  ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim()
                  : msg.sender_first_name || msg.sender_last_name
                    ? `${msg.sender_first_name || ''} ${msg.sender_last_name || ''}`.trim()
                    : "Client";
                avatarBg = "red.500";
              } else if (msg.sender_role === 'freelancer' || msg.sender_id === chatInfo.freelancer?.id) {
                sender = chatInfo.freelancer;
                senderName = sender?.first_name || sender?.last_name
                  ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim()
                  : msg.sender_first_name || msg.sender_last_name
                    ? `${msg.sender_first_name || ''} ${msg.sender_last_name || ''}`.trim()
                    : "Freelancer";
                avatarBg = "orange.500";
              }

              const isAdminMessage = msg.sender_role === 'admin';
              const avatarUrl = sender?.avatar_url || msg.sender_avatar;
              const username = sender?.username || msg.sender_username;

              return (
                <Flex
                  key={msg.id}
                  alignSelf={isAdminMessage ? "flex-end" : "flex-start"}
                  maxW="70%"
                  direction="column"
                  gap={2}
                >
                  {/* Yuboruvchi ma'lumoti */}
                  <Flex 
                    align="center" 
                    gap={2} 
                    alignSelf={isAdminMessage ? "flex-end" : "flex-start"}
                  >
                    {!isAdminMessage && (
                      <Avatar
                        name={senderName}
                        src={avatarUrl || undefined}
                        size="xs"
                        bg={avatarBg}
                        color="white"
                      />
                    )}
                    <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                      {senderName}
                      {username && (
                        <Text as="span" fontWeight="normal" color="gray.500" ml={1}>
                          @{username}
                        </Text>
                      )}
                    </Text>
                    {isAdminMessage && (
                      <Avatar
                        name={senderName}
                        size="xs"
                        bg={avatarBg}
                        color="white"
                      />
                    )}
                  </Flex>

                  {/* Xabar matni */}
                  <Box
                    bg={isAdminMessage ? "blue.500" : "white"}
                    color={isAdminMessage ? "white" : "black"}
                    p={4}
                    borderRadius="lg"
                    boxShadow="md"
                  >
                    <Text>{msg.content}</Text>
                    {msg.file_url && (
                      <HStack mt={2}>
                        <Paperclip size={16} />
                        <Text fontSize="sm" color={isAdminMessage ? "blue.100" : "blue.600"}>
                          Fayl: {msg.file_url.split('/').pop()}
                        </Text>
                      </HStack>
                    )}
                  </Box>

                  {/* Vaqt va status */}
                  <HStack mt={1} alignSelf={isAdminMessage ? "flex-end" : "flex-start"}>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(msg.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                    {msg.is_read && isAdminMessage && (
                      <Badge ml={2} colorScheme="green" fontSize="xs">
                        O'qildi
                      </Badge>
                    )}
                  </HStack>
                </Flex>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Xabar yozish */}
      <Card mt={4}>
        <CardBody>
          <InputGroup>
            <Input
              placeholder="Xabar yozing..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !sending && handleSendMessage()}
              disabled={sending}
            />
            <InputRightElement width="4.5rem">
              <HStack>
                <IconButton icon={<Paperclip size={18} />} variant="ghost" aria-label="Fayl" />
                <IconButton
                  icon={<Send size={18} />}
                  colorScheme="blue"
                  onClick={handleSendMessage}
                  isLoading={sending}
                  aria-label="Yuborish"
                />
              </HStack>
            </InputRightElement>
          </InputGroup>
        </CardBody>
      </Card>
    </Box>
  );
}