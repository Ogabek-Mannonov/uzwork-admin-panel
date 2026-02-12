// src/pages/admin/Chats.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { SearchIcon, MessageSquare } from "lucide-react";
import { Ban, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import socket from "../../utils/socket";

/* ================= THEME ================= */
const GLASS_CARD = {
  bg: "rgba(10, 18, 38, 0.55)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.10)",
  borderRadius: "2xl",
  boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  backdropFilter: "blur(12px)",
  overflow: "hidden",
};

const SHINE_OVERLAY = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  bgGradient: "linear(to-b, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
};

const inputStyle = {
  bg: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.14)",
  color: "whiteAlpha.900",
  _placeholder: { color: "whiteAlpha.500" },
  _hover: { borderColor: "rgba(255,255,255,0.28)" },
  _focus: {
    borderColor: "rgba(66,153,225,0.9)",
    boxShadow: "0 0 0 3px rgba(66,153,225,0.25)",
  },
};

const badgeBlue = {
  bg: "rgba(30,144,255,0.16)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(30,144,255,0.28)",
};
const badgeGreen = {
  bg: "rgba(0,220,130,0.14)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(0,220,130,0.22)",
};
const badgeRed = {
  bg: "rgba(255,0,80,0.10)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(255,0,80,0.18)",
};
const badgePurple = {
  bg: "rgba(170,90,255,0.16)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(170,90,255,0.26)",
};

const btnGhost = {
  h: "44px",
  borderRadius: "xl",
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(255,255,255,0.09)" },
};

const btnDanger = {
  h: "44px",
  borderRadius: "xl",
  bg: "rgba(255,0,80,0.10)",
  border: "1px solid rgba(255,0,80,0.18)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(255,0,80,0.14)" },
};

const btnSuccess = {
  h: "44px",
  borderRadius: "xl",
  bg: "rgba(0,220,130,0.14)",
  border: "1px solid rgba(0,220,130,0.22)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(0,220,130,0.18)" },
};

export default function AdminChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  // ✅ confirm modal for block/unblock
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirming, setConfirming] = useState(false);
  const [target, setTarget] = useState(null); // { chat_id, nextStatus, currentStatus, partnerName }

  useEffect(() => {
    socket.connect();

    const fetchChats = async () => {
      try {
        const res = await api("/messages");

        let fetchedChats = [];
        if (res.data?.chats && Array.isArray(res.data.chats)) fetchedChats = res.data.chats;
        else if (res.data?.data?.chats) fetchedChats = res.data.data.chats;
        else if (Array.isArray(res.data)) fetchedChats = res.data;

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
      setChats((prev) => prev.map((chat) => (chat.chat_id === chatId ? { ...chat, unread_count: unreadCount } : chat)));
    });

    socket.on("chatStatusUpdated", ({ chat_id, status }) => {
      setChats((prev) => prev.map((c) => (c.chat_id === chat_id ? { ...c, status } : c)));
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
    return isActive ? <Badge {...badgeGreen}>ACTIVE</Badge> : <Badge {...badgeRed}>BLOCKED</Badge>;
  };

  // ✅ open confirm modal
  const askToggleChatStatus = (chat) => {
    const currentStatus = chat.status ?? "active";
    const nextStatus = currentStatus === "blocked" ? "active" : "blocked";
    const partnerName = `${chat.partner?.first_name || "Noma'lum"} ${chat.partner?.last_name || ""}`.trim();

    setTarget({
      chat_id: chat.chat_id,
      currentStatus,
      nextStatus,
      partnerName,
    });
    onOpen();
  };

  // ✅ confirmed action (same route)
  const confirmToggleChatStatus = async () => {
    if (!target?.chat_id) return;

    try {
      setConfirming(true);
      setBusyId(target.chat_id);

      const res = await api.patch(`/messages/chats/${target.chat_id}/status`, { status: target.nextStatus });

      const payload = res?.data ?? res;
      const updated = payload?.data?.chat || payload?.chat || { id: target.chat_id, status: target.nextStatus };

      setChats((prev) =>
        prev.map((c) => (c.chat_id === target.chat_id ? { ...c, status: updated.status ?? target.nextStatus } : c))
      );

      toast({
        title: "OK",
        description: target.nextStatus === "blocked" ? "Chat bloklandi" : "Chat faollashtirildi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onClose();
      setTarget(null);
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
      setConfirming(false);
      setBusyId(null);
    }
  };

  const filteredChats = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return (chats || []).filter((chat) => {
      const partnerName = `${chat.partner?.first_name || ""} ${chat.partner?.last_name || ""}`.toLowerCase();
      const jobKey = String(chat.job_id || chat.contract_id || "").toLowerCase();
      return partnerName.includes(q) || jobKey.includes(q);
    });
  }, [chats, searchTerm]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="70vh">
        <Spinner size="xl" color="blue.300" thickness="4px" />
        <Text ml={4} color="whiteAlpha.800">
          Chatlar yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header (RESPONSIVE) */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="whiteAlpha.900">
            Chatlar
          </Heading>
          <Text mt={1} color="whiteAlpha.600" fontSize="sm">
            Qidirish + chatni ochish + block/unblock (real-time)
          </Text>
        </Box>

        <Badge {...badgeBlue} borderRadius="full" px={3} py={1.5} fontWeight="semibold">
          NATIJA: {filteredChats.length}
        </Badge>
      </Flex>

      {/* Search (RESPONSIVE) */}
      <Card {...GLASS_CARD} mb={6} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardBody position="relative">
          <Flex gap={4} wrap="wrap" align="center" direction={{ base: "column", md: "row" }}>
            <InputGroup w="full" maxW={{ base: "100%", md: "520px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="rgba(255,255,255,0.55)" />
              </InputLeftElement>
              <Input
                placeholder="Foydalanuvchi yoki job/contract bo‘yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                {...inputStyle}
              />
            </InputGroup>

            <Badge {...badgePurple} borderRadius="full" px={3} py={1.5} fontWeight="semibold">
              LIVE
            </Badge>
          </Flex>
        </CardBody>
      </Card>

      {/* Table */}
      <Card {...GLASS_CARD} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardBody position="relative" p={0}>
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr bg="rgba(255,255,255,0.04)">
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Foydalanuvchi</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Oxirgi xabar</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Vaqt</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">O‘qilmagan</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Status</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Amallar</Th>
                </Tr>
              </Thead>

              <Tbody>
                {filteredChats.length > 0 ? (
                  filteredChats.map((chat) => {
                    const chatStatus = chat.status ?? "active";
                    const isBlocked = chatStatus === "blocked";

                    const partnerFirst = chat.partner?.first_name || "Noma'lum";
                    const partnerLast = chat.partner?.last_name || "";
                    const partnerRole = chat.partner?.role || "Foydalanuvchi";
                    const jobOrContract = chat.job_id || chat.contract_id || "—";

                    return (
                      <Tr key={chat.chat_id} _hover={{ bg: "rgba(255,255,255,0.04)" }} transition="background 0.12s">
                        <Td borderColor="rgba(255,255,255,0.06)">
                          <HStack align="start">
                            <Avatar name={`${partnerFirst} ${partnerLast}`} size="sm" />
                            <Box minW="200px">
                              <Text fontWeight="semibold" color="whiteAlpha.900" noOfLines={1}>
                                {partnerFirst} {partnerLast}
                              </Text>
                              <Text fontSize="sm" color="whiteAlpha.600" noOfLines={1}>
                                {partnerRole} • Job/Contract #{jobOrContract}
                              </Text>
                            </Box>
                          </HStack>
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)" maxW={{ base: "220px", md: "360px" }}>
                          <Text noOfLines={1} fontSize="sm" color="whiteAlpha.800">
                            {chat.last_message_content || "Hech qanday xabar yo‘q"}
                          </Text>
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)" fontSize="sm" color="whiteAlpha.700" whiteSpace="nowrap">
                          {chat.last_message_at
                            ? new Date(chat.last_message_at).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" })
                            : chat.chat_created_at
                            ? new Date(chat.chat_created_at).toLocaleString("uz-UZ", { dateStyle: "short" })
                            : "—"}
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)">
                          {chat.unread_count > 0 ? (
                            <Badge {...badgeRed} borderRadius="full" px={3} py={1}>
                              {chat.unread_count}
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="whiteAlpha.600">
                              —
                            </Text>
                          )}
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)">{statusBadge(chatStatus)}</Td>

                        <Td borderColor="rgba(255,255,255,0.06)">
                          <HStack spacing={2} wrap="wrap">
                            <IconButton
                              as={Link}
                              to={`/admin/chats/${chat.chat_id}`}
                              icon={<MessageSquare size={18} />}
                              size="sm"
                              aria-label="Chatni ochish"
                              bg="rgba(30,144,255,0.12)"
                              color="whiteAlpha.900"
                              border="1px solid rgba(30,144,255,0.20)"
                              _hover={{ bg: "rgba(30,144,255,0.18)" }}
                            />

                            <IconButton
                              icon={isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                              size="sm"
                              aria-label={isBlocked ? "Faollashtirish" : "Bloklash"}
                              bg={isBlocked ? "rgba(0,220,130,0.12)" : "rgba(255,0,80,0.10)"}
                              color="whiteAlpha.900"
                              border={isBlocked ? "1px solid rgba(0,220,130,0.20)" : "1px solid rgba(255,0,80,0.18)"}
                              _hover={{ bg: isBlocked ? "rgba(0,220,130,0.16)" : "rgba(255,0,80,0.14)" }}
                              isLoading={busyId === chat.chat_id}
                              onClick={() => askToggleChatStatus(chat)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })
                ) : (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={10} color="whiteAlpha.600">
                      Hozircha chatlar yo‘q.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* ✅ CONFIRM MODAL (block/unblock) */}
      <Modal isOpen={isOpen} onClose={confirming ? () => {} : onClose} isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.6)" />
        <ModalContent
          bg="rgba(10, 18, 38, 0.92)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          borderRadius="2xl"
          boxShadow="0 18px 60px rgba(0,0,0,0.5)"
          backdropFilter="blur(12px)"
          mx={4}
        >
          <ModalHeader>{target?.nextStatus === "blocked" ? "Chatni bloklash" : "Chatni faollashtirish"}</ModalHeader>
          <ModalCloseButton isDisabled={confirming} />
          <ModalBody>
            <Text color="whiteAlpha.800">
              <b>{target?.partnerName || "Foydalanuvchi"}</b> bilan chat{" "}
              {target?.nextStatus === "blocked"
                ? "bloklansinmi? (xabar yuborish to‘xtaydi)"
                : "faollashtirilsinmi?"}
            </Text>
          </ModalBody>
          <ModalFooter gap={3} flexDir={{ base: "column", sm: "row" }} w="full">
            <Button {...btnGhost} onClick={onClose} isDisabled={confirming} w="full">
              Bekor qilish
            </Button>
            <Button
              {...(target?.nextStatus === "blocked" ? btnDanger : btnSuccess)}
              onClick={confirmToggleChatStatus}
              isLoading={confirming}
              loadingText="Bajarilmoqda..."
              w="full"
            >
              Ha, tasdiqlash
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
