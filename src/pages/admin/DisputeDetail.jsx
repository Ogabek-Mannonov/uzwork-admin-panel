import React, { useEffect, useState } from "react";
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
  Select,
  Input,
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

  // settlement inputs (Upwork-style)
  const [payoutAction, setPayoutAction] = useState("release_to_freelancer");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutCurrency, setPayoutCurrency] = useState("UZS");
  const [winnerUserId, setWinnerUserId] = useState("");

  const normalize = (res) => {
    const payload = res?.data ?? res;
    return payload?.data?.dispute || payload?.dispute || null;
  };

  const fmtDateTime = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("uz-UZ", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return String(d);
    }
  };

  const money = (amount, currency) => {
    if (amount == null || amount === "") return "—";
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    return `${n.toLocaleString("uz-UZ")} ${currency || ""}`.trim();
  };

  const fullName = (u) =>
    `${u?.first_name || ""} ${u?.last_name || ""}`.trim() ||
    u?.username ||
    "Noma'lum";

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
        badge: {
          bg: "rgba(255,255,255,0.08)",
          color: "whiteAlpha.900",
          border: "1px solid rgba(255,255,255,0.12)",
        },
      },
    };
    const m =
      map[v] || {
        label: v || "—",
        badge: {
          bg: "rgba(255,255,255,0.08)",
          color: "whiteAlpha.900",
          border: "1px solid rgba(255,255,255,0.12)",
        },
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
    const it =
      map[v] || {
        t: v || "—",
        b: {
          bg: "rgba(255,255,255,0.08)",
          color: "whiteAlpha.900",
          border: "1px solid rgba(255,255,255,0.12)",
        },
      };
    return (
      <Badge {...it.b} borderRadius="full" px={3} py={1}>
        {it.t}
      </Badge>
    );
  };

  const setStatus = async (toStatus) => {
    if (!dispute) return;
    try {
      setActing(true);
      const res = await api.patch(`/disputes/${dispute.id}/status`, {
        status: toStatus,
      });
      const payload = res?.data ?? res;
      const updated = payload?.data?.dispute || payload?.dispute;

      setDispute((p) => ({
        ...(p || {}),
        ...(updated || {}),
        status: updated?.status || toStatus,
      }));

      toast({
        title: "OK",
        description: `Status: ${toStatus}`,
        status: "success",
        duration: 1600,
        isClosable: true,
      });

      fetchDetail();
    } catch (e) {
      console.error("setStatus error:", e);
      toast({
        title: "Xato",
        description: "Status o'zgarmadi",
        status: "error",
        duration: 2200,
        isClosable: true,
      });
    } finally {
      setActing(false);
    }
  };

  const openResolveModal = (r) => {
    setResolution(r);
    setAdminNotes(dispute?.admin_notes || "");

    const contractAmount = dispute?.amount != null ? String(dispute.amount) : "";
    setPayoutAmount(contractAmount);

    const cur = dispute?.currency || "UZS";
    setPayoutCurrency(cur);

    const clientId = dispute?.client?.id || "";
    const freelancerId = dispute?.freelancer?.id || "";

    if (r === "approved") {
      setPayoutAction("release_to_freelancer");
      setWinnerUserId(freelancerId || "");
    } else {
      setPayoutAction("refund_to_client");
      setWinnerUserId(clientId || "");
    }

    onOpen();
  };

  const doResolve = async () => {
    if (!dispute) return;

    const pa = payoutAmount === "" ? null : Number(payoutAmount);

    if (pa != null && (!Number.isFinite(pa) || pa <= 0)) {
      toast({
        title: "Xato",
        description: "Payout amount noto'g'ri.",
        status: "error",
        duration: 2200,
        isClosable: true,
      });
      return;
    }

    try {
      setActing(true);
      const res = await api.post(`/disputes/${dispute.id}/resolve`, {
        resolution,
        admin_notes: adminNotes?.trim() ? adminNotes.trim() : null,
        payout_action: payoutAction || null,
        payout_amount: pa,
        payout_currency: payoutCurrency || null,
        winner_user_id: winnerUserId || null,
      });

      const payload = res?.data ?? res;
      const updated = payload?.data?.dispute || payload?.dispute;

      setDispute((p) => ({
        ...(p || {}),
        ...(updated || {}),
      }));

      toast({
        title: "Hal qilindi",
        description:
          resolution === "approved"
            ? "Freelancer foydasiga"
            : "Client foydasiga",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onClose();
      fetchDetail();
    } catch (e) {
      console.error("resolve error:", e);
      toast({
        title: "Xato",
        description: "Resolve bo'lmadi",
        status: "error",
        duration: 2400,
        isClosable: true,
      });
    } finally {
      setActing(false);
    }
  };

  // timeline helpers
  const actionLabel = (a) => {
    const v = String(a || "").toLowerCase();
    if (v === "status_changed") return "Status o'zgardi";
    if (v === "approved") return "Approved";
    if (v === "rejected") return "Rejected";
    if (v === "commented") return "Izoh";
    if (v === "viewed") return "Ko'rildi";
    return v || "—";
  };

  const actionBadge = (a) => {
    const v = String(a || "").toLowerCase();
    if (v === "approved") return badgeGreen;
    if (v === "rejected") return badgeRed;
    if (v === "status_changed") return badgeBlue;
    return {
      bg: "rgba(255,255,255,0.08)",
      color: "whiteAlpha.900",
      border: "1px solid rgba(255,255,255,0.12)",
    };
  };

  const evidenceLabel = (file) => {
    if (typeof file === "string") return file;
    if (file && typeof file === "object") return file.name || file.url || "file";
    return "file";
  };
  const evidenceUrl = (file) => {
    if (file && typeof file === "object") return file.url || null;
    return null;
  };

  // ====== UI guard returns (hooks are all ABOVE this) ======
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

  // ====== computed values AFTER dispute exists (NO hooks here) ======
  const createdAtLabel = fmtDateTime(dispute?.created_at);
  const resolvedAtLabel = fmtDateTime(dispute?.resolved_at);

  const client = dispute.client || null;
  const freelancer = dispute.freelancer || null;

  const roleBadge = (role) => {
    const r = String(role || "").toLowerCase();
    if (r === "client") return <Badge {...badgeRed}>Client</Badge>;
    if (r === "freelancer") return <Badge {...badgePurple}>Freelancer</Badge>;
    if (r === "admin") return <Badge {...badgeBlue}>Admin</Badge>;
    return (
      <Badge
        bg="rgba(255,255,255,0.08)"
        color="whiteAlpha.900"
        border="1px solid rgba(255,255,255,0.12)"
      >
        —
      </Badge>
    );
  };

  const isResolved = String(dispute.status || "").toLowerCase() === "resolved";
  const canReview =
    !isResolved && String(dispute.status || "").toLowerCase() === "open";
  const canBackToOpen =
    !isResolved && String(dispute.status || "").toLowerCase() === "in_review";

  const openChat = dispute?.chat_id ? `/admin/chats/${dispute.chat_id}` : null;

  const outcomeText = (() => {
    if (!isResolved) return null;
    const r = dispute.resolution;
    const pa = dispute.payout_action;
    if (r === "approved" && pa === "release_to_freelancer")
      return "Freelancer foydasiga to'lov chiqarildi";
    if (r === "rejected" && pa === "refund_to_client")
      return "Client foydasiga refund qilindi";
    if (pa === "split") return "Summa bo'lib berildi (split)";
    if (pa === "no_action") return "To'lov harakati qilinmadi";
    return "Dispute hal qilindi";
  })();

  const winnerLabel = (() => {
    const w = dispute.winner_user_id;
    if (!w) return "—";
    if (client?.id && String(w) === String(client.id))
      return `Client: ${fullName(client)}`;
    if (freelancer?.id && String(w) === String(freelancer.id))
      return `Freelancer: ${fullName(freelancer)}`;
    return String(w).slice(0, 8);
  })();

  return (
    <Box>
      {/* HEADER */}
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
                    <Badge
                      bg="rgba(255,255,255,0.08)"
                      color="whiteAlpha.900"
                      border="1px solid rgba(255,255,255,0.12)"
                    >
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
                  Chatga o'tish
                </Button>
              )}

              {canReview && (
                <Button
                  onClick={() => setStatus("in_review")}
                  isLoading={acting}
                  bg="rgba(30,144,255,0.12)"
                  color="whiteAlpha.900"
                  border="1px solid rgba(30,144,255,0.20)"
                  _hover={{ bg: "rgba(30,144,255,0.18)" }}
                >
                  In review qilish
                </Button>
              )}
              {canBackToOpen && (
                <Button
                  onClick={() => setStatus("open")}
                  isLoading={acting}
                  {...glassBtn}
                >
                  Open ga qaytarish
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
                    {money(dispute.amount, dispute.currency)}
                  </Text>
                </Flex>
              )}

              {/* Outcome */}
              {isResolved && (
                <Box {...soft} p={4}>
                  <Text
                    color="whiteAlpha.600"
                    fontSize="xs"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                  >
                    Outcome
                  </Text>
                  <Text mt={1} color="whiteAlpha.900" fontWeight="bold">
                    {outcomeText || "Dispute hal qilindi"}
                  </Text>

                  <Divider my={3} borderColor="rgba(255,255,255,0.10)" />

                  <VStack align="stretch" spacing={2}>
                    <Flex justify="space-between" gap={6}>
                      <Text color="whiteAlpha.700">Qaror</Text>
                      <Badge
                        {...(dispute.resolution === "approved"
                          ? badgeGreen
                          : badgeRed)}
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        {dispute.resolution || "—"}
                      </Badge>
                    </Flex>

                    <Flex justify="space-between" gap={6}>
                      <Text color="whiteAlpha.700">Winner</Text>
                      <Text color="whiteAlpha.900" fontWeight="semibold">
                        {winnerLabel}
                      </Text>
                    </Flex>

                    <Flex justify="space-between" gap={6}>
                      <Text color="whiteAlpha.700">Payout</Text>
                      <Text color="whiteAlpha.900" fontWeight="semibold">
                        {dispute.payout_action ? `${dispute.payout_action}` : "—"}
                        {dispute.payout_amount != null
                          ? ` • ${money(
                              dispute.payout_amount,
                              dispute.payout_currency || dispute.currency
                            )}`
                          : ""}
                      </Text>
                    </Flex>

                    <Flex justify="space-between" gap={6}>
                      <Text color="whiteAlpha.700">Resolved at</Text>
                      <Text color="whiteAlpha.900" fontWeight="semibold">
                        {resolvedAtLabel}
                      </Text>
                    </Flex>

                    {dispute.resolved_by && (
                      <Flex justify="space-between" gap={6}>
                        <Text color="whiteAlpha.700">Resolved by</Text>
                        <Text color="whiteAlpha.900" fontWeight="semibold">
                          {String(dispute.resolved_by).slice(0, 8)}
                        </Text>
                      </Flex>
                    )}
                  </VStack>
                </Box>
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
                <Avatar
                  name={fullName(client)}
                  src={client.avatar_url || undefined}
                  size="lg"
                />
                <Box minW={0}>
                  <Text
                    color="whiteAlpha.900"
                    fontWeight="bold"
                    fontSize="lg"
                    noOfLines={1}
                  >
                    {fullName(client)}
                  </Text>
                  <HStack mt={1} spacing={2} wrap="wrap">
                    <Text fontSize="sm" color="whiteAlpha.600">
                      @{client.username || "—"}
                    </Text>
                    {roleBadge("client")}
                    {client.id && (
                      <Badge
                        bg="rgba(255,255,255,0.08)"
                        color="whiteAlpha.900"
                        border="1px solid rgba(255,255,255,0.12)"
                      >
                        {String(client.id).slice(0, 8)}
                      </Badge>
                    )}
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
                <Avatar
                  name={fullName(freelancer)}
                  src={freelancer.avatar_url || undefined}
                  size="lg"
                />
                <Box minW={0}>
                  <Text
                    color="whiteAlpha.900"
                    fontWeight="bold"
                    fontSize="lg"
                    noOfLines={1}
                  >
                    {fullName(freelancer)}
                  </Text>
                  <HStack mt={1} spacing={2} wrap="wrap">
                    <Text fontSize="sm" color="whiteAlpha.600">
                      @{freelancer.username || "—"}
                    </Text>
                    {roleBadge("freelancer")}
                    {freelancer.id && (
                      <Badge
                        bg="rgba(255,255,255,0.08)"
                        color="whiteAlpha.900"
                        border="1px solid rgba(255,255,255,0.12)"
                      >
                        {String(freelancer.id).slice(0, 8)}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </Flex>
            ) : (
              <Text color="whiteAlpha.600">Freelancer topilmadi</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Case activity */}
      <Card {...GLASS_CARD} position="relative" mb={8}>
        <Box {...SHINE_OVERLAY} />
        <CardHeader position="relative" pb={0}>
          <Heading size="sm" color="whiteAlpha.900">
            Case activity
          </Heading>
        </CardHeader>
        <CardBody position="relative" pt={4}>
          {Array.isArray(dispute.actions) && dispute.actions.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              {dispute.actions.map((a) => {
                const actor =
                  `${a.actor_first_name || ""} ${a.actor_last_name || ""}`.trim() ||
                  a.actor_username ||
                  (a.actor_id ? String(a.actor_id).slice(0, 8) : "—");

                const when = fmtDateTime(a.created_at);
                const metaText =
                  a.meta && typeof a.meta === "object"
                    ? JSON.stringify(a.meta)
                    : a.meta
                    ? String(a.meta)
                    : "";

                return (
                  <Box key={a.id} {...soft} p={4}>
                    <Flex justify="space-between" align="start" gap={4}>
                      <Box minW={0}>
                        <HStack spacing={2} wrap="wrap">
                          <Badge
                            {...actionBadge(a.action)}
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {actionLabel(a.action)}
                          </Badge>
                          <Text
                            color="whiteAlpha.900"
                            fontWeight="semibold"
                            noOfLines={1}
                          >
                            {actor}
                          </Text>
                          {a.actor_role && (
                            <Badge
                              bg="rgba(255,255,255,0.08)"
                              color="whiteAlpha.900"
                              border="1px solid rgba(255,255,255,0.12)"
                            >
                              {a.actor_role}
                            </Badge>
                          )}
                        </HStack>

                        {(a.from_status || a.to_status) && (
                          <Text mt={2} color="whiteAlpha.700" fontSize="sm">
                            {a.from_status ? `from ${a.from_status}` : "from —"} →{" "}
                            {a.to_status ? `to ${a.to_status}` : "to —"}
                          </Text>
                        )}

                        {metaText && (
                          <Text
                            mt={2}
                            color="whiteAlpha.700"
                            fontSize="sm"
                            noOfLines={3}
                          >
                            {metaText}
                          </Text>
                        )}
                      </Box>

                      <Text
                        fontSize="sm"
                        color="whiteAlpha.600"
                        whiteSpace="nowrap"
                      >
                        {when}
                      </Text>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Text color="whiteAlpha.600">Hozircha activity yo'q</Text>
          )}
        </CardBody>
      </Card>

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
                  ? new Date(m.created_at).toLocaleString("uz-UZ", {
                      timeStyle: "short",
                      dateStyle: "short",
                    })
                  : "—";

                return (
                  <Box key={m.id} {...soft} p={4}>
                    <Flex justify="space-between" align="start" gap={4}>
                      <Box minW={0}>
                        <HStack spacing={2} wrap="wrap">
                          <Text
                            color="whiteAlpha.900"
                            fontWeight="semibold"
                            noOfLines={1}
                          >
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
                      <Text
                        fontSize="sm"
                        color="whiteAlpha.600"
                        whiteSpace="nowrap"
                      >
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
          {Array.isArray(dispute.evidence_files) &&
          dispute.evidence_files.length > 0 ? (
            <Wrap spacing={3}>
              {dispute.evidence_files.map((file, idx) => {
                const label = evidenceLabel(file);
                const url = evidenceUrl(file);
                return (
                  <WrapItem key={`${label}-${idx}`}>
                    <Tag
                      size="lg"
                      bg="rgba(30,144,255,0.12)"
                      color="whiteAlpha.900"
                      border="1px solid rgba(30,144,255,0.20)"
                      borderRadius="full"
                      _hover={{ bg: "rgba(30,144,255,0.18)" }}
                      cursor={url ? "pointer" : "default"}
                      onClick={() => {
                        if (url) window.open(url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <TagLabel noOfLines={1} maxW="360px">
                        {label}
                      </TagLabel>
                    </Tag>
                  </WrapItem>
                );
              })}
            </Wrap>
          ) : (
            <Text color="whiteAlpha.600">Dalillar yo'q</Text>
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
                        <Text
                          color="whiteAlpha.900"
                          fontWeight="semibold"
                          noOfLines={1}
                        >
                          {ms.title || "—"}
                        </Text>
                        <Text mt={1} color="whiteAlpha.700" fontSize="sm">
                          {ms.amount != null
                            ? Number(ms.amount).toLocaleString("uz-UZ")
                            : "—"}
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
                      <Th
                        color="whiteAlpha.700"
                        borderColor="rgba(255,255,255,0.08)"
                      >
                        Nom
                      </Th>
                      <Th
                        isNumeric
                        color="whiteAlpha.700"
                        borderColor="rgba(255,255,255,0.08)"
                      >
                        Summa
                      </Th>
                      <Th
                        color="whiteAlpha.700"
                        borderColor="rgba(255,255,255,0.08)"
                      >
                        Status
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dispute.milestones.map((ms) => (
                      <Tr
                        key={ms.id}
                        _hover={{ bg: "rgba(255,255,255,0.04)" }}
                      >
                        <Td
                          borderColor="rgba(255,255,255,0.06)"
                          color="whiteAlpha.900"
                        >
                          {ms.title || "—"}
                        </Td>
                        <Td
                          isNumeric
                          borderColor="rgba(255,255,255,0.06)"
                          color="whiteAlpha.900"
                        >
                          {ms.amount != null
                            ? Number(ms.amount).toLocaleString("uz-UZ")
                            : "—"}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.06)">
                          {getMilestoneStatusBadge(ms.status)}
                        </Td>
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
      {!isResolved && (
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardBody position="relative">
            <Stack
              direction={{ base: "column", md: "row" }}
              spacing={3}
              justify="center"
            >
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

              <Button
                size="lg"
                onClick={fetchDetail}
                isDisabled={acting}
                {...glassBtn}
              >
                Yangilash
              </Button>
            </Stack>
          </CardBody>
        </Card>
      )}

      {/* Resolve Modal */}
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
              <Badge
                {...(resolution === "approved" ? badgeGreen : badgeRed)}
                borderRadius="full"
                px={3}
                py={1}
              >
                {resolution}
              </Badge>
            </HStack>

            <Box {...soft} p={4} mb={4}>
              <Text
                color="whiteAlpha.600"
                fontSize="xs"
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                Settlement
              </Text>

              <Stack mt={3} spacing={3}>
                <Box>
                  <Text fontSize="sm" color="whiteAlpha.600" mb={1}>
                    Payout action
                  </Text>
                  <Select
                    value={payoutAction}
                    onChange={(e) => setPayoutAction(e.target.value)}
                    {...inputStyle}
                  >
                    <option style={{ background: "#0A1226", color: "#fff" }} value="release_to_freelancer">
                      release_to_freelancer
                    </option>
                    <option style={{ background: "#0A1226", color: "#fff" }} value="refund_to_client">
                      refund_to_client
                    </option>
                    <option style={{ background: "#0A1226", color: "#fff" }} value="split">
                      split
                    </option>
                    <option style={{ background: "#0A1226", color: "#fff" }} value="no_action">
                      no_action
                    </option>
                  </Select>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600" mb={1}>
                      Payout amount
                    </Text>
                    <Input
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="500000"
                      inputMode="numeric"
                      {...inputStyle}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600" mb={1}>
                      Currency
                    </Text>
                    <Input
                      value={payoutCurrency}
                      onChange={(e) => setPayoutCurrency(e.target.value)}
                      placeholder="UZS"
                      {...inputStyle}
                    />
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" color="whiteAlpha.600" mb={1}>
                    Winner
                  </Text>
                  <Select
                    value={winnerUserId}
                    onChange={(e) => setWinnerUserId(e.target.value)}
                    {...inputStyle}
                  >
                    <option style={{ background: "#0A1226", color: "#fff" }} value="">
                      Tanlang...
                    </option>
                    {client?.id && (
                      <option style={{ background: "#0A1226", color: "#fff" }} value={client.id}>
                        Client — {fullName(client)}
                      </option>
                    )}
                    {freelancer?.id && (
                      <option style={{ background: "#0A1226", color: "#fff" }} value={freelancer.id}>
                        Freelancer — {fullName(freelancer)}
                      </option>
                    )}
                  </Select>
                  <Text mt={2} fontSize="xs" color="whiteAlpha.600">
                    (Winner tanlanmasa ham resolve bo'ladi, lekin Upwork-style uchun tavsiya.)
                  </Text>
                </Box>
              </Stack>
            </Box>

            <Text fontSize="sm" color="whiteAlpha.600" mb={2}>
              Admin izohi (ixtiyoriy):
            </Text>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Masalan: dalillar tekshirildi, ish bajarilgan/bajarilmagan..."
              rows={4}
              {...inputStyle}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              color="whiteAlpha.900"
            >
              Bekor
            </Button>
            <Button
              bg={
                resolution === "approved"
                  ? "rgba(0,220,130,0.18)"
                  : "rgba(255,0,80,0.14)"
              }
              border={
                resolution === "approved"
                  ? "1px solid rgba(0,220,130,0.28)"
                  : "1px solid rgba(255,0,80,0.22)"
              }
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
