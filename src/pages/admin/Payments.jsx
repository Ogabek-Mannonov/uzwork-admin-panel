import React, { useEffect, useMemo, useState } from "react";
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
  Spinner,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { fetchMyPayments } from "../../lib/payments";

/* ===== UI META ===== */
const typeMeta = {
  deposit: { color: "green", label: "Depozit" },
  withdrawal: { color: "orange", label: "Yechib olish" },
  escrow_hold: { color: "blue", label: "Escrow hold" },
  escrow_release: { color: "blue", label: "Escrow chiqarish" },
  fee: { color: "purple", label: "Platforma haqi" },
};

const statusMeta = {
  completed: { color: "green", label: "Muvaffaqiyatli" },
  pending: { color: "yellow", label: "Kutilmoqda" },
  failed: { color: "red", label: "Muvaffaqiyatsiz" },
};

const moneyUZS = (n) =>
  Number.isFinite(Number(n))
    ? `${new Intl.NumberFormat("uz-UZ").format(n)} so'm`
    : "-";

export default function Payments() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p = { page, limit };
    if (type) p.type = type;
    if (status) p.status = status;
    return p;
  }, [page, limit, type, status]);

  const loadPayments = async () => {
    console.group("🔵 LOAD PAYMENTS");
    console.log("➡️ Params:", params);

    setLoading(true);
    setError("");

    try {
      const res = await fetchMyPayments(params);
      console.log("✅ API RESPONSE:", res);

      if (!res.success) {
        throw new Error(res.message || "Backend error");
      }

      const txs = res.data.transactions || [];
      const pg = res.data.pagination || {};

      setItems(txs);
      setPagination({
        page: pg.page || 1,
        limit: pg.limit || limit,
        total: pg.total || 0,
        totalPages: pg.totalPages || 1,
      });
    } catch (e) {
      console.error("❌ PAYMENTS ERROR:", e);
      setError(e.message || "To‘lovlarni yuklashda xatolik");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter((t) =>
      [t.id, t.type, t.status, t.gateway, t.amount]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [items, q]);

  const TypeBadge = ({ v }) => {
    const m = typeMeta[v] || { color: "gray", label: v };
    return <Badge colorScheme={m.color}>{m.label}</Badge>;
  };

  const StatusBadge = ({ v }) => {
    const m = statusMeta[v] || { color: "gray", label: v };
    return <Badge colorScheme={m.color}>{m.label}</Badge>;
  };

  return (
    <Box>
      <Heading size="xl" mb={8}>To‘lovlar</Heading>

      <HStack mb={6} spacing={4} flexWrap="wrap">
        <InputGroup maxW="420px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish" />
        </InputGroup>

        <Select placeholder="Turi" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="deposit">Depozit</option>
          <option value="withdrawal">Yechib olish</option>
        </Select>

        <Select placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="completed">Muvaffaqiyatli</option>
          <option value="pending">Kutilmoqda</option>
          <option value="failed">Xato</option>
        </Select>

        <Button onClick={() => { setQ(""); setType(""); setStatus(""); setPage(1); }}>
          Tozalash
        </Button>
      </HStack>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />{error}
        </Alert>
      )}

      {loading ? (
        <Flex justify="center" py={10}><Spinner size="lg" /></Flex>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th><Th>Turi</Th><Th>Summa</Th><Th>Gateway</Th><Th>Status</Th><Th>Sana</Th><Th />
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((tx) => (
              <Tr key={tx.id}>
                <Td>#{tx.id}</Td>
                <Td><TypeBadge v={tx.type} /></Td>
                <Td>{moneyUZS(tx.amount)}</Td>
                <Td><Tag><TagLabel>{tx.gateway}</TagLabel></Tag></Td>
                <Td><StatusBadge v={tx.status} /></Td>
                <Td>{new Date(tx.created_at).toLocaleString()}</Td>
                <Td>
                  <Link to={`/admin/payments/${tx.id}`}>
                    <Button size="sm" leftIcon={<ViewIcon />}>Ko‘rish</Button>
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
