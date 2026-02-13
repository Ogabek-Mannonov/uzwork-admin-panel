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

/* ================= THEME (your colors stay) ================= */
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
  h: "42px",
  borderRadius: "xl",
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

/* ================= NEW: Telegram-ish layout helpers (no color change) ================= */
const topMetaBadge = {
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "whiteAlpha.800",
  borderRadius: "999px",
  px: 2,
  py: 0.5,
  fontSize: "10px",
  fontWeight: "700",
};

const personChip = {
  bg: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "999px",
  px: 2,
  py: 1.5,
  gap: 2,
  align: "center",
};

const scrollAreaCss = {
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": { background: "rgba(255,255,255,0.02)" },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(255,255,255,0.10)",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255,255,255,0.15)" },
};

// ✅ Fix: icon alignment (Mic/Send) for Chakra IconButton + lucide
const iconBtnSquare = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: "0",
};

// ✅ Fix: prevent horizontal scroll from long strings / flex
const safeTextWrap = {
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
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

  // mini progress/time for voice messages
  const [audioProgress, setAudioProgress] = useState({});
  const [audioDuration, setAudioDuration] = useState({});

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

  // Dispute modal states
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

  // helper: full name + username
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

        const root = payload?.data ?? payload;

        let fetchedMessages = [];
        if (root?.messages) fetchedMessages = root.messages;
        else if (root?.data?.messages) fetchedMessages = root.data.messages;
        else if (Array.isArray(root)) fetchedMessages = root;

        setMessages(fetchedMessages || []);

        const clientData = root?.client || root?.data?.client || null;
        const freelancerData =
          root?.freelancer || root?.data?.freelancer || null;

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
      setMessages((prev) =>
        prev.filter((msg) => normalizeId(msg.id) !== deleteId)
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagesRead");
      socket.off("messageEdited");
      socket.off("messageDeleted");
      socket.disconnect();

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

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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

      const res = await api.post(`/messages/${chatId}/voice`, { voice_url: voiceUrl });

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

  // Audio playback with progress
  const toggleAudioPlayback = (messageId, audioUrl) => {
    let fullAudioUrl = audioUrl;
    if (audioUrl && !String(audioUrl).startsWith("http")) {
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      fullAudioUrl = `${baseURL}${audioUrl}`;
    }

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
        console.error("Audio playback error:", e);
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

      newAudio.play().catch(() => {});
      setPlayingAudioId(messageId);
      return;
    }

    if (playingAudioId === messageId) {
      try {
        existing.pause();
      } catch {}
      setPlayingAudioId(null);
    } else {
      existing.play().catch(() => {});
      setPlayingAudioId(messageId);
    }
  };

  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ NEW: Telegram-style DATE SEPARATOR helpers
  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    const da = new Date(a);
    const db = new Date(b);
    return (
      da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate()
    );
  };

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const dayDiff = (a, b) => {
    const da = startOfDay(a).getTime();
    const db = startOfDay(b).getTime();
    return Math.round((da - db) / (1000 * 60 * 60 * 24));
  };

  const formatDayLabel = (dateLike) => {
    if (!dateLike) return "";
    const now = new Date();
    const d = new Date(dateLike);

    const diff = dayDiff(now, d); // 0=Bugun, 1=Kecha
    if (diff === 0) return "Bugun";
    if (diff === 1) return "Kecha";

    return d.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const DateSeparator = ({ label }) => (
    <Flex justify="center" py={2} px={2}>
      <Box
        px={3}
        py={1.5}
        borderRadius="999px"
        bg="rgba(255,255,255,0.06)"
        border="1px solid rgba(255,255,255,0.10)"
        color="whiteAlpha.800"
        fontSize="11px"
        fontWeight="800"
        letterSpacing="0.2px"
      >
        {label}
      </Box>
    </Flex>
  );

  // Edit/Delete permissions
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

  const MENU_W = 180; // menu minW 160 bo'lgani uchun biroz zaxira
  const MENU_H = 140; // 3 item atrofida

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  const openContextMenu = (event, message) => {
    event.preventDefault();
    event.stopPropagation();

    const padding = 8;

    const maxX = window.innerWidth - MENU_W - padding;
    const maxY = window.innerHeight - MENU_H - padding;

    const x = clamp(event.clientX, padding, maxX);
    const y = clamp(event.clientY, padding, maxY);

    setContextMenu({
      isOpen: true,
      x,
      y,
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

  // CREATE DISPUTE
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
        e?.response?.data?.message || e?.message || "Dispute ochishda xato";
      toast({ title: "Xato", description: msg, status: "error", duration: 3500 });
    } finally {
      setDisputeCreating(false);
    }
  };

  // file open/download helpers
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
    ? `${buildName(chatInfo.client, "Client")} ${buildUsername(
        chatInfo.client,
        "client"
      )}`.trim()
    : "Client ?";
  const freelancerLine = chatInfo.freelancer
    ? `${buildName(chatInfo.freelancer, "Freelancer")} ${buildUsername(
        chatInfo.freelancer,
        "freelancer"
      )}`.trim()
    : "Freelancer ?";

  const jobTitle =
    chatInfo.jobTitle?.trim() ||
    (chatInfo.jobId ? `Job #${String(chatInfo.jobId).slice(0, 8)}` : "Chat");

  /* ================= RENDER ================= */
  return (
    <Box
      w="full"
      h="calc(100vh - 90px)"
      minH="0"
      overflow="hidden"
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
        <Box position="relative" px={{ base: 3, md: 4 }} py={{ base: 3, md: 3.5 }}>
          <Flex align="center" justify="space-between" gap={3}>
            <HStack spacing={3} minW="0" flex="1">
              <Link to="/admin/chats">
                <IconButton
                  aria-label="Back"
                  icon={<ArrowLeft size={18} style={{ display: "block" }} />}
                  {...btnGhost}
                  size="sm"
                  {...iconBtnSquare}
                />
              </Link>

              <Box minW="0" flex="1">
                <HStack justify="space-between" align="start" spacing={3}>
                  <Box minW="0">
                    <Heading
                      size="sm"
                      color="whiteAlpha.900"
                      lineHeight="1.25"
                      noOfLines={1}
                      fontSize={{ base: "14px", md: "16px" }}
                    >
                      {jobTitle}
                    </Heading>

                    <Text
                      fontSize="11px"
                      color="whiteAlpha.700"
                      mt={1}
                      noOfLines={1}
                      {...safeTextWrap}
                    >
                      {clientLine} {"  •  "} {freelancerLine}
                    </Text>
                  </Box>

                  <HStack spacing={2} flexShrink={0}>
                    <Badge {...topMetaBadge}>Chat {chatId.slice(0, 8)}…</Badge>
                  </HStack>
                </HStack>

                <HStack spacing={2} mt={2} flexWrap="wrap">
                  {chatInfo.client && (
                    <Flex
                      as={chatInfo.client?.id ? Link : "div"}
                      to={
                        chatInfo.client?.id
                          ? `/admin/users/${chatInfo.client.id}`
                          : undefined
                      }
                      {...personChip}
                      cursor={chatInfo.client?.id ? "pointer" : "default"}
                      _hover={chatInfo.client?.id ? { opacity: 0.9 } : undefined}
                      minW="0"
                    >
                      <Avatar
                        name={buildName(chatInfo.client, "C")}
                        src={chatInfo.client.avatar_url || undefined}
                        size="xs"
                        bg="rgba(255,0,80,0.35)"
                        color="white"
                      />
                      <Box minW="0">
                        <Text
                          fontWeight="700"
                          fontSize="12px"
                          color="whiteAlpha.900"
                          noOfLines={1}
                        >
                          {buildName(chatInfo.client, "Client")}
                        </Text>
                        <Text fontSize="10px" color="whiteAlpha.600" noOfLines={1}>
                          {buildUsername(chatInfo.client, "client")}
                        </Text>
                      </Box>
                      <Badge
                        bg="rgba(255,0,80,0.10)"
                        border="1px solid rgba(255,0,80,0.14)"
                        color="whiteAlpha.900"
                        borderRadius="999px"
                        px={2}
                        fontSize="9px"
                        flexShrink={0}
                      >
                        CLIENT
                      </Badge>
                    </Flex>
                  )}

                  {chatInfo.freelancer && (
                    <Flex
                      as={chatInfo.freelancer?.id ? Link : "div"}
                      to={
                        chatInfo.freelancer?.id
                          ? `/admin/users/${chatInfo.freelancer.id}`
                          : undefined
                      }
                      {...personChip}
                      cursor={chatInfo.freelancer?.id ? "pointer" : "default"}
                      _hover={
                        chatInfo.freelancer?.id ? { opacity: 0.9 } : undefined
                      }
                      minW="0"
                    >
                      <Avatar
                        name={buildName(chatInfo.freelancer, "F")}
                        src={chatInfo.freelancer.avatar_url || undefined}
                        size="xs"
                        bg="rgba(255,170,0,0.35)"
                        color="white"
                      />
                      <Box minW="0">
                        <Text
                          fontWeight="700"
                          fontSize="12px"
                          color="whiteAlpha.900"
                          noOfLines={1}
                        >
                          {buildName(chatInfo.freelancer, "Freelancer")}
                        </Text>
                        <Text fontSize="10px" color="whiteAlpha.600" noOfLines={1}>
                          {buildUsername(chatInfo.freelancer, "freelancer")}
                        </Text>
                      </Box>
                      <Badge
                        bg="rgba(255,170,0,0.10)"
                        border="1px solid rgba(255,170,0,0.14)"
                        color="whiteAlpha.900"
                        borderRadius="999px"
                        px={2}
                        fontSize="9px"
                        flexShrink={0}
                      >
                        FREELANCER
                      </Badge>
                    </Flex>
                  )}
                </HStack>
              </Box>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* ================= MESSAGES AREA ================= */}
      <Box {...MESSAGES_CARD} flex="1" minH="0" position="relative" w="full">
        <Box {...SHINE_OVERLAY} />

        <Box
          position="relative"
          h="full"
          overflowY="auto"
          overflowX="hidden"
          px={{ base: 2, md: 4 }}
          py={{ base: 3, md: 4 }}
          css={scrollAreaCss}
          display="flex"
          flexDirection="column"
          gap={2.5}
        >
          {visibleMessages.length === 0 ? (
            <Flex align="center" justify="center" h="full">
              <Text textAlign="center" color="whiteAlpha.500" fontSize="sm">
                Hozircha xabarlar yo'q
              </Text>
            </Flex>
          ) : (
            visibleMessages.map((msg, idx) => {
              const prev = visibleMessages[idx - 1];
              const showDateSep =
                idx === 0 || !isSameDay(prev?.created_at, msg?.created_at);
              const dateLabel = formatDayLabel(msg?.created_at);

              let senderName = "Unknown";
              let avatarBg = "gray.500";
              let username = "";

              if (msg.sender_role === "admin") {
                senderName = "Admin";
                avatarBg = "blue.500";
              } else if (
                msg.sender_role === "client" ||
                normalizeId(msg.sender_id) === normalizeId(chatInfo.client?.id)
              ) {
                const sender = chatInfo.client;
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
                const sender = chatInfo.freelancer;
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

              const bubbleMaxW = { base: "88%", md: "72%", lg: "58%" };

              const bubbleBg = isAdminMessage
                ? "linear-gradient(135deg, rgba(30,144,255,0.28), rgba(30,144,255,0.14))"
                : "rgba(255,255,255,0.06)";

              const bubbleBorder = isAdminMessage
                ? "rgba(30,144,255,0.28)"
                : "rgba(255,255,255,0.10)";

              const cur = audioProgress[msg.id] || 0;
              const dur = audioDuration[msg.id] || 0;
              const pct = dur > 0 ? (cur / dur) * 100 : 0;

              const fileUrl = msg.file_url ? buildFileUrl(msg.file_url) : "";

              return (
                <React.Fragment key={normalizeId(msg.id)}>
                  {showDateSep && <DateSeparator label={dateLabel} />}

                  <Flex
                    align="flex-end"
                    justify={isAdminMessage ? "flex-end" : "flex-start"}
                    gap={2}
                    minW="0"
                  >
                    {!isAdminMessage && (
                      <Avatar
                        name={senderName}
                        size="xs"
                        bg={avatarBg}
                        color="white"
                        flexShrink={0}
                        mb="2px"
                      />
                    )}

                    <Box
                      maxW={bubbleMaxW}
                      minW="0"
                      display="flex"
                      flexDirection="column"
                      gap={1}
                      role="group"
                    >
                      <Flex
                        as={!isAdminMessage && senderUserId ? Link : "div"}
                        to={
                          !isAdminMessage && senderUserId
                            ? senderProfileLink
                            : undefined
                        }
                        align="center"
                        gap={1.5}
                        alignSelf={isAdminMessage ? "flex-end" : "flex-start"}
                        cursor={
                          !isAdminMessage && senderUserId ? "pointer" : "default"
                        }
                        _hover={
                          !isAdminMessage && senderUserId
                            ? { opacity: 0.88 }
                            : undefined
                        }
                        px={1}
                        fontSize="11px"
                        minW="0"
                      >
                        <Text fontWeight="800" color="whiteAlpha.800" noOfLines={1}>
                          {senderName}
                        </Text>
                        {username && (
                          <Text color="whiteAlpha.600" fontSize="10px" noOfLines={1}>
                            {username}
                          </Text>
                        )}
                        {isAdminMessage && <Badge {...adminBadgeStyle}>ADMIN</Badge>}
                      </Flex>

                      <Box
                        position="relative"
                        onContextMenu={(e) => openContextMenu(e, msg)}
                        minW="0"
                      >
                        <Box
                          bgGradient={isAdminMessage ? bubbleBg : undefined}
                          bg={!isAdminMessage ? bubbleBg : undefined}
                          border="1px solid"
                          borderColor={bubbleBorder}
                          color="whiteAlpha.900"
                          px={{ base: 3, md: 3.5 }}
                          py={{ base: 2.5, md: 3 }}
                          borderRadius="20px"
                          boxShadow="0 4px 12px rgba(0,0,0,0.20)"
                          position="relative"
                          fontSize={{ base: "13px", md: "14px" }}
                          minW="0"
                          overflow="hidden"
                        >
                          {(canEdit || canDelete) && (
                            <Box
                              position="absolute"
                              top="8px"
                              right="10px"
                              opacity={0}
                              _groupHover={{ opacity: 1 }}
                              transition="opacity 0.15s ease"
                              zIndex={5}
                            >
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<MoreVertical size={14} style={{ display: "block" }} />}
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
                                  {...iconBtnSquare}
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

                          {msg.type === "text" && (
                            <Box pr={8} minW="0">
                              <Text lineHeight="1.55" {...safeTextWrap}>
                                {msg.content}
                              </Text>
                              {msg.is_edited && (
                                <Text fontSize="10px" color="whiteAlpha.600" mt={1}>
                                  (tahrirlangan)
                                </Text>
                              )}
                            </Box>
                          )}

                          {msg.type === "voice" && msg.file_url && (
                            <Box pr={8} minW="0">
                              <HStack spacing={2} align="center" minW="0">
                                <IconButton
                                  icon={
                                    playingAudioId === msg.id ? (
                                      <Pause size={16} style={{ display: "block" }} />
                                    ) : (
                                      <Play size={16} style={{ display: "block" }} />
                                    )
                                  }
                                  size="xs"
                                  aria-label="Play/Pause"
                                  bg="rgba(255,255,255,0.10)"
                                  border="1px solid rgba(255,255,255,0.12)"
                                  _hover={{ bg: "rgba(255,255,255,0.14)" }}
                                  onClick={() => toggleAudioPlayback(msg.id, msg.file_url)}
                                  h="34px"
                                  w="34px"
                                  minW="34px"
                                  borderRadius="12px"
                                  {...iconBtnSquare}
                                />
                                <Box flex="1" minW="0">
                                  <HStack justify="space-between" mb={1}>
                                    <Text fontSize="12px" fontWeight="700">
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

                          {msg.type === "file" && msg.file_url && (
                            <Box pr={8} minW="0">
                              <HStack spacing={2} align="center" minW="0">
                                <Box
                                  w="34px"
                                  h="34px"
                                  borderRadius="12px"
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
                                  <Text fontSize="12px" fontWeight="700" noOfLines={1}>
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
                                      icon={<ExternalLink size={14} style={{ display: "block" }} />}
                                      size="xs"
                                      aria-label="Open"
                                      bg="rgba(255,255,255,0.10)"
                                      border="1px solid rgba(255,255,255,0.12)"
                                      _hover={{ bg: "rgba(255,255,255,0.14)" }}
                                      h="30px"
                                      w="30px"
                                      minW="30px"
                                      borderRadius="10px"
                                      {...iconBtnSquare}
                                    />
                                  </Tooltip>

                                  <Tooltip label="Download" fontSize="xs">
                                    <IconButton
                                      as="a"
                                      href={fileUrl}
                                      download
                                      icon={<Download size={14} style={{ display: "block" }} />}
                                      size="xs"
                                      aria-label="Download"
                                      bg="rgba(255,255,255,0.10)"
                                      border="1px solid rgba(255,255,255,0.12)"
                                      _hover={{ bg: "rgba(255,255,255,0.14)" }}
                                      h="30px"
                                      w="30px"
                                      minW="30px"
                                      borderRadius="10px"
                                      {...iconBtnSquare}
                                    />
                                  </Tooltip>
                                </HStack>
                              </HStack>
                            </Box>
                          )}

                          <Divider mt={2.5} mb={1.5} borderColor="rgba(255,255,255,0.05)" />
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
                                fontWeight="800"
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
                        mb="2px"
                      />
                    )}
                  </Flex>
                </React.Fragment>
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
            <VStack spacing={2} mb={3} align="stretch">
              <HStack justify="space-between" w="full" fontSize="sm">
                <HStack>
                  <Box
                    w={2.5}
                    h={2.5}
                    bg="red.400"
                    borderRadius="full"
                    animation="pulse 1s infinite"
                  />
                  <Text fontWeight="700" color="whiteAlpha.900">
                    Yozilmoqda...
                  </Text>
                </HStack>
                <Text fontWeight="800" color="red.300" fontSize="sm">
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
                  h="38px"
                  colorScheme="red"
                  variant="outline"
                  onClick={cancelRecording}
                  fontSize="sm"
                >
                  Bekor qilish
                </Button>
                <Button
                  w="full"
                  h="38px"
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
              borderRadius="xl"
              flexWrap="wrap"
            >
              <IconButton
                icon={<Play size={16} style={{ display: "block" }} />}
                size="xs"
                aria-label="Preview"
                bg="rgba(255,255,255,0.08)"
                border="1px solid rgba(255,255,255,0.10)"
                _hover={{ bg: "rgba(255,255,255,0.12)" }}
                onClick={() => {
                  const audio = new Audio(URL.createObjectURL(audioBlob));
                  audio.play();
                }}
                h="34px"
                w="34px"
                minW="34px"
                borderRadius="12px"
                {...iconBtnSquare}
              />
              <Text
                flex={1}
                color="whiteAlpha.800"
                minW="160px"
                fontSize="13px"
                fontWeight="700"
              >
                Ovozli ({formatTime(recordingTime)})
              </Text>
              <Button
                size="xs"
                variant="ghost"
                color="red.200"
                onClick={() => setAudioBlob(null)}
              >
                O'chirish
              </Button>
              <Button size="xs" colorScheme="blue" onClick={sendVoiceMessage} isLoading={sending}>
                Yuborish
              </Button>
            </HStack>
          )}

          {!isRecording && !audioBlob && (
            <HStack spacing={2} align="center">
              <Tooltip label="Fayl" fontSize="xs">
                <IconButton
                  icon={<Paperclip size={16} style={{ display: "block" }} />}
                  variant="ghost"
                  aria-label="Fayl"
                  color="whiteAlpha.900"
                  _hover={{ bg: "rgba(255,255,255,0.06)" }}
                  h="42px"
                  w="42px"
                  minW="42px"
                  borderRadius="xl"
                  {...iconBtnSquare}
                />
              </Tooltip>

              <Box flex="1" minW="0">
                <InputGroup size="sm">
                  <Input
                    placeholder="Xabar yozing..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !sending && handleSendMessage()}
                    disabled={sending}
                    {...inputDark}
                  />

                  <InputRightElement
                    width="auto"
                    pr={1}
                    h="42px"
                    display="flex"
                    alignItems="center"
                  >
                    <HStack spacing={1} align="center">
                      <Tooltip label="Ovoz" fontSize="xs">
                        <IconButton
                          icon={<Mic size={16} style={{ display: "block" }} />}
                          variant="ghost"
                          size="sm"
                          color="red.200"
                          onClick={startRecording}
                          aria-label="Voice"
                          _hover={{ bg: "rgba(255,255,255,0.06)" }}
                          h="34px"
                          w="34px"
                          minW="34px"
                          borderRadius="12px"
                          {...iconBtnSquare}
                        />
                      </Tooltip>

                      <IconButton
                        icon={<Send size={16} style={{ display: "block" }} />}
                        size="sm"
                        aria-label="Yuborish"
                        onClick={handleSendMessage}
                        isLoading={sending}
                        bg="rgba(30,144,255,0.22)"
                        border="1px solid rgba(30,144,255,0.28)"
                        color="whiteAlpha.900"
                        _hover={{ bg: "rgba(30,144,255,0.30)" }}
                        h="34px"
                        w="34px"
                        minW="34px"
                        borderRadius="12px"
                        {...iconBtnSquare}
                      />
                    </HStack>
                  </InputRightElement>
                </InputGroup>
              </Box>
            </HStack>
          )}
        </Box>
      </Box>

      {/* ================= MODALS (same) ================= */}
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

      <Menu isOpen={contextMenu.isOpen} onClose={closeContextMenu}>
        <MenuButton as={Box} position="fixed" top={0} left={0} w={0} h={0} />
        <MenuList
          position="fixed"
          top={`${contextMenu.y}px`}
          left={`${contextMenu.y}px`}
          zIndex={2000}
          minW="160px"
          bg="rgba(10,18,38,0.95)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          fontSize="sm"
          overflow="hidden"
          onClick={(e) => e.stopPropagation()}
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
