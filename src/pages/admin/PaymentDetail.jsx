import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Divider,
  VStack,
  HStack,
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
  Avatar,
  SimpleGrid,
  TableContainer,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ArrowLeftIcon } from "@chakra-ui/icons";
import { useParams, Link } from "react-router-dom";
import { fetchPaymentDetail } from "../../lib/payments";

/* ===== GLASS THEME (Admin dark) ===== */
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

const softTag = {
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "whiteAlpha.900",
};

const typeMeta = {
  deposit: { badge: badgeGreen, label: "Depozit" },
  withdrawal: { badge: badgeOrange, label: "Yechib olish" },
  escrow_hold: { badge: badgeBlue, label: "Escrow hold" },
  escrow_release: { badge: badgeBlue, label: "Escrow chiqarish" },
  fee: { badge: badgePurple, label: "Platforma haqi" },
  refund: { badge: badgeRed, label: "Qaytarish" },
};

const statusMeta = {
  completed: { badge: badgeGreen, label: "Muvaffaqiyatli" },
  pending: { badge: badgeOrange, label: "Kutilmoqda" },
  in_progress: { badge: badgeBlue, label: "Jarayonda" },
  failed: { badge: badgeRed, label: "Muvaffaqiyatsiz" },
};

const moneyUZS = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount ?? "-");
  return `${new Intl.NumberFormat("uz-UZ").format(n)} so'm`;
};

const shortId = (id, left = 10, right = 6) => {
  const s = String(id || "");
  if (s.length <= left + right + 3) return s;
  return `${s.slice(0, left)}...${s.slice(-right)}`;
};

function UserMiniCard({ title, user, to }) {
  if (!user) return null;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  const content = (
    <Card {...GLASS_CARD} position="relative" h="100%">
      <Box {...SHINE_OVERLAY} />
      <CardHeader position="relative" pb={2}>
        <Text color="whiteAlpha.600" fontSize="xs" letterSpacing="0.08em" textTransform="uppercase">
          {title}
        </Text>
      </CardHeader>

      <CardBody position="relative" pt={2}>
        <Flex align="center" gap={3}>
          <Avatar
            name={fullName || user.username || "User"}
            size="md"
            bg="rgba(255,255,255,0.08)"
            border="1px solid rgba(255,255,255,0.10)"
          />
          <Box minW={0}>
            <Text color="whiteAlpha.900" fontWeight="bold" noOfLines={1}>
              {fullName || "—"}
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm" noOfLines={1}>
              @{user.username || "—"}
            </Text>

            {user.email && (
              <Text fontSize="sm" color="whiteAlpha.700" noOfLines={1}>
                {user.email}
              </Text>
            )}
            {user.phone && (
              <Text fontSize="sm" color="whiteAlpha.700" noOfLines={1}>
                {user.phone}
              </Text>
            )}
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  return to ? (
    <Link to={to} style={{ textDecoration: "none" }}>
      <Box
        _hover={{ transform: "translateY(-2px)" }}
        transition="all .16s ease"
      >
        {content}
      </Box>
    </Link>
  ) : (
    content
  );
}

export default function PaymentDetail() {
  const { paymentId } = useParams();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [tx, setTx] = useState(null);
  const [users, setUsers] = useState({ owner: null, client: null, freelancer: null });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchPaymentDetail(paymentId);
      if (!res.success) throw new Error(res.message || "Xatolik");

      setTx(res.data.transaction);
      setUsers(res.data.users || { owner: null, client: null, freelancer: null });
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const typeBadge = useMemo(() => {
    if (!tx) return null;
    const meta = typeMeta[tx.type] || { badge: {}, label: tx.type };
    return (
      <Badge {...(meta.badge || {})} px={3} py={1} borderRadius="full" fontWeight="bold">
        {meta.label}
      </Badge>
    );
  }, [tx]);

  const statusBadge = useMemo(() => {
    if (!tx) return null;
    const meta = statusMeta[tx.status] || { badge: {}, label: tx.status };
    return (
      <Badge {...(meta.badge || {})} px={3} py={1} borderRadius="full" fontWeight="bold">
        {meta.label}
      </Badge>
    );
  }, [tx]);

  const gatewayTag = useMemo(() => {
    if (!tx) return null;
    return (
      <Tag borderRadius="full" {...softTag}>
        <TagLabel>{tx.gateway || "—"}</TagLabel>
      </Tag>
    );
  }, [tx]);

  return (
    <Box>
      {/* HEADER */}
      <Card {...GLASS_CARD} position="relative" mb={6}>
        <Box {...SHINE_OVERLAY} />
        <CardBody position="relative">
          <Flex align="center" justify="space-between" gap={4} wrap="wrap">
            <HStack spacing={3}>
              <Link to="/admin/payments">
                <IconButton
                  icon={<ArrowLeftIcon />}
                  aria-label="Back"
                  variant="ghost"
                  color="whiteAlpha.900"
                  bg="rgba(255,255,255,0.06)"
                  border="1px solid rgba(255,255,255,0.10)"
                  _hover={{ bg: "rgba(255,255,255,0.09)" }}
                />
              </Link>

              <Box>
                <Heading size="lg" color="whiteAlpha.900" lineHeight="1.1">
                  To‘lov tafsilotlari
                </Heading>
                <Text mt={1} fontSize="sm" color="whiteAlpha.600">
                  Transaction ID:{" "}
                  <Text as="span" color="whiteAlpha.800" fontWeight="semibold">
                    #{shortId(paymentId, 14, 8)}
                  </Text>
                </Text>
              </Box>
            </HStack>

            <Badge {...badgeBlue} borderRadius="full" px={3} py={1.5} fontWeight="semibold">
              Transaction #{paymentId ? String(paymentId).slice(0, 8) : "—"}
            </Badge>
          </Flex>

          {tx && (
            <Flex mt={4} gap={3} wrap="wrap" align="center">
              {typeBadge}
              {statusBadge}
              {gatewayTag}
              {tx.currency && (
                <Tag borderRadius="full" {...softTag}>
                  <TagLabel>{tx.currency}</TagLabel>
                </Tag>
              )}
            </Flex>
          )}
        </CardBody>
      </Card>

      {error && (
        <Alert
          status="error"
          borderRadius="xl"
          mb={4}
          bg="rgba(255,0,80,0.10)"
          border="1px solid rgba(255,0,80,0.18)"
          color="whiteAlpha.900"
        >
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading ? (
        <Flex py={12} justify="center" align="center">
          <Spinner size="lg" color="blue.300" thickness="4px" />
          <Text ml={4} color="whiteAlpha.800">
            To‘lov yuklanmoqda...
          </Text>
        </Flex>
      ) : tx ? (
        <>
          {/* USERS */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
            <UserMiniCard
              title="Transaction egasi"
              user={users.owner}
              to={users.owner?.id ? `/admin/users/${users.owner.id}` : undefined}
            />
            <UserMiniCard
              title="Client"
              user={users.client}
              to={users.client?.id ? `/admin/users/${users.client.id}` : undefined}
            />
            <UserMiniCard
              title="Freelancer"
              user={users.freelancer}
              to={users.freelancer?.id ? `/admin/users/${users.freelancer.id}` : undefined}
            />
          </SimpleGrid>

          {/* SUMMARY */}
          <Card {...GLASS_CARD} position="relative" mb={6}>
            <Box {...SHINE_OVERLAY} />
            <CardHeader position="relative" pb={2}>
              <Heading size="md" color="whiteAlpha.900">
                Umumiy ma’lumotlar
              </Heading>
            </CardHeader>

            <CardBody position="relative">
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" gap={4} wrap="wrap">
                  <Text color="whiteAlpha.600">ID</Text>
                  <Text color="whiteAlpha.900" fontWeight="bold" wordBreak="break-all">
                    #{tx.id}
                  </Text>
                </Flex>

                <Flex justify="space-between" gap={4} wrap="wrap">
                  <Text color="whiteAlpha.600">Summa</Text>
                  <Text color="whiteAlpha.900" fontSize="2xl" fontWeight="extrabold">
                    {moneyUZS(tx.amount)}
                  </Text>
                </Flex>

                <Flex justify="space-between" gap={4} wrap="wrap">
                  <Text color="whiteAlpha.600">Valyuta</Text>
                  <Text color="whiteAlpha.900">{tx.currency || "UZS"}</Text>
                </Flex>

                <Flex justify="space-between" gap={4} wrap="wrap">
                  <Text color="whiteAlpha.600">Gateway transaction ID</Text>
                  <Text color="whiteAlpha.900" wordBreak="break-all" maxW={{ base: "100%", md: "70%" }}>
                    {tx.gateway_transaction_id || "—"}
                  </Text>
                </Flex>

                <Divider borderColor="rgba(255,255,255,0.12)" />

                <Flex justify="space-between" gap={4} wrap="wrap">
                  <Text color="whiteAlpha.600">Yaratilgan</Text>
                  <Text color="whiteAlpha.900">
                    {tx.created_at ? new Date(tx.created_at).toLocaleString() : "—"}
                  </Text>
                </Flex>

                <Flex justify="space-between" gap={4} wrap="wrap">
                  <Text color="whiteAlpha.600">Yangilangan</Text>
                  <Text color="whiteAlpha.900">
                    {tx.updated_at ? new Date(tx.updated_at).toLocaleString() : "—"}
                  </Text>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* METADATA */}
          <Card {...GLASS_CARD} position="relative">
            <Box {...SHINE_OVERLAY} />
            <CardHeader position="relative" pb={2}>
              <Heading size="md" color="whiteAlpha.900">
                Metadata
              </Heading>
              <Text mt={1} fontSize="sm" color="whiteAlpha.600">
                Transaction qo‘shimcha ma’lumotlari
              </Text>
            </CardHeader>

            <CardBody position="relative">
              {Object.entries(tx.metadata || {}).length === 0 ? (
                <Text color="whiteAlpha.600">Metadata yo‘q</Text>
              ) : isMobile ? (
                <Stack spacing={3}>
                  {Object.entries(tx.metadata || {}).map(([k, v]) => (
                    <Box
                      key={k}
                      p={4}
                      borderRadius="xl"
                      bg="rgba(255,255,255,0.06)"
                      border="1px solid rgba(255,255,255,0.10)"
                    >
                      <Text fontSize="xs" letterSpacing="0.08em" textTransform="uppercase" color="whiteAlpha.600">
                        {k}
                      </Text>
                      <Text mt={1} color="whiteAlpha.900" whiteSpace="pre-wrap" wordBreak="break-word">
                        {typeof v === "string" ? v : JSON.stringify(v, null, 2)}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr bg="rgba(255,255,255,0.04)">
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          Key
                        </Th>
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          Value
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(tx.metadata || {}).map(([k, v]) => (
                        <Tr key={k} _hover={{ bg: "rgba(255,255,255,0.04)" }} transition="background 0.12s">
                          <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900" fontWeight="semibold">
                            {k}
                          </Td>
                          <Td
                            borderColor="rgba(255,255,255,0.06)"
                            color="whiteAlpha.900"
                            whiteSpace="pre-wrap"
                            wordBreak="break-word"
                          >
                            {typeof v === "string" ? v : JSON.stringify(v, null, 2)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </>
      ) : null}
    </Box>
  );
}
