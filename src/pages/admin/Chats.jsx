// src/pages/admin/Chats.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Search, MessageSquare } from "lucide-react";
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
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [target, setTarget] = useState(null); // { chat_id, nextStatus, currentStatus, partnerName }

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["admin", "chats"],
    queryFn: async () => {
      const res = await api("/messages");
      let fetchedChats = [];
      if (res.data?.chats && Array.isArray(res.data.chats)) fetchedChats = res.data.chats;
      else if (res.data?.data?.chats) fetchedChats = res.data.data.chats;
      else if (Array.isArray(res.data)) fetchedChats = res.data;

      return (fetchedChats || []).map((c) => ({
        ...c,
        status: c.status ?? "active",
      }));
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ chat_id, nextStatus }) => {
      await api.patch(`/messages/chats/${chat_id}/status`, {
        status: nextStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "chats"] });
      toast({
        title: "OK",
        description: "Chat holati yangilandi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
      setTarget(null);
    },
    onError: (err) => {
      console.error("Chat status update error:", err);
      toast({
        title: "Xato",
        description: "Holatni o'zgartirishda xato yuz berdi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {
    socket.connect();
    return () => {
      // socket.disconnect(); // optional
    };
  }, []);

  const statusBadge = (status) => {
    const isActive = (status ?? "active") === "active";
    return isActive ? <Badge {...badgeGreen}>ACTIVE</Badge> : <Badge {...badgeRed}>BLOCKED</Badge>;
  };

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

  const handleConfirmToggle = () => {
    if (target) {
      toggleStatusMutation.mutate({
        chat_id: target.chat_id,
        nextStatus: target.nextStatus,
      });
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

  if (isLoading) {
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
                <Search size={18} color="rgba(255,255,255,0.55)" />
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
      <Modal isOpen={isOpen} onClose={toggleStatusMutation.isPending ? () => {} : onClose} isCentered>
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
          <ModalCloseButton isDisabled={toggleStatusMutation.isPending} />
          <ModalBody>
            <Text color="whiteAlpha.800">
              <b>{target?.partnerName || "Foydalanuvchi"}</b> bilan chat{" "}
              {target?.nextStatus === "blocked"
                ? "bloklansinmi? (xabar yuborish to‘xtaydi)"
                : "faollashtirilsinmi?"}
            </Text>
          </ModalBody>
          <ModalFooter gap={3} flexDir={{ base: "column", sm: "row" }} w="full">
            <Button {...btnGhost} onClick={onClose} isDisabled={toggleStatusMutation.isPending} w="full">
              Bekor qilish
            </Button>
            <Button
              {...(target?.nextStatus === "blocked" ? btnDanger : btnSuccess)}
              onClick={handleConfirmToggle}
              isLoading={toggleStatusMutation.isPending}
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
