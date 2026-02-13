// src/pages/admin/ChatDetail.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Button,
  Box,
  Heading,
  Text,
  Flex,
  Avatar,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Divider,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Mic,
  Play,
  Pause,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Download,
  ExternalLink,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import socket from "../../utils/socket";

/* ================= THEME (Telegram style - compact & modern) ================= */
const HEADER_CARD = {
  bg: "rgba(10, 18, 38, 0.52)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.08)",
  borderRadius: "xl",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  backdropFilter: "blur(10px)",
  overflow: "hidden",
};

const MESSAGES_CARD = {
  bg: "rgba(10, 18, 38, 0.45)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.06)",
  borderRadius: "lg",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  backdropFilter: "blur(8px)",
  overflow: "hidden",
};

const COMPOSER_CARD = {
  bg: "rgba(10, 18, 38, 0.48)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.08)",
  borderRadius: "xl",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  backdropFilter: "blur(10px)",
  overflow: "hidden",
};

const SHINE_OVERLAY = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  bgGradient: "linear(to-b, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
};

const btnGhost = {
  h: "36px",
  borderRadius: "lg",
  bg: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(255,255,255,0.08)" },
  fontSize: "sm",
};

const inputDark = {
  h: "40px",
  borderRadius: "lg",
  bg: "rgba(255,255,255,0.05)",
  borderColor: "rgba(255,255,255,0.10)",
  color: "whiteAlpha.900",
  fontSize: "sm",
  _placeholder: { color: "whiteAlpha.500" },
  _hover: { borderColor: "rgba(255,255,255,0.15)" },
  _focus: {
    borderColor: "rgba(66,153,225,0.8)",
    boxShadow: "0 0 0 2px rgba(66,153,225,0.15)",
  },
};

const textareaDark = {
  borderRadius: "lg",
  bg: "rgba(255,255,255,0.05)",
  borderColor: "rgba(255,255,255,0.10)",
  color: "whiteAlpha.900",
  fontSize: "sm",
  _placeholder: { color: "whiteAlpha.500" },
  _hover: { borderColor: "rgba(255,255,255,0.15)" },
  _focus: {
    borderColor: "rgba(66,153,225,0.8)",
    boxShadow: "0 0 0 2px rgba(66,153,225,0.15)",
  },
};

const adminBadgeStyle = {
  bg: "rgba(30,144,255,0.18)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(30,144,255,0.28)",
  px: 2,
  py: 0.4,
  borderRadius: "999px",
  fontSize: "9px",
  fontWeight: "700",
  letterSpacing: "0.2px",
};

export default function ChatDetail() {
  const { chatId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState({
    client: null,
    freelancer: null,
    jobTitle: "",
    jobId: null,
  });

  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

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

  // ✅ mini progress/time for voice messages
  const [audioProgress, setAudioProgress] = useState({}); // { [messageId]: currentTime }
  const [audioDuration, setAudioDuration] = useState({}); // { [messageId]: duration }

  // Edit/Delete states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } =
    useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } =
    useDisclosure();

  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    message: null,
  });

  // ✅ Dispute modal states
  const { isOpen: isDisputeOpen, onClose: onDisputeClose } = useDisclosure();
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeCreating, setDisputeCreating] = useState(false);

  // ====== Current user info / role ======
  const normalizeId = (id) => (id == null ? null : String(id));

  const currentUserId = normalizeId(localStorage.getItem("userId"));

  const roleRaw =
    localStorage.getItem("userRole") ||
    localStorage.getItem("role") ||
    localStorage.getItem("user_role") ||
    "";

  const role = String(roleRaw).toLowerCase();
  const isAdmin =
    role.includes("admin") || window.location.pathname.startsWith("/admin");

  const getSenderId = (m) =>
    normalizeId(
      m?.sender_id ??
        m?.senderId ??
        m?.user_id ??
        m?.userId ??
        m?.admin_id ??
        m?.adminId
    );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const goUserLink = (u) => (u?.id ? `/admin/users/${u.id}` : "#");

  // ✅ helper: full name + username
  const buildName = (u, fallbackRole) => {
    const fn = u?.first_name || "";
    const ln = u?.last_name || "";
    const full = `${fn} ${ln}`.trim();
    return full || fallbackRole || "User";
  };

  const buildUsername = (u, fallback) => {
    const un = (u?.username || fallback || "").toString().trim();
    return un ? `@${un}` : "";
  };

  useEffect(() => {
    socket.connect();
    socket.emit("joinChat", chatId);

    const fetchData = async () => {
      try {
        const res = await api(`/messages/${chatId}`);
        const payload = res?.data ?? res;

        // ✅ universal root (ba'zida data ichida keladi)
        const root = payload?.data ?? payload;

        // messages normalize
        let fetchedMessages = [];
        if (root?.messages) fetchedMessages = root.messages;
        else if (root?.data?.messages) fetchedMessages = root.data.messages;
        else if (Array.isArray(root)) fetchedMessages = root;

        setMessages(fetchedMessages || []);

        // ✅ participants from backend
        const clientData = root?.client || root?.data?.client || null;
        const freelancerData = root?.freelancer || root?.data?.freelancer || null;

        // ✅ job
        const jobTitle = root?.job?.title || root?.data?.job?.title || "";
        const jobId = root?.job?.id || root?.data?.job?.id || null;

        setChatInfo({
          client: clientData,
          freelancer: freelancerData,
          jobTitle,
          jobId,
        });
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
        setMessages((prev) => {
          const newMsgId = normalizeId(newMsg.id);
          const exists = prev.some((msg) => normalizeId(msg.id) === newMsgId);
          if (exists) return prev;
          return [...prev, newMsg];
        });
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

    socket.on("messageEdited", ({ messageId, content, updated_at }) => {
      const editedId = normalizeId(messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          normalizeId(msg.id) === editedId
            ? { ...msg, content, is_edited: true, updated_at }
            : msg
        )
      );
    });

    socket.on("messageDeleted", ({ messageId }) => {
      const deleteId = normalizeId(messageId);
      setMessages((prev) => prev.filter((msg) => normalizeId(msg.id) !== deleteId));
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagesRead");
      socket.off("messageEdited");
      socket.off("messageDeleted");
      socket.disconnect();

      // ✅ stop all audios on unmount
      try {
        Object.values(audioRefs.current || {}).forEach((a) => {
          try {
            a.pause();
            a.currentTime = 0;
          } catch (e) {
            console.error("Error pausing audio:", e);
          }
        });
      } catch (e) {
        console.error("Error stopping audio refs:", e);
      }
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

      const payload = res?.data ?? res;
      const sentMessage = payload?.data?.message || payload?.message;

      if (sentMessage) {
        setMessages((prev) => {
          const sentId = normalizeId(sentMessage.id);
          const exists = prev.some((msg) => normalizeId(msg.id) === sentId);
          if (exists) return prev;
          return [...prev, sentMessage];
        });
      }

      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Xabar yuborish xatosi:", err);
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "Xabar yuborilmadi",
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
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
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
      const formData = new FormData();
      formData.append("voice", audioBlob, "voice-message.webm");

      const uploadRes = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/upload/voice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.message || "Upload xatosi");
      }

      const uploadData = await uploadRes.json();
      const voiceUrl = uploadData.data.url;

      const res = await api.post(`/messages/${chatId}/voice`, {
        voice_url: voiceUrl,
      });

      const payload = res?.data ?? res;
      const sentMessage = payload?.message || payload?.data?.message;

      if (sentMessage) {
        setMessages((prev) => {
          const sentId = normalizeId(sentMessage.id);
          const exists = prev.some((msg) => normalizeId(msg.id) === sentId);
          if (exists) return prev;
          return [...prev, sentMessage];
        });
      }

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

  // ✅ improved audio playback with progress/time
  const toggleAudioPlayback = (messageId, audioUrl) => {
    let fullAudioUrl = audioUrl;

    if (audioUrl && !String(audioUrl).startsWith("http")) {
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      fullAudioUrl = `${baseURL}${audioUrl}`;
    }

    // stop currently playing if different
    if (playingAudioId && playingAudioId !== messageId) {
      const prevAudio = audioRefs.current[playingAudioId];
      if (prevAudio) {
        try {
          prevAudio.pause();
        } catch (e) {
          console.error("Error pausing previous audio:", e);
        }
      }
    }

    const existing = audioRefs.current[messageId];

    if (!existing) {
      const newAudio = new Audio(fullAudioUrl);
      audioRefs.current[messageId] = newAudio;

      newAudio.onerror = (e) => {
        console.error("❌ Audio playback error:", e);
        toast({
          title: "Xato",
          description: "Audio faylni yuklab bo'lmadi",
          status: "error",
          duration: 3000,
        });
      };

      newAudio.onloadedmetadata = () => {
        setAudioDuration((prev) => ({
          ...prev,
          [messageId]: Number.isFinite(newAudio.duration) ? newAudio.duration : 0,
        }));
      };

      newAudio.ontimeupdate = () => {
        setAudioProgress((prev) => ({
          ...prev,
          [messageId]: newAudio.currentTime || 0,
        }));
      };

      newAudio.onended = () => {
        setPlayingAudioId(null);
        setAudioProgress((prev) => ({ ...prev, [messageId]: 0 }));
      };

      newAudio.play().catch((err) => console.error("Play error:", err));
      setPlayingAudioId(messageId);
      return;
    }

    if (playingAudioId === messageId) {
      try {
        existing.pause();
      } catch (e) {
        console.error("Pause error:", e);
      }
      setPlayingAudioId(null);
    } else {
      existing.play().catch((err) => console.error("Play error:", err));
      setPlayingAudioId(messageId);
    }
  };

  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ====== Edit/Delete permissions ======
  const canEditDelete = (message) => {
    if (!message) return false;
    if (isAdmin) return true;
    return getSenderId(message) === currentUserId;
  };

  const handleEditClick = (message) => {
    setSelectedMessage(message);
    setEditingContent(message.content || "");
    onEditOpen();
  };

  const handleEditSubmit = async () => {
    if (!editingContent.trim() || !selectedMessage) return;

    try {
      await api.put(`/messages/${selectedMessage.id}`, {
        content: editingContent.trim(),
      });

      setMessages((prev) =>
        prev.map((msg) =>
          normalizeId(msg.id) === normalizeId(selectedMessage.id)
            ? { ...msg, content: editingContent.trim(), is_edited: true }
            : msg
        )
      );

      toast({
        title: "O'zgartirildi",
        description: "Xabar muvaffaqiyatli o'zgartirildi",
        status: "success",
        duration: 2000,
      });

      onEditClose();
    } catch (error) {
      console.error("Edit error:", error);
      toast({
        title: "Xato",
        description: "Xabarni o'zgartirib bo'lmadi",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteClick = (message) => {
    setSelectedMessage(message);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMessage) return;

    try {
      await api.delete(`/messages/${selectedMessage.id}`);

      const deleteId = normalizeId(selectedMessage.id);
      setMessages((prev) => prev.filter((msg) => normalizeId(msg.id) !== deleteId));

      toast({
        title: "O'chirildi",
        description: "Xabar o'chirildi",
        status: "success",
        duration: 2000,
      });

      onDeleteClose();
      setSelectedMessage(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Xato",
        description: "Xabarni o'chirib bo'lmadi",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(String(content || ""));
    toast({
      title: "Nusxalandi",
      description: "Xabar nusxalandi",
      status: "info",
      duration: 1500,
    });
  };

  const openContextMenu = (event, message) => {
    event.preventDefault();
    setContextMenu({
      isOpen: true,
      x: event.clientX,
      y: event.clientY,
      message,
    });
  };

  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, isOpen: false, message: null }));
  };

  // Hide soft-deleted / empty text
  const visibleMessages = useMemo(() => {
    return (messages || []).filter((m) => {
      const isSoftDeleted = m?.is_deleted === true || !!m?.deleted_at;
      const isEmptyText = m?.type === "text" && !String(m?.content ?? "").trim();
      return !(isSoftDeleted || isEmptyText);
    });
  }, [messages]);

  // ✅ CREATE DISPUTE
  const createDispute = async () => {
    if (!disputeReason.trim()) {
      toast({
        title: "Sabab kiriting",
        description: "Dispute ochish uchun reason majburiy",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    try {
      setDisputeCreating(true);

      const res = await api.post("/disputes", {
        chat_id: chatId,
        reason: disputeReason.trim(),
        evidence_files: [],
      });

      const payload = res?.data ?? res;
      const dispute = payload?.data?.dispute || payload?.dispute;

      toast({
        title: "Dispute ochildi",
        description: "Nizo yaratildi",
        status: "success",
        duration: 2000,
      });

      onDisputeClose();
      setDisputeReason("");

      if (dispute?.id) navigate(`/admin/disputes/${dispute.id}`);
    } catch (e) {
      console.error("createDispute error:", e);

      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Dispute ochishda xato";

      toast({
        title: "Xato",
        description: msg,
        status: "error",
        duration: 3500,
      });
    } finally {
      setDisputeCreating(false);
    }
  };

  // ✅ file open/download helpers
  const buildFileUrl = (url) => {
    if (!url) return "";
    const s = String(url);
    if (s.startsWith("http")) return s;
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${baseURL}${s}`;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="lg" color="blue.300" thickness="3px" />
        <Text ml={4} color="gray.500" fontSize="sm">
          Chat yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  const clientLine = chatInfo.client
    ? `${buildName(chatInfo.client, "Client")} ${buildUsername(chatInfo.client, "client")}`.trim()
    : "Client ?";
  const freelancerLine = chatInfo.freelancer
    ? `${buildName(chatInfo.freelancer, "Freelancer")} ${buildUsername(chatInfo.freelancer, "freelancer")}`.trim()
    : "Freelancer ?";

  return (
    <Box
      w="full"
      h="calc(100vh - 90px)"
      display="flex"
      flexDirection="column"
      px={{ base: 2, md: 3, lg: 4 }}
      pb={{ base: 2, md: 3, lg: 4 }}
      gap={{ base: 2, md: 3 }}
      onClick={closeContextMenu}
      bg="rgba(5,10,20,0.3)"
    >
      {/* ================= HEADER ================= */}
      <Box {...HEADER_CARD} position="sticky" top="0" zIndex={5} w="full">
        <Box {...SHINE_OVERLAY} />
        <Box position="relative" p={{ base: 3, md: 4 }}>
          <Flex align="start" justify="space-between" gap={3} wrap="wrap">
            <HStack spacing={2} align="start" flex="1" minW="0">
              <Link to="/admin/chats">
                <IconButton
                  aria-label="Back"
                  icon={<ArrowLeft size={18} />}
                  {...btnGhost}
                  size="sm"
                />
              </Link>

              <Box flex="1" minW="0">
                <Heading
                  size="sm"
                  color="whiteAlpha.900"
                  lineHeight="1.3"
                  noOfLines={1}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {chatInfo.jobTitle?.trim()
                    ? chatInfo.jobTitle
                    : chatInfo.jobId
                    ? `Job #${String(chatInfo.jobId).slice(0, 8)}`
                    : "Chat"}
                </Heading>

                {/* ✅ Title ostida Client • Freelancer */}
                <Text fontSize="11px" color="whiteAlpha.700" mt={1} noOfLines={1}>
                  {clientLine} {"  •  "} {freelancerLine}
                </Text>

                <Text fontSize="11px" color="whiteAlpha.600" mt={0.5} noOfLines={1}>
                  Chat #{chatId.slice(0, 8)}...
                </Text>

                <HStack spacing={3} mt={2} wrap="wrap" fontSize="xs">
                  {/* Client */}
                  {chatInfo.client && (
                    <Flex
                      as={chatInfo.client?.id ? Link : "div"}
                      to={chatInfo.client?.id ? goUserLink(chatInfo.client) : undefined}
                      align="center"
                      gap={1.5}
                      cursor={chatInfo.client?.id ? "pointer" : "default"}
                      _hover={chatInfo.client?.id ? { opacity: 0.85 } : undefined}
                    >
                      <Avatar
                        name={buildName(chatInfo.client, "C")}
                        src={chatInfo.client.avatar_url || undefined}
                        size="xs"
                        bg="rgba(255,0,80,0.35)"
                        color="white"
                      />
                      <Box minW="0">
                        <Text fontWeight="600" color="whiteAlpha.900" noOfLines={1}>
                          {buildName(chatInfo.client, "Client")}
                        </Text>
                        <Text color="whiteAlpha.600" fontSize="10px" noOfLines={1}>
                          {buildUsername(chatInfo.client, "client")}
                        </Text>
                      </Box>
                    </Flex>
                  )}

                  {/* Freelancer */}
                  {chatInfo.freelancer && (
                    <Flex
                      as={chatInfo.freelancer?.id ? Link : "div"}
                      to={chatInfo.freelancer?.id ? goUserLink(chatInfo.freelancer) : undefined}
                      align="center"
                      gap={1.5}
                      cursor={chatInfo.freelancer?.id ? "pointer" : "default"}
                      _hover={chatInfo.freelancer?.id ? { opacity: 0.85 } : undefined}
                    >
                      <Avatar
                        name={buildName(chatInfo.freelancer, "F")}
                        src={chatInfo.freelancer.avatar_url || undefined}
                        size="xs"
                        bg="rgba(255,170,0,0.35)"
                        color="white"
                      />
                      <Box minW="0">
                        <Text fontWeight="600" color="whiteAlpha.900" noOfLines={1}>
                          {buildName(chatInfo.freelancer, "Freelancer")}
                        </Text>
                        <Text color="whiteAlpha.600" fontSize="10px" noOfLines={1}>
                          {buildUsername(chatInfo.freelancer, "freelancer")}
                        </Text>
                      </Box>
                    </Flex>
                  )}
                </HStack>
              </Box>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* ================= MESSAGES AREA ================= */}
      <Box
        {...MESSAGES_CARD}
        flex="1"
        position="relative"
        w="full"
        minH="0"
        display="flex"
        flexDirection="column"
      >
        <Box {...SHINE_OVERLAY} />
        <Box
          position="relative"
          flex="1"
          overflowY="auto"
          px={{ base: 2, md: 4 }}
          py={{ base: 2, md: 3 }}
          display="flex"
          flexDirection="column"
          gap={{ base: 2, md: 2.5 }}
          css={{
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "rgba(255,255,255,0.02)" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255,255,255,0.10)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(255,255,255,0.15)",
            },
          }}
        >
          {visibleMessages.length === 0 ? (
            <Flex align="center" justify="center" h="full">
              <Text textAlign="center" color="whiteAlpha.500" fontSize="sm">
                Hozircha xabarlar yo'q
              </Text>
            </Flex>
          ) : (
            visibleMessages.map((msg) => {
              let sender = null;
              let senderName = "Unknown";
              let avatarBg = "gray.500";
              let username = "";

              // ✅ sender info: admin yoki client/freelancer
              if (msg.sender_role === "admin") {
                senderName = "Admin";
                avatarBg = "blue.500";
              } else if (
                msg.sender_role === "client" ||
                normalizeId(msg.sender_id) === normalizeId(chatInfo.client?.id)
              ) {
                sender = chatInfo.client;
                senderName = sender
                  ? buildName(sender, "Client")
                  : `${String(msg.sender_first_name || "").trim()} ${String(
                      msg.sender_last_name || ""
                    ).trim()}`.trim() || "Client";
                username = sender
                  ? buildUsername(sender, msg.sender_username)
                  : buildUsername(null, msg.sender_username);
                avatarBg = "rgba(255,0,80,0.35)";
              } else if (
                msg.sender_role === "freelancer" ||
                normalizeId(msg.sender_id) === normalizeId(chatInfo.freelancer?.id)
              ) {
                sender = chatInfo.freelancer;
                senderName = sender
                  ? buildName(sender, "Freelancer")
                  : `${String(msg.sender_first_name || "").trim()} ${String(
                      msg.sender_last_name || ""
                    ).trim()}`.trim() || "Freelancer";
                username = sender
                  ? buildUsername(sender, msg.sender_username)
                  : buildUsername(null, msg.sender_username);
                avatarBg = "rgba(255,170,0,0.35)";
              } else {
                // fallback (history'larda ham ishlaydi)
                senderName =
                  `${String(msg.sender_first_name || "").trim()} ${String(
                    msg.sender_last_name || ""
                  ).trim()}`.trim() || "User";
                username = buildUsername(null, msg.sender_username);
              }

              const isAdminMessage = msg.sender_role === "admin";
              const canEdit = msg.type === "text" && canEditDelete(msg);
              const canDelete = canEditDelete(msg);

              const senderUserId =
                msg.sender_role === "client"
                  ? chatInfo.client?.id
                  : msg.sender_role === "freelancer"
                  ? chatInfo.freelancer?.id
                  : null;

              const senderProfileLink = senderUserId
                ? `/admin/users/${senderUserId}`
                : "#";

              const bubbleMaxW = { base: "85%", md: "70%", lg: "55%" };

              const bubbleBg = isAdminMessage
                ? "linear-gradient(135deg, rgba(30,144,255,0.28), rgba(30,144,255,0.14))"
                : "rgba(255,255,255,0.06)";

              const bubbleBorder = isAdminMessage
                ? "rgba(30,144,255,0.28)"
                : "rgba(255,255,255,0.10)";

              const bubbleShadow = "0 4px 12px rgba(0,0,0,0.20)";

              const cur = audioProgress[msg.id] || 0;
              const dur = audioDuration[msg.id] || 0;
              const pct = dur > 0 ? (cur / dur) * 100 : 0;

              const fileUrl = msg.file_url ? buildFileUrl(msg.file_url) : "";

              return (
                <Flex
                  key={normalizeId(msg.id)}
                  align="flex-start"
                  justify={isAdminMessage ? "flex-end" : "flex-start"}
                  gap={1.5}
                >
                  {!isAdminMessage && (
                    <Avatar
                      name={senderName}
                      size="xs"
                      bg={avatarBg}
                      color="white"
                      flexShrink={0}
                      mt={0.5}
                    />
                  )}

                  <Box
                    maxW={bubbleMaxW}
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    role="group"
                  >
                    {/* ✅ Sender info (name + username) */}
                    <Flex
                      as={!isAdminMessage && senderUserId ? Link : "div"}
                      to={!isAdminMessage && senderUserId ? senderProfileLink : undefined}
                      align="center"
                      gap={1}
                      alignSelf={isAdminMessage ? "flex-end" : "flex-start"}
                      cursor={!isAdminMessage && senderUserId ? "pointer" : "default"}
                      _hover={!isAdminMessage && senderUserId ? { opacity: 0.88 } : undefined}
                      px={isAdminMessage ? 0 : 2}
                      fontSize="11px"
                    >
                      <Text fontWeight="700" color="whiteAlpha.800">
                        {senderName}
                      </Text>
                      {username && (
                        <Text color="whiteAlpha.600" fontSize="10px">
                          {username}
                        </Text>
                      )}
                      {isAdminMessage && <Badge {...adminBadgeStyle}>ADMIN</Badge>}
                    </Flex>

                    {/* Message bubble */}
                    <Box position="relative" onContextMenu={(e) => openContextMenu(e, msg)}>
                      <Box
                        bgGradient={isAdminMessage ? bubbleBg : undefined}
                        bg={!isAdminMessage ? bubbleBg : undefined}
                        border="1px solid"
                        borderColor={bubbleBorder}
                        color="whiteAlpha.900"
                        p={{ base: 2.5, md: 3 }}
                        borderRadius={{ base: "16px", md: "18px" }}
                        boxShadow={bubbleShadow}
                        position="relative"
                        fontSize={{ base: "13px", md: "14px" }}
                      >
                        {/* 3-dot menu */}
                        {(canEdit || canDelete) && (
                          <Box
                            position="absolute"
                            top="6px"
                            right="8px"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            transition="opacity 0.15s ease"
                            zIndex={5}
                          >
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<MoreVertical size={14} />}
                                size="xs"
                                variant="ghost"
                                aria-label="Options"
                                bg="rgba(0,0,0,0.18)"
                                border="1px solid rgba(255,255,255,0.10)"
                                color="whiteAlpha.900"
                                h="28px"
                                w="28px"
                                minW="28px"
                                _hover={{ bg: "rgba(0,0,0,0.28)" }}
                              />
                              <MenuList
                                bg="rgba(10,18,38,0.95)"
                                border="1px solid rgba(255,255,255,0.10)"
                                color="whiteAlpha.900"
                                fontSize="sm"
                              >
                                {msg.type === "text" && (
                                  <MenuItem
                                    icon={<Copy size={14} />}
                                    bg="transparent"
                                    _hover={{ bg: "rgba(255,255,255,0.06)" }}
                                    onClick={() => handleCopyMessage(msg.content)}
                                  >
                                    Nusxalash
                                  </MenuItem>
                                )}
                                {canEdit && (
                                  <MenuItem
                                    icon={<Edit2 size={14} />}
                                    bg="transparent"
                                    _hover={{ bg: "rgba(255,255,255,0.06)" }}
                                    onClick={() => handleEditClick(msg)}
                                  >
                                    Tahrirlash
                                  </MenuItem>
                                )}
                                {canDelete && (
                                  <MenuItem
                                    icon={<Trash2 size={14} />}
                                    bg="transparent"
                                    color="red.300"
                                    _hover={{ bg: "rgba(255,0,80,0.12)" }}
                                    onClick={() => handleDeleteClick(msg)}
                                  >
                                    O'chirish
                                  </MenuItem>
                                )}
                              </MenuList>
                            </Menu>
                          </Box>
                        )}

                        {/* TEXT MESSAGE */}
                        {msg.type === "text" && (
                          <Box pr={8}>
                            <Text whiteSpace="pre-wrap" lineHeight="1.5">
                              {msg.content}
                            </Text>
                            {msg.is_edited && (
                              <Text fontSize="10px" color="whiteAlpha.600" mt={1}>
                                (tahrirlangan)
                              </Text>
                            )}
                          </Box>
                        )}

                        {/* VOICE MESSAGE */}
                        {msg.type === "voice" && msg.file_url && (
                          <Box pr={8}>
                            <HStack spacing={2} align="center">
                              <IconButton
                                icon={
                                  playingAudioId === msg.id ? (
                                    <Pause size={16} />
                                  ) : (
                                    <Play size={16} />
                                  )
                                }
                                size="xs"
                                aria-label="Play/Pause"
                                bg="rgba(255,255,255,0.10)"
                                border="1px solid rgba(255,255,255,0.12)"
                                _hover={{ bg: "rgba(255,255,255,0.14)" }}
                                onClick={() => toggleAudioPlayback(msg.id, msg.file_url)}
                                h="32px"
                                w="32px"
                                minW="32px"
                              />
                              <Box flex="1" minW="0">
                                <HStack justify="space-between" mb={1}>
                                  <Text fontSize="12px" fontWeight="600">
                                    Ovozli
                                  </Text>
                                  <Text fontSize="10px" color="whiteAlpha.700">
                                    {formatTime(cur)} / {formatTime(dur)}
                                  </Text>
                                </HStack>
                                <Progress
                                  value={pct}
                                  size="xs"
                                  borderRadius="full"
                                  bg="rgba(255,255,255,0.10)"
                                  colorScheme="blue"
                                  h="3px"
                                />
                              </Box>
                            </HStack>
                          </Box>
                        )}

                        {/* FILE MESSAGE */}
                        {msg.type === "file" && msg.file_url && (
                          <Box pr={8}>
                            <HStack spacing={2} align="center">
                              <Box
                                w="32px"
                                h="32px"
                                borderRadius="10px"
                                bg="rgba(255,255,255,0.10)"
                                border="1px solid rgba(255,255,255,0.12)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                              >
                                <Paperclip size={14} />
                              </Box>

                              <Box flex="1" minW="0">
                                <Text fontSize="12px" fontWeight="600" noOfLines={1}>
                                  {String(msg.file_url).split("/").pop()}
                                </Text>
                                <Text fontSize="10px" color="whiteAlpha.700">
                                  Fayl
                                </Text>
                              </Box>

                              <HStack spacing={1} flexShrink={0}>
                                <Tooltip label="Open" fontSize="xs">
                                  <IconButton
                                    as="a"
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    icon={<ExternalLink size={14} />}
                                    size="xs"
                                    aria-label="Open"
                                    bg="rgba(255,255,255,0.10)"
                                    border="1px solid rgba(255,255,255,0.12)"
                                    _hover={{ bg: "rgba(255,255,255,0.14)" }}
                                    h="28px"
                                    w="28px"
                                    minW="28px"
                                  />
                                </Tooltip>

                                <Tooltip label="Download" fontSize="xs">
                                  <IconButton
                                    as="a"
                                    href={fileUrl}
                                    download
                                    icon={<Download size={14} />}
                                    size="xs"
                                    aria-label="Download"
                                    bg="rgba(255,255,255,0.10)"
                                    border="1px solid rgba(255,255,255,0.12)"
                                    _hover={{ bg: "rgba(255,255,255,0.14)" }}
                                    h="28px"
                                    w="28px"
                                    minW="28px"
                                  />
                                </Tooltip>
                              </HStack>
                            </HStack>
                          </Box>
                        )}

                        <Divider mt={2} mb={1.5} borderColor="rgba(255,255,255,0.05)" />

                        <HStack justify="space-between" fontSize="10px" color="whiteAlpha.600">
                          <Text>
                            {new Date(msg.created_at).toLocaleString("uz-UZ", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </Text>

                          {msg.is_read && isAdminMessage && (
                            <Badge
                              bg="rgba(0,220,130,0.12)"
                              border="1px solid rgba(0,220,130,0.20)"
                              color="whiteAlpha.900"
                              borderRadius="999px"
                              px={2}
                              py={0.3}
                              fontSize="9px"
                              fontWeight="700"
                            >
                              O'qildi
                            </Badge>
                          )}
                        </HStack>
                      </Box>
                    </Box>
                  </Box>

                  {isAdminMessage && (
                    <Avatar
                      name="Admin"
                      size="xs"
                      bg="rgba(30,144,255,0.40)"
                      color="white"
                      flexShrink={0}
                      mt={0.5}
                    />
                  )}
                </Flex>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* ================= COMPOSER ================= */}
      <Box {...COMPOSER_CARD} w="full">
        <Box {...SHINE_OVERLAY} />
        <Box position="relative" p={{ base: 2.5, md: 3 }}>
          {isRecording && (
            <VStack spacing={2} mb={3}>
              <HStack justify="space-between" w="full" fontSize="sm">
                <HStack>
                  <Box
                    w={2.5}
                    h={2.5}
                    bg="red.400"
                    borderRadius="full"
                    animation="pulse 1s infinite"
                  />
                  <Text fontWeight="600" color="whiteAlpha.900">
                    Yozilmoqda...
                  </Text>
                </HStack>
                <Text fontWeight="bold" color="red.300" fontSize="sm">
                  {formatTime(recordingTime)}
                </Text>
              </HStack>
              <Progress
                value={(recordingTime / 60) * 100}
                w="full"
                colorScheme="red"
                size="xs"
                borderRadius="full"
                h="2px"
              />
              <HStack spacing={2} w="full" flexDir={{ base: "column", sm: "row" }}>
                <Button
                  w="full"
                  h="36px"
                  colorScheme="red"
                  variant="outline"
                  onClick={cancelRecording}
                  fontSize="sm"
                >
                  Bekor qilish
                </Button>
                <Button
                  w="full"
                  h="36px"
                  colorScheme="green"
                  onClick={stopRecording}
                  fontSize="sm"
                >
                  To'xtatish
                </Button>
              </HStack>
            </VStack>
          )}

          {audioBlob && !isRecording && (
            <HStack
              spacing={2}
              mb={3}
              p={2.5}
              bg="rgba(255,255,255,0.05)"
              border="1px solid rgba(255,255,255,0.08)"
              borderRadius="lg"
              flexWrap="wrap"
              fontSize="sm"
            >
              <IconButton
                icon={<Play size={16} />}
                size="xs"
                aria-label="Preview"
                bg="rgba(255,255,255,0.08)"
                border="1px solid rgba(255,255,255,0.10)"
                _hover={{ bg: "rgba(255,255,255,0.12)" }}
                onClick={() => {
                  const audio = new Audio(URL.createObjectURL(audioBlob));
                  audio.play();
                }}
                h="32px"
                w="32px"
                minW="32px"
              />
              <Text flex={1} color="whiteAlpha.800" minW="150px" fontSize="13px">
                Ovozli ({formatTime(recordingTime)})
              </Text>
              <Button
                size="xs"
                variant="ghost"
                color="red.200"
                onClick={() => setAudioBlob(null)}
                fontSize="xs"
              >
                O'chirish
              </Button>
              <Button
                size="xs"
                colorScheme="blue"
                onClick={sendVoiceMessage}
                isLoading={sending}
                fontSize="xs"
              >
                Yuborish
              </Button>
            </HStack>
          )}

          {!isRecording && !audioBlob && (
            <InputGroup size="sm">
              <Input
                placeholder="Xabar yozing..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !sending && handleSendMessage()}
                disabled={sending}
                {...inputDark}
              />
              <InputRightElement width="auto" pr={1}>
                <HStack spacing={0.5}>
                  <Tooltip label="Fayl" fontSize="xs">
                    <IconButton
                      icon={<Paperclip size={16} />}
                      variant="ghost"
                      size="xs"
                      aria-label="Fayl"
                      color="whiteAlpha.900"
                      _hover={{ bg: "rgba(255,255,255,0.06)" }}
                      h="32px"
                      w="32px"
                      minW="32px"
                    />
                  </Tooltip>
                  <Tooltip label="Ovoz" fontSize="xs">
                    <IconButton
                      icon={<Mic size={16} />}
                      variant="ghost"
                      size="xs"
                      color="red.200"
                      onClick={startRecording}
                      aria-label="Voice"
                      _hover={{ bg: "rgba(255,255,255,0.06)" }}
                      h="32px"
                      w="32px"
                      minW="32px"
                    />
                  </Tooltip>
                  <IconButton
                    icon={<Send size={16} />}
                    size="xs"
                    aria-label="Yuborish"
                    onClick={handleSendMessage}
                    isLoading={sending}
                    bg="rgba(30,144,255,0.22)"
                    border="1px solid rgba(30,144,255,0.28)"
                    color="whiteAlpha.900"
                    _hover={{ bg: "rgba(30,144,255,0.30)" }}
                    h="32px"
                    w="32px"
                    minW="32px"
                  />
                </HStack>
              </InputRightElement>
            </InputGroup>
          )}
        </Box>
      </Box>

      {/* ================= MODALS ================= */}
      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered size="md">
        <ModalOverlay bg="rgba(0,0,0,0.5)" />
        <ModalContent
          bg="rgba(10, 18, 38, 0.90)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          borderRadius="lg"
          boxShadow="0 12px 40px rgba(0,0,0,0.4)"
          backdropFilter="blur(10px)"
          mx={3}
        >
          <ModalHeader fontSize="md" fontWeight="700">
            Xabarni tahrirlash
          </ModalHeader>
          <ModalCloseButton size="sm" />
          <ModalBody>
            <Textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              placeholder="Yangi matn kiriting..."
              rows={4}
              {...textareaDark}
            />
          </ModalBody>
          <ModalFooter gap={2} flexDir={{ base: "column", sm: "row" }}>
            <Button w="full" {...btnGhost} onClick={onEditClose} fontSize="sm">
              Bekor qilish
            </Button>
            <Button
              w="full"
              bg="rgba(30,144,255,0.22)"
              border="1px solid rgba(30,144,255,0.28)"
              color="whiteAlpha.900"
              _hover={{ bg: "rgba(30,144,255,0.30)" }}
              onClick={handleEditSubmit}
              isDisabled={!editingContent.trim()}
              fontSize="sm"
            >
              Saqlash
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.5)" />
        <ModalContent
          bg="rgba(10, 18, 38, 0.90)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          borderRadius="lg"
          boxShadow="0 12px 40px rgba(0,0,0,0.4)"
          backdropFilter="blur(10px)"
          mx={3}
        >
          <ModalHeader fontSize="md" fontWeight="700">
            Xabarni o'chirish
          </ModalHeader>
          <ModalCloseButton size="sm" />
          <ModalBody>
            <Text color="whiteAlpha.800" fontSize="sm">
              Ushbu xabarni o'chirishni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi.
            </Text>
          </ModalBody>
          <ModalFooter gap={2} flexDir={{ base: "column", sm: "row" }}>
            <Button w="full" {...btnGhost} onClick={onDeleteClose} fontSize="sm">
              Bekor qilish
            </Button>
            <Button
              w="full"
              bg="rgba(255,0,80,0.12)"
              border="1px solid rgba(255,0,80,0.18)"
              color="whiteAlpha.900"
              _hover={{ bg: "rgba(255,0,80,0.16)" }}
              onClick={handleDeleteConfirm}
              fontSize="sm"
            >
              O'chirish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Right-click menu */}
      <Menu isOpen={contextMenu.isOpen} onClose={closeContextMenu}>
        <MenuButton as={Box} position="fixed" top={0} left={0} w={0} h={0} />
        <MenuList
          position="fixed"
          top={`${contextMenu.y}px`}
          left={`${contextMenu.x}px`}
          zIndex={2000}
          minW="160px"
          bg="rgba(10,18,38,0.95)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          fontSize="sm"
        >
          {contextMenu.message?.type === "text" && (
            <MenuItem
              icon={<Copy size={14} />}
              bg="transparent"
              _hover={{ bg: "rgba(255,255,255,0.06)" }}
              onClick={() => {
                handleCopyMessage(contextMenu.message.content);
                closeContextMenu();
              }}
            >
              Nusxalash
            </MenuItem>
          )}

          {contextMenu.message &&
            contextMenu.message.type === "text" &&
            canEditDelete(contextMenu.message) && (
              <MenuItem
                icon={<Edit2 size={14} />}
                bg="transparent"
                _hover={{ bg: "rgba(255,255,255,0.06)" }}
                onClick={() => {
                  handleEditClick(contextMenu.message);
                  closeContextMenu();
                }}
              >
                Tahrirlash
              </MenuItem>
            )}

          {contextMenu.message && canEditDelete(contextMenu.message) && (
            <MenuItem
              icon={<Trash2 size={14} />}
              bg="transparent"
              color="red.300"
              _hover={{ bg: "rgba(255,0,80,0.12)" }}
              onClick={() => {
                handleDeleteClick(contextMenu.message);
                closeContextMenu();
              }}
            >
              O'chirish
            </MenuItem>
          )}
        </MenuList>
      </Menu>

      {/* Dispute Modal */}
      <Modal isOpen={isDisputeOpen} onClose={onDisputeClose} size="md" isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.5)" />
        <ModalContent
          bg="rgba(10, 18, 38, 0.90)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          borderRadius="lg"
          boxShadow="0 12px 40px rgba(0,0,0,0.4)"
          backdropFilter="blur(10px)"
          mx={3}
        >
          <ModalHeader fontSize="md" fontWeight="700">
            Dispute ochish
          </ModalHeader>
          <ModalCloseButton size="sm" />
          <ModalBody>
            <Text fontSize="12px" color="whiteAlpha.700" mb={2}>
              Nizo sababi (reason) ni yozing:
            </Text>
            <Textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Masalan: ish bajarilmadi, deadline o'tdi, kelishuv buzildi..."
              rows={4}
              {...textareaDark}
            />
          </ModalBody>
          <ModalFooter gap={2} flexDir={{ base: "column", sm: "row" }}>
            <Button w="full" {...btnGhost} onClick={onDisputeClose} fontSize="sm">
              Bekor
            </Button>
            <Button
              w="full"
              bg="rgba(255,0,80,0.12)"
              border="1px solid rgba(255,0,80,0.18)"
              color="whiteAlpha.900"
              _hover={{ bg: "rgba(255,0,80,0.16)" }}
              onClick={createDispute}
              isLoading={disputeCreating}
              isDisabled={!disputeReason.trim()}
              fontSize="sm"
            >
              Dispute ochish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
