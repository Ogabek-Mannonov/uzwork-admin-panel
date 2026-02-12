import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  VStack,
  HStack,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useToast,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  TableContainer,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ArrowLeftIcon } from "@chakra-ui/icons";
import { MessageSquare } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";

/* ================= THEME (Admin glass dark) ================= */
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

const glassBtn = {
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(255,255,255,0.10)" },
};

const soft = {
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "xl",
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
const badgeOrange = {
  bg: "rgba(255,170,0,0.14)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(255,170,0,0.22)",
};

export default function DisputeDetail() {
  const { disputeId } = useParams();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState(null);

  // resolve modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [resolution, setResolution] = useState("approved");
  const [adminNotes, setAdminNotes] = useState("");

  const normalize = (res) => {
    const payload = res?.data ?? res;
    return payload?.data?.dispute || payload?.dispute || null;
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api(`/disputes/${disputeId}`);
      const d = normalize(res);

      if (!d) {
        setError("Dispute topilmadi.");
        setDispute(null);
        return;
      }

      setDispute(d);
    } catch (e) {
      console.error("Dispute detail error:", e);
      setError("Dispute detailni yuklashda xato.");
      setDispute(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (disputeId) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId]);

  const getStatusBadge = (status) => {
    const v = String(status || "").toLowerCase();
    const map = {
      open: { label: "Ochiq", badge: badgeOrange },
      in_review: { label: "Ko'rib chiqilmoqda", badge: badgeBlue },
      resolved: { label: "Hal qilingan", badge: badgeGreen },
      cancelled: {
        label: "Bekor qilingan",
        badge: { bg: "rgba(255,255,255,0.08)", color: "whiteAlpha.900", border: "1px solid rgba(255,255,255,0.12)" },
      },
    };
    const m =
      map[v] || {
        label: v || "—",
        badge: { bg: "rgba(255,255,255,0.08)", color: "whiteAlpha.900", border: "1px solid rgba(255,255,255,0.12)" },
      };

    return (
      <Badge {...m.badge} px={3} py={1} borderRadius="full">
        {m.label}
      </Badge>
    );
  };

  const getMilestoneStatusBadge = (status) => {
    const v = String(status || "").toLowerCase();
    const map = {
      pending: { t: "Pending", b: badgeOrange },
      submitted: { t: "Submitted", b: badgeBlue },
      approved: { t: "Approved", b: badgeGreen },
      released: { t: "Released", b: badgePurple },
    };
    const it = map[v] || { t: v || "—", b: { bg: "rgba(255,255,255,0.08)", color: "whiteAlpha.900", border: "1px solid rgba(255,255,255,0.12)" } };
    return (
      <Badge {...it.b} borderRadius="full" px={3} py={1}>
        {it.t}
      </Badge>
    );
  };

  const fullName = (u) =>
    `${u?.first_name || ""} ${u?.last_name || ""}`.trim() || u?.username || "Noma'lum";

  const createdAtLabel = useMemo(() => {
    if (!dispute?.created_at) return "—";
    try {
      return new Date(dispute.created_at).toLocaleString("uz-UZ", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return String(dispute.created_at);
    }
  }, [dispute]);

  const openChat = dispute?.chat_id ? `/admin/chats/${dispute.chat_id}` : null;

  const startReview = async () => {
    if (!dispute) return;
    try {
      setActing(true);
      const res = await api.patch(`/disputes/${dispute.id}/status`, { status: "in_review" });
      const payload = res?.data ?? res;
      const updated = payload?.data?.dispute || payload?.dispute;
      setDispute((p) => ({ ...(p || {}), ...(updated || {}), status: "in_review" }));
      toast({ title: "OK", description: "Status: in_review", status: "success", duration: 1600, isClosable: true });
    } catch (e) {
      console.error("startReview error:", e);
      toast({ title: "Xato", description: "Status o‘zgarmadi", status: "error", duration: 2200, isClosable: true });
    } finally {
      setActing(false);
    }
  };

  const openResolveModal = (r) => {
    setResolution(r);
    setAdminNotes(dispute?.admin_notes || "");
    onOpen();
  };

  const doResolve = async () => {
    if (!dispute) return;
    try {
      setActing(true);
      const res = await api.post(`/disputes/${dispute.id}/resolve`, {
        resolution,
        admin_notes: adminNotes?.trim() ? adminNotes.trim() : null,
      });
      const payload = res?.data ?? res;
      const updated = payload?.data?.dispute || payload?.dispute;

      setDispute((p) => ({
        ...(p || {}),
        ...(updated || {}),
        status: "resolved",
        resolution: updated?.resolution || resolution,
        admin_notes: updated?.admin_notes ?? adminNotes,
      }));

      toast({
        title: "Hal qilindi",
        description: resolution === "approved" ? "Freelancer foydasiga" : "Client foydasiga",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onClose();
    } catch (e) {
      console.error("resolve error:", e);
      toast({ title: "Xato", description: "Resolve bo‘lmadi", status: "error", duration: 2400, isClosable: true });
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.300" thickness="4px" />
        <Text ml={4} color="whiteAlpha.800">
          Dispute yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error || !dispute) {
    return (
      <Alert
        status="error"
        borderRadius="xl"
        my={8}
        bg="rgba(255,0,80,0.10)"
        border="1px solid rgba(255,0,80,0.18)"
        color="whiteAlpha.900"
      >
        <AlertIcon />
        <Text>{error || "Dispute topilmadi."}</Text>
      </Alert>
    );
  }

  const client = dispute.client || null;
  const freelancer = dispute.freelancer || null;

  const roleBadge = (role) => {
    const r = String(role || "").toLowerCase();
    if (r === "client") return <Badge {...badgeRed}>Client</Badge>;
    if (r === "freelancer") return <Badge {...badgePurple}>Freelancer</Badge>;
    if (r === "admin") return <Badge {...badgeBlue}>Admin</Badge>;
    return (
      <Badge bg="rgba(255,255,255,0.08)" color="whiteAlpha.900" border="1px solid rgba(255,255,255,0.12)">
        —
      </Badge>
    );
  };

  return (
    <Box>
      {/* HEADER (sticky look) */}
      <Card {...GLASS_CARD} position="relative" mb={6}>
        <Box {...SHINE_OVERLAY} />
        <CardBody position="relative" py={{ base: 4, md: 5 }}>
          <Flex align="start" justify="space-between" gap={4} wrap="wrap">
            <HStack spacing={3} align="center">
              <Link to="/admin/disputes">
                <IconButton
                  icon={<ArrowLeftIcon />}
                  aria-label="Back"
                  {...glassBtn}
                  size="md"
                />
              </Link>

              <Box>
                <Heading size="md" color="whiteAlpha.900" lineHeight="1.1">
                  Nizo tafsilotlari
                </Heading>
                <HStack mt={2} spacing={2} wrap="wrap">
                  <Badge {...badgeOrange} borderRadius="full" px={3} py={1}>
                    Nizo #{String(dispute.id).slice(0, 8)}
                  </Badge>
                  {getStatusBadge(dispute.status)}
                  {dispute.chat_id && (
                    <Badge bg="rgba(255,255,255,0.08)" color="whiteAlpha.900" border="1px solid rgba(255,255,255,0.12)">
                      Chat {String(dispute.chat_id).slice(0, 8)}…
                    </Badge>
                  )}
                </HStack>

                <Text mt={2} fontSize="sm" color="whiteAlpha.600">
                  Yaratilgan: {createdAtLabel}
                </Text>
              </Box>
            </HStack>

            <HStack spacing={2} wrap="wrap">
              {openChat && (
                <Button
                  as={Link}
                  to={openChat}
                  leftIcon={<MessageSquare size={18} />}
                  bg="rgba(30,144,255,0.12)"
                  color="whiteAlpha.900"
                  border="1px solid rgba(30,144,255,0.20)"
                  _hover={{ bg: "rgba(30,144,255,0.18)" }}
                >
                  Chatga o‘tish
                </Button>
              )}

              {dispute.status === "open" && (
                <Button
                  onClick={startReview}
                  isLoading={acting}
                  bg="rgba(30,144,255,0.12)"
                  color="whiteAlpha.900"
                  border="1px solid rgba(30,144,255,0.20)"
                  _hover={{ bg: "rgba(30,144,255,0.18)" }}
                >
                  In review qilish
                </Button>
              )}

              <Button onClick={fetchDetail} isDisabled={acting} {...glassBtn}>
                Yangilash
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {/* TOP CARDS */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        {/* Umumiy */}
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardHeader position="relative" pb={0}>
            <Heading size="sm" color="whiteAlpha.900">
              Umumiy ma’lumotlar
            </Heading>
          </CardHeader>
          <CardBody position="relative" pt={4}>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" gap={6}>
                <Text color="whiteAlpha.700">Chat ID</Text>
                <Text color="whiteAlpha.900" fontWeight="semibold">
                  {dispute.chat_id ? String(dispute.chat_id).slice(0, 10) : "—"}
                </Text>
              </Flex>

              <Flex justify="space-between" gap={6}>
                <Text color="whiteAlpha.700">Status</Text>
                {getStatusBadge(dispute.status)}
              </Flex>

              {dispute.amount != null && (
                <Flex justify="space-between" gap={6}>
                  <Text color="whiteAlpha.700">Summa</Text>
                  <Text color="whiteAlpha.900" fontWeight="bold">
                    {Number(dispute.amount).toLocaleString("uz-UZ")} {dispute.currency || ""}
                  </Text>
                </Flex>
              )}

              {dispute.resolution && (
                <Flex justify="space-between" gap={6}>
                  <Text color="whiteAlpha.700">Qaror</Text>
                  <Badge {...(dispute.resolution === "approved" ? badgeGreen : badgeRed)} borderRadius="full" px={3} py={1}>
                    {dispute.resolution}
                  </Badge>
                </Flex>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Sabab */}
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardHeader position="relative" pb={0}>
            <Heading size="sm" color="whiteAlpha.900">
              Sababi
            </Heading>
          </CardHeader>
          <CardBody position="relative" pt={4}>
            <Box {...soft} p={4}>
              <Text color="whiteAlpha.900" whiteSpace="pre-wrap">
                {dispute.reason || "—"}
              </Text>
            </Box>

            {dispute.admin_notes && (
              <>
                <Divider my={4} borderColor="rgba(255,255,255,0.10)" />
                <Text fontWeight="semibold" color="whiteAlpha.900">
                  Admin izohi:
                </Text>
                <Text mt={2} color="whiteAlpha.800" whiteSpace="pre-wrap">
                  {dispute.admin_notes}
                </Text>
              </>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Client/Freelancer */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardHeader position="relative" pb={0}>
            <Heading size="sm" color="whiteAlpha.900">
              Client
            </Heading>
          </CardHeader>
          <CardBody position="relative" pt={4}>
            {client ? (
              <Flex align="center" gap={4}>
                <Avatar name={fullName(client)} src={client.avatar_url || undefined} size="lg" />
                <Box minW={0}>
                  <Text color="whiteAlpha.900" fontWeight="bold" fontSize="lg" noOfLines={1}>
                    {fullName(client)}
                  </Text>
                  <HStack mt={1} spacing={2} wrap="wrap">
                    <Text fontSize="sm" color="whiteAlpha.600">
                      @{client.username || "—"}
                    </Text>
                    {roleBadge("client")}
                  </HStack>
                </Box>
              </Flex>
            ) : (
              <Text color="whiteAlpha.600">Client topilmadi</Text>
            )}
          </CardBody>
        </Card>

        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardHeader position="relative" pb={0}>
            <Heading size="sm" color="whiteAlpha.900">
              Freelancer
            </Heading>
          </CardHeader>
          <CardBody position="relative" pt={4}>
            {freelancer ? (
              <Flex align="center" gap={4}>
                <Avatar name={fullName(freelancer)} src={freelancer.avatar_url || undefined} size="lg" />
                <Box minW={0}>
                  <Text color="whiteAlpha.900" fontWeight="bold" fontSize="lg" noOfLines={1}>
                    {fullName(freelancer)}
                  </Text>
                  <HStack mt={1} spacing={2} wrap="wrap">
                    <Text fontSize="sm" color="whiteAlpha.600">
                      @{freelancer.username || "—"}
                    </Text>
                    {roleBadge("freelancer")}
                  </HStack>
                </Box>
              </Flex>
            ) : (
              <Text color="whiteAlpha.600">Freelancer topilmadi</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Chat history */}
      <Card {...GLASS_CARD} position="relative" mb={8}>
        <Box {...SHINE_OVERLAY} />
        <CardHeader position="relative" pb={0}>
          <Heading size="sm" color="whiteAlpha.900">
            Chat tarixi (oxirgi 30)
          </Heading>
        </CardHeader>
        <CardBody position="relative" pt={4}>
          {Array.isArray(dispute.chatHistory) && dispute.chatHistory.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              {dispute.chatHistory.map((m) => {
                const name =
                  `${m.sender_first_name || ""} ${m.sender_last_name || ""}`.trim() ||
                  m.sender_username ||
                  "Unknown";

                const when = m.created_at
                  ? new Date(m.created_at).toLocaleString("uz-UZ", { timeStyle: "short", dateStyle: "short" })
                  : "—";

                return (
                  <Box key={m.id} {...soft} p={4}>
                    <Flex justify="space-between" align="start" gap={4}>
                      <Box minW={0}>
                        <HStack spacing={2} wrap="wrap">
                          <Text color="whiteAlpha.900" fontWeight="semibold" noOfLines={1}>
                            {name}
                          </Text>
                          <Badge
                            bg="rgba(255,255,255,0.08)"
                            color="whiteAlpha.900"
                            border="1px solid rgba(255,255,255,0.12)"
                          >
                            {m.sender_role || "user"}
                          </Badge>
                        </HStack>
                      </Box>
                      <Text fontSize="sm" color="whiteAlpha.600" whiteSpace="nowrap">
                        {when}
                      </Text>
                    </Flex>

                    <Text mt={3} color="whiteAlpha.900" whiteSpace="pre-wrap">
                      {m.type === "text"
                        ? m.content
                        : m.type === "voice"
                        ? "[VOICE]"
                        : m.type === "file"
                        ? `[FILE] ${m.file_url || ""}`
                        : m.content}
                    </Text>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Text color="whiteAlpha.600">Chat tarixi topilmadi</Text>
          )}
        </CardBody>
      </Card>

      {/* Evidence */}
      <Card {...GLASS_CARD} position="relative" mb={8}>
        <Box {...SHINE_OVERLAY} />
        <CardHeader position="relative" pb={0}>
          <Heading size="sm" color="whiteAlpha.900">
            Dalillar (Evidence)
          </Heading>
        </CardHeader>
        <CardBody position="relative" pt={4}>
          {Array.isArray(dispute.evidence_files) && dispute.evidence_files.length > 0 ? (
            <Wrap spacing={3}>
              {dispute.evidence_files.map((file, idx) => (
                <WrapItem key={`${file}-${idx}`}>
                  <Tag
                    size="lg"
                    bg="rgba(30,144,255,0.12)"
                    color="whiteAlpha.900"
                    border="1px solid rgba(30,144,255,0.20)"
                    borderRadius="full"
                    _hover={{ bg: "rgba(30,144,255,0.18)" }}
                  >
                    <TagLabel noOfLines={1} maxW="360px">
                      {String(file)}
                    </TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          ) : (
            <Text color="whiteAlpha.600">Dalillar yo‘q</Text>
          )}
        </CardBody>
      </Card>

      {/* Milestones */}
      <Card {...GLASS_CARD} position="relative" mb={8}>
        <Box {...SHINE_OVERLAY} />
        <CardHeader position="relative" pb={0}>
          <Heading size="sm" color="whiteAlpha.900">
            Milestone lar
          </Heading>
        </CardHeader>
        <CardBody position="relative" pt={4}>
          {Array.isArray(dispute.milestones) && dispute.milestones.length > 0 ? (
            isMobile ? (
              <Stack spacing={3}>
                {dispute.milestones.map((ms) => (
                  <Box key={ms.id} {...soft} p={4}>
                    <Flex justify="space-between" align="start" gap={4}>
                      <Box minW={0}>
                        <Text color="whiteAlpha.900" fontWeight="semibold" noOfLines={1}>
                          {ms.title || "—"}
                        </Text>
                        <Text mt={1} color="whiteAlpha.700" fontSize="sm">
                          {ms.amount != null ? Number(ms.amount).toLocaleString("uz-UZ") : "—"}
                        </Text>
                      </Box>
                      {getMilestoneStatusBadge(ms.status)}
                    </Flex>
                  </Box>
                ))}
              </Stack>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr bg="rgba(255,255,255,0.04)">
                      <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                        Nom
                      </Th>
                      <Th isNumeric color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                        Summa
                      </Th>
                      <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                        Status
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dispute.milestones.map((ms) => (
                      <Tr key={ms.id} _hover={{ bg: "rgba(255,255,255,0.04)" }}>
                        <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900">
                          {ms.title || "—"}
                        </Td>
                        <Td isNumeric borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900">
                          {ms.amount != null ? Number(ms.amount).toLocaleString("uz-UZ") : "—"}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.06)">{getMilestoneStatusBadge(ms.status)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )
          ) : (
            <Text color="whiteAlpha.600">Milestone topilmadi</Text>
          )}
        </CardBody>
      </Card>

      {/* Actions */}
      {dispute.status !== "resolved" && (
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardBody position="relative">
            <Stack direction={{ base: "column", md: "row" }} spacing={3} justify="center">
              <Button
                size="lg"
                onClick={() => openResolveModal("approved")}
                isLoading={acting}
                bg="rgba(0,220,130,0.14)"
                color="whiteAlpha.900"
                border="1px solid rgba(0,220,130,0.22)"
                _hover={{ bg: "rgba(0,220,130,0.20)" }}
              >
                Freelancerga pul (approved)
              </Button>

              <Button
                size="lg"
                onClick={() => openResolveModal("rejected")}
                isLoading={acting}
                bg="rgba(255,0,80,0.10)"
                color="whiteAlpha.900"
                border="1px solid rgba(255,0,80,0.18)"
                _hover={{ bg: "rgba(255,0,80,0.16)" }}
              >
                Clientga refund (rejected)
              </Button>

              <Button size="lg" onClick={fetchDetail} isDisabled={acting} {...glassBtn}>
                Yangilash
              </Button>
            </Stack>
          </CardBody>
        </Card>
      )}

      {/* Resolve Modal (glass) */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.6)" backdropFilter="blur(6px)" />
        <ModalContent
          bg="rgba(10, 18, 38, 0.92)"
          border="1px solid rgba(255,255,255,0.10)"
          borderRadius="2xl"
          color="whiteAlpha.900"
        >
          <ModalHeader>Dispute’ni hal qilish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack mb={3} spacing={3} wrap="wrap">
              <Text fontWeight="semibold">Qaror:</Text>
              <Badge {...(resolution === "approved" ? badgeGreen : badgeRed)} borderRadius="full" px={3} py={1}>
                {resolution}
              </Badge>
            </HStack>

            <Text fontSize="sm" color="whiteAlpha.600" mb={2}>
              Admin izohi (ixtiyoriy):
            </Text>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Masalan: dalillar tekshirildi, ish bajarilgan/bajarilmagan..."
              rows={4}
              bg="rgba(255,255,255,0.06)"
              borderColor="rgba(255,255,255,0.12)"
              _hover={{ borderColor: "rgba(255,255,255,0.20)" }}
              _focus={{
                borderColor: "rgba(66,153,225,0.9)",
                boxShadow: "0 0 0 3px rgba(66,153,225,0.25)",
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} color="whiteAlpha.900">
              Bekor
            </Button>
            <Button
              bg={resolution === "approved" ? "rgba(0,220,130,0.18)" : "rgba(255,0,80,0.14)"}
              border={resolution === "approved" ? "1px solid rgba(0,220,130,0.28)" : "1px solid rgba(255,0,80,0.22)"}
              color="whiteAlpha.900"
              _hover={{ opacity: 0.95 }}
              onClick={doResolve}
              isLoading={acting}
            >
              Tasdiqlash
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
