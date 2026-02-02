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
} from "@chakra-ui/react";
import { ArrowLeftIcon } from "@chakra-ui/icons";
import { useParams, Link } from "react-router-dom";
import { fetchPaymentDetail } from "../../lib/payments";

const typeMeta = {
  deposit: { color: "green", label: "Depozit" },
  withdrawal: { color: "orange", label: "Yechib olish" },
  escrow_hold: { color: "blue", label: "Escrow hold" },
  escrow_release: { color: "blue", label: "Escrow chiqarish" },
  fee: { color: "purple", label: "Platforma haqi" },
  refund: { color: "red", label: "Qaytarish" },
};

const statusMeta = {
  completed: { color: "green", label: "Muvaffaqiyatli" },
  pending: { color: "yellow", label: "Kutilmoqda" },
  in_progress: { color: "blue", label: "Jarayonda" },
  failed: { color: "red", label: "Muvaffaqiyatsiz" },
};

const moneyUZS = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount ?? "-");
  return `${new Intl.NumberFormat("uz-UZ").format(n)} so'm`;
};

function UserMiniCard({ title, user, to }) {
  if (!user) return null;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  const card = (
    <Card
      _hover={to ? { boxShadow: "md", transform: "translateY(-1px)" } : undefined}
      transition="all .15s ease"
      cursor={to ? "pointer" : "default"}
    >
      <CardHeader>
        <Heading size="sm">{title}</Heading>
      </CardHeader>
      <CardBody>
        <Flex align="center" gap={3}>
          <Avatar name={fullName || user.username || "User"} size="md" />
          <Box>
            <Text fontWeight="semibold">{fullName || "—"}</Text>
            <Text color="gray.600">@{user.username || "—"}</Text>
            {user.email && (
              <Text fontSize="sm" color="gray.600">
                {user.email}
              </Text>
            )}
            {user.phone && (
              <Text fontSize="sm" color="gray.600">
                {user.phone}
              </Text>
            )}
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  // ✅ to berilgan bo‘lsa karta bosilganda UserDetailga o‘tadi
  return to ? (
    <Link to={to} style={{ textDecoration: "none" }}>
      {card}
    </Link>
  ) : (
    card
  );
}

export default function PaymentDetail() {
  const { paymentId } = useParams();

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
    const meta = typeMeta[tx.type] || { color: "gray", label: tx.type };
    return (
      <Badge colorScheme={meta.color} fontSize="md" px={3} py={1} borderRadius="full">
        {meta.label}
      </Badge>
    );
  }, [tx]);

  const statusBadge = useMemo(() => {
    if (!tx) return null;
    const meta = statusMeta[tx.status] || { color: "gray", label: tx.status };
    return (
      <Badge colorScheme={meta.color} fontSize="md" px={3} py={1} borderRadius="full">
        {meta.label}
      </Badge>
    );
  }, [tx]);

  return (
    <Box>
      <Flex align="center" mb={6} gap={4}>
        <Link to="/admin/payments">
          <IconButton icon={<ArrowLeftIcon />} colorScheme="gray" variant="ghost" size="lg" aria-label="Back" />
        </Link>
        <Heading size="xl">To‘lov tafsilotlari</Heading>
        <Badge fontSize="lg" colorScheme="orange">
          Transaction #{paymentId}
        </Badge>
      </Flex>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading ? (
        <Flex py={12} justify="center">
          <Spinner size="lg" />
        </Flex>
      ) : tx ? (
        <>
          <HStack mb={6} spacing={4}>
            {typeBadge}
            {statusBadge}
            <Tag colorScheme="teal" variant="subtle">
              <TagLabel>{tx.gateway || "—"}</TagLabel>
            </Tag>
          </HStack>

          {/* ✅ USERS */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
            <UserMiniCard title="Transaction egasi" user={users.owner}  to={users.owner?.id ? `/admin/users/${users.owner.id}` : undefined}/>
            <UserMiniCard title="Client" user={users.client} to={users.client?.id ? `/admin/users/${users.client.id}` : undefined}/>
            {/* ✅ Freelancer kartasi bosilganda UserDetailga o‘tadi */}
            <UserMiniCard
              title="Freelancer"
              user={users.freelancer}
              to={users.freelancer?.id ? `/admin/users/${users.freelancer.id}` : undefined}
            />
          </SimpleGrid>

          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Umumiy ma’lumotlar</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between">
                  <Text fontWeight="medium">ID</Text>
                  <Text fontWeight="semibold">#{tx.id}</Text>
                </Flex>

                <Flex justify="space-between">
                  <Text fontWeight="medium">Summa</Text>
                  <Text fontSize="xl" fontWeight="bold">
                    {moneyUZS(tx.amount)}
                  </Text>
                </Flex>

                <Flex justify="space-between">
                  <Text fontWeight="medium">Valyuta</Text>
                  <Text>{tx.currency || "UZS"}</Text>
                </Flex>

                <Flex justify="space-between">
                  <Text fontWeight="medium">Gateway transaction ID</Text>
                  <Text>{tx.gateway_transaction_id || "-"}</Text>
                </Flex>

                <Divider />

                <Flex justify="space-between">
                  <Text fontWeight="medium">Yaratilgan</Text>
                  <Text>{tx.created_at ? new Date(tx.created_at).toLocaleString() : "-"}</Text>
                </Flex>

                <Flex justify="space-between">
                  <Text fontWeight="medium">Yangilangan</Text>
                  <Text>{tx.updated_at ? new Date(tx.updated_at).toLocaleString() : "-"}</Text>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Metadata</Heading>
            </CardHeader>
            <CardBody>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Key</Th>
                    <Th>Value</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(tx.metadata || {}).length === 0 ? (
                    <Tr>
                      <Td colSpan={2}>
                        <Text color="gray.500">Metadata yo‘q</Text>
                      </Td>
                    </Tr>
                  ) : (
                    Object.entries(tx.metadata || {}).map(([k, v]) => (
                      <Tr key={k}>
                        <Td>{k}</Td>
                        <Td whiteSpace="pre-wrap">{typeof v === "string" ? v : JSON.stringify(v)}</Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </>
      ) : null}
    </Box>
  );
}
