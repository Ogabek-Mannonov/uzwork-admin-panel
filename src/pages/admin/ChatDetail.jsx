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
  Progress,
  Tooltip,
} from "@chakra-ui/react";
import { ArrowLeft, Send, Paperclip, AlertTriangle, Mic, Square, Play, Pause } from "lucide-react";
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

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Audio playback states
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRefs = useRef({});

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

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Yozish boshlandi",
        description: "Ovozli xabar yozilmoqda...",
        status: "info",
        duration: 2000,
      });
    } catch (error) {
      console.error("Mikrofon xatosi:", error);
      toast({
        title: "Xato",
        description: "Mikrofondan foydalanib bo'lmadi",
        status: "error",
        duration: 3000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      setRecordingTime(0);
      clearInterval(timerRef.current);
      
      toast({
        title: "Bekor qilindi",
        description: "Ovozli xabar bekor qilindi",
        status: "warning",
        duration: 2000,
      });
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    setSending(true);
    try {
      // FormData yaratish
      const formData = new FormData();
      formData.append('voice', audioBlob, 'voice-message.webm');

      // File upload endpoint
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/upload/voice`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // ✅ Token qaytarildi
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.message || 'Upload xatosi');
      }

      const uploadData = await uploadRes.json();
      const voiceUrl = uploadData.data.url;

      // Voice message yuborish
      const res = await api.post(`/messages/${chatId}/voice`, {
        voice_url: voiceUrl,
      });

      const sentMessage = res.data?.message || res.message;
      if (sentMessage) {
        setMessages((prev) => [...prev, sentMessage]);
      }

      // Reset
      setAudioBlob(null);
      setRecordingTime(0);
      scrollToBottom();

      toast({
        title: "Yuborildi",
        description: "Ovozli xabar yuborildi",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      console.error("Voice xabar yuborish xatosi:", err);
      toast({
        title: "Xato",
        description: err.message || "Ovozli xabar yuborilmadi",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSending(false);
    }
  };

  const toggleAudioPlayback = (messageId, audioUrl) => {
    // URL ni to'g'rilash
    let fullAudioUrl = audioUrl;
    
    // Agar relative URL bo'lsa, to'liq URL ga aylantirish
    if (audioUrl && !audioUrl.startsWith('http')) {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      fullAudioUrl = `${baseURL}${audioUrl}`;
    }

    console.log('🎵 Playing audio:', fullAudioUrl);

    const audio = audioRefs.current[messageId];

    if (!audio) {
      const newAudio = new Audio(fullAudioUrl);
      audioRefs.current[messageId] = newAudio;
      
      newAudio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        console.error('Audio URL:', fullAudioUrl);
        toast({
          title: "Xato",
          description: "Audio faylni yuklab bo'lmadi",
          status: "error",
          duration: 3000,
        });
      };

      newAudio.onended = () => {
        setPlayingAudioId(null);
      };

      newAudio.play().catch(err => {
        console.error('Play error:', err);
        toast({
          title: "Xato",
          description: "Audio ni ijro etib bo'lmadi",
          status: "error",
          duration: 3000,
        });
      });
      setPlayingAudioId(messageId);
    } else {
      if (playingAudioId === messageId) {
        audio.pause();
        setPlayingAudioId(null);
      } else {
        audio.play().catch(err => {
          console.error('Play error:', err);
        });
        setPlayingAudioId(messageId);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
                    {/* Text xabar */}
                    {msg.type === 'text' && <Text>{msg.content}</Text>}
                    
                    {/* Voice xabar */}
                    {msg.type === 'voice' && msg.file_url && (
                      <HStack spacing={3}>
                        <IconButton
                          icon={playingAudioId === msg.id ? <Pause size={18} /> : <Play size={18} />}
                          size="sm"
                          colorScheme={isAdminMessage ? "whiteAlpha" : "blue"}
                          onClick={() => toggleAudioPlayback(msg.id, msg.file_url)}
                          aria-label="Play/Pause"
                        />
                        <Text fontSize="sm">Ovozli xabar</Text>
                      </HStack>
                    )}

                    {/* File xabar */}
                    {msg.type === 'file' && msg.file_url && (
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
          {/* Agar recording bo'lsa */}
          {isRecording && (
            <VStack spacing={3} mb={4}>
              <HStack justify="space-between" w="full">
                <HStack>
                  <Box w={3} h={3} bg="red.500" borderRadius="full" animation="pulse 1.5s infinite" />
                  <Text fontWeight="medium">Yozilmoqda...</Text>
                </HStack>
                <Text fontWeight="bold" color="red.500">{formatTime(recordingTime)}</Text>
              </HStack>
              <Progress value={(recordingTime / 60) * 100} w="full" colorScheme="red" size="sm" />
              <HStack spacing={2}>
                <Button colorScheme="red" size="sm" onClick={cancelRecording}>
                  Bekor qilish
                </Button>
                <Button colorScheme="green" size="sm" onClick={stopRecording}>
                  To'xtatish
                </Button>
              </HStack>
            </VStack>
          )}

          {/* Agar audio blob bor bo'lsa (preview) */}
          {audioBlob && !isRecording && (
            <HStack spacing={3} mb={4} p={3} bg="gray.50" borderRadius="md">
              <IconButton
                icon={<Play size={18} />}
                size="sm"
                colorScheme="blue"
                onClick={() => {
                  const audio = new Audio(URL.createObjectURL(audioBlob));
                  audio.play();
                }}
                aria-label="Preview"
              />
              <Text flex={1}>Ovozli xabar ({formatTime(recordingTime)})</Text>
              <Button size="sm" colorScheme="red" variant="ghost" onClick={() => setAudioBlob(null)}>
                O'chirish
              </Button>
              <Button size="sm" colorScheme="blue" onClick={sendVoiceMessage} isLoading={sending}>
                Yuborish
              </Button>
            </HStack>
          )}

          {/* Text input */}
          {!isRecording && !audioBlob && (
            <InputGroup>
              <Input
                placeholder="Xabar yozing..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !sending && handleSendMessage()}
                disabled={sending}
              />
              <InputRightElement width="6rem">
                <HStack spacing={1}>
                  <Tooltip label="Fayl yuklash">
                    <IconButton 
                      icon={<Paperclip size={18} />} 
                      variant="ghost" 
                      size="sm"
                      aria-label="Fayl" 
                    />
                  </Tooltip>
                  <Tooltip label="Ovozli xabar">
                    <IconButton
                      icon={<Mic size={18} />}
                      variant="ghost"
                      size="sm"
                      colorScheme="red"
                      onClick={startRecording}
                      aria-label="Voice"
                    />
                  </Tooltip>
                  <IconButton
                    icon={<Send size={18} />}
                    colorScheme="blue"
                    size="sm"
                    onClick={handleSendMessage}
                    isLoading={sending}
                    aria-label="Yuborish"
                  />
                </HStack>
              </InputRightElement>
            </InputGroup>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}