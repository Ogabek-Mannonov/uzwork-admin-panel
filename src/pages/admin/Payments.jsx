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
  Card,
  CardBody,
  TableContainer,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { fetchMyPayments } from "../../lib/payments";

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
  bgGradient:
    "linear(to-b, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
};

const inputDark = {
  h: "44px",
  borderRadius: "xl",
  bg: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.14)",
  color: "whiteAlpha.900",
  _placeholder: { color: "whiteAlpha.600" },
  _hover: { borderColor: "rgba(255,255,255,0.22)" },
  _focus: {
    borderColor: "rgba(66,153,225,0.9)",
    boxShadow: "0 0 0 3px rgba(66,153,225,0.20)",
  },
};

const btnPrimary = {
  h: "44px",
  borderRadius: "xl",
  fontWeight: "bold",
  bgGradient: "linear(to-r, #1E90FF, #2B6CB0)",
  color: "white",
  boxShadow: "0 16px 30px rgba(30,144,255,0.22)",
  _hover: {
    transform: "translateY(-1px)",
    boxShadow: "0 20px 34px rgba(30,144,255,0.30)",
  },
  _active: { transform: "translateY(0px)" },
  transition: "all 0.18s",
};

const btnGhost = {
  h: "44px",
  borderRadius: "xl",
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(255,255,255,0.09)" },
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
const badgeOrange = {
  bg: "rgba(255,170,0,0.14)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(255,170,0,0.22)",
};
const badgePurple = {
  bg: "rgba(170,90,255,0.16)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(170,90,255,0.26)",
};

/* ===== UI META ===== */
const typeMeta = {
  deposit: { badge: badgeGreen, label: "Depozit" },
  withdrawal: { badge: badgeOrange, label: "Yechib olish" },
  escrow_hold: { badge: badgeBlue, label: "Escrow hold" },
  escrow_release: { badge: badgeBlue, label: "Escrow chiqarish" },
  fee: { badge: badgePurple, label: "Platforma haqi" },
};

const statusMeta = {
  completed: { badge: badgeGreen, label: "Muvaffaqiyatli" },
  pending: { badge: badgeOrange, label: "Kutilmoqda" },
  failed: { badge: badgeRed, label: "Muvaffaqiyatsiz" },
};

const moneyUZS = (n) =>
  Number.isFinite(Number(n))
    ? `${new Intl.NumberFormat("uz-UZ").format(n)} so'm`
    : "-";

const shortId = (id, left = 10, right = 6) => {
  const s = String(id || "");
  if (s.length <= left + right + 3) return s;
  return `${s.slice(0, left)}...${s.slice(-right)}`;
};

export default function Payments() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  // filters (server-side)
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("created_desc"); // created_desc | created_asc | amount_desc | amount_asc

  const [page, setPage] = useState(1);
  const limit = 20;

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p = { page, limit, q, sort };
    if (type) p.type = type;
    if (status) p.status = status;
    return p;
  }, [page, limit, q, sort, type, status]);

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchMyPayments(params);
      if (!res?.success) throw new Error(res?.message || "Xatolik");

      setItems(res?.data?.transactions || []);
      setPagination(
        res?.data?.pagination || { page: 1, limit, total: 0, totalPages: 1 }
      );
    } catch (e) {
      setError(e?.message || "To‘lovlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const TypeBadge = ({ v }) => {
    const m = typeMeta[v] || { badge: {}, label: v || "-" };
    return (
      <Badge
        {...(m.badge || {})}
        borderRadius="lg"
        px={3}
        py={1}
        fontSize="xs"
        fontWeight="bold"
      >
        {m.label}
      </Badge>
    );
  };

  const StatusBadge = ({ v }) => {
    const m = statusMeta[v] || { badge: {}, label: v || "-" };
    return (
      <Badge
        {...(m.badge || {})}
        borderRadius="lg"
        px={3}
        py={1}
        fontSize="xs"
        fontWeight="bold"
      >
        {m.label}
      </Badge>
    );
  };

  const resetFilters = () => {
    setQ("");
    setType("");
    setStatus("");
    setSort("created_desc");
    setPage(1);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="whiteAlpha.900">
            To‘lovlar
          </Heading>
          <Text mt={1} color="whiteAlpha.600" fontSize="sm">
            Qidirish + filter + sort + pagination (server-side)
          </Text>
        </Box>

        <Badge
          {...badgeBlue}
          borderRadius="full"
          px={3}
          py={1.5}
          fontWeight="semibold"
        >
          NATIJA: {pagination?.total ?? items.length}
        </Badge>
      </Flex>

      {/* FILTERS */}
      <Card {...GLASS_CARD} mb={6} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardBody position="relative">
          <Flex gap={4} wrap="wrap" align="center">
            {/* search */}
            <InputGroup flex="1" minW={{ base: "100%", md: "340px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="rgba(255,255,255,0.55)" />
              </InputLeftElement>
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Qidirish..."
                {...inputDark}
              />
            </InputGroup>

            {/* type */}
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              {...inputDark}
              w={{ base: "100%", md: "220px" }}
            >
              <option style={{ background: "#0A1226", color: "#fff" }} value="">
                Turi
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="deposit"
              >
                Depozit
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="withdrawal"
              >
                Yechib olish
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="escrow_hold"
              >
                Escrow hold
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="escrow_release"
              >
                Escrow chiqarish
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="fee"
              >
                Platforma haqi
              </option>
            </Select>

            {/* status */}
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              {...inputDark}
              w={{ base: "100%", md: "220px" }}
            >
              <option style={{ background: "#0A1226", color: "#fff" }} value="">
                Status
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="completed"
              >
                Muvaffaqiyatli
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="pending"
              >
                Kutilmoqda
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="failed"
              >
                Xato
              </option>
            </Select>

            {/* sort */}
            <Select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              {...inputDark}
              w={{ base: "100%", md: "220px" }}
            >
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="created_desc"
              >
                Sana (Yangi)
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="created_asc"
              >
                Sana (Eski)
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="amount_desc"
              >
                Summa (Katta)
              </option>
              <option
                style={{ background: "#0A1226", color: "#fff" }}
                value="amount_asc"
              >
                Summa (Kichik)
              </option>
            </Select>

            <Button
              {...btnGhost}
              w={{ base: "100%", md: "140px" }}
              onClick={resetFilters}
            >
              Tozalash
            </Button>
          </Flex>
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

      {/* CONTENT */}
      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" color="blue.300" thickness="4px" />
          <Text ml={4} color="whiteAlpha.800">
            To‘lovlar yuklanmoqda...
          </Text>
        </Flex>
      ) : isMobile ? (
        /* MOBILE: CARDS */
        <Stack spacing={4}>
          {items.length === 0 ? (
            <Card {...GLASS_CARD} position="relative">
              <Box {...SHINE_OVERLAY} />
              <CardBody position="relative">
                <Text color="whiteAlpha.700" textAlign="center" py={6}>
                  Hech qanday to‘lov topilmadi
                </Text>
              </CardBody>
            </Card>
          ) : (
            items.map((tx) => (
              <Card key={tx.id} {...GLASS_CARD} position="relative">
                <Box {...SHINE_OVERLAY} />
                <CardBody position="relative">
                  <Flex justify="space-between" align="start" gap={3} mb={3}>
                    <Box>
                      <Text color="whiteAlpha.600" fontSize="xs">
                        ID
                      </Text>
                      <Text color="whiteAlpha.900" fontWeight="bold">
                        #{shortId(tx.id, 12, 6)}
                      </Text>
                    </Box>
                    <StatusBadge v={tx.status} />
                  </Flex>

                  <HStack justify="space-between" mb={2} wrap="wrap">
                    <Box>
                      <Text color="whiteAlpha.600" fontSize="xs">
                        Turi
                      </Text>
                      <TypeBadge v={tx.type} />
                    </Box>
                    <Box textAlign="right">
                      <Text color="whiteAlpha.600" fontSize="xs">
                        Summa
                      </Text>
                      <Text color="whiteAlpha.900" fontWeight="bold">
                        {moneyUZS(tx.amount)}
                      </Text>
                    </Box>
                  </HStack>

                  <Flex
                    justify="space-between"
                    align="center"
                    mt={3}
                    wrap="wrap"
                    gap={2}
                  >
                    <Tag
                      size="sm"
                      borderRadius="full"
                      bg="rgba(255,255,255,0.06)"
                      border="1px solid rgba(255,255,255,0.10)"
                      color="whiteAlpha.900"
                    >
                      <TagLabel>{tx.gateway || "—"}</TagLabel>
                    </Tag>

                    <Text fontSize="xs" color="whiteAlpha.600">
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleString()
                        : "—"}
                    </Text>
                  </Flex>

                  <Link to={`/admin/payments/${tx.id}`}>
                    <Button
                      mt={4}
                      w="full"
                      {...btnPrimary}
                      leftIcon={<ViewIcon />}
                    >
                      Ko‘rish
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        /* DESKTOP: TABLE */
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardBody position="relative" p={0}>
            <TableContainer>
              <Table variant="simple" size="md" minW="950px">
                <Thead>
                  <Tr bg="rgba(255,255,255,0.04)">
                    <Th
                      color="whiteAlpha.700"
                      borderColor="rgba(255,255,255,0.08)"
                    >
                      ID
                    </Th>
                    <Th
                      color="whiteAlpha.700"
                      borderColor="rgba(255,255,255,0.08)"
                    >
                      Turi
                    </Th>
                    <Th
                      color="whiteAlpha.700"
                      borderColor="rgba(255,255,255,0.08)"
                    >
                      Summa
                    </Th>
                    <Th
                      color="whiteAlpha.700"
                      borderColor="rgba(255,255,255,0.08)"
                    >
                      Gateway
                    </Th>
                    <Th
                      color="whiteAlpha.700"
                      borderColor="rgba(255,255,255,0.08)"
                    >
                      Status
                    </Th>
                    <Th
                      color="whiteAlpha.700"
                      borderColor="rgba(255,255,255,0.08)"
                    >
                      Sana
                    </Th>
                    <Th
                      color="whiteAlpha.700"
                      borderColor="rgba(255,255,255,0.08)"
                    >
                      Amallar
                    </Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {items.length === 0 ? (
                    <Tr>
                      <Td
                        colSpan={7}
                        textAlign="center"
                        py={10}
                        color="whiteAlpha.600"
                      >
                        Hech qanday to‘lov topilmadi
                      </Td>
                    </Tr>
                  ) : (
                    items.map((tx) => (
                      <Tr
                        key={tx.id}
                        _hover={{ bg: "rgba(255,255,255,0.04)" }}
                        transition="background 0.12s"
                      >
                        <Td
                          borderColor="rgba(255,255,255,0.06)"
                          color="whiteAlpha.900"
                          fontWeight="semibold"
                        >
                          #{shortId(tx.id, 14, 8)}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.06)">
                          <TypeBadge v={tx.type} />
                        </Td>
                        <Td
                          borderColor="rgba(255,255,255,0.06)"
                          color="whiteAlpha.900"
                          fontWeight="bold"
                        >
                          {moneyUZS(tx.amount)}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.06)">
                          <Tag
                            size="sm"
                            borderRadius="full"
                            bg="rgba(255,255,255,0.06)"
                            border="1px solid rgba(255,255,255,0.10)"
                            color="whiteAlpha.900"
                          >
                            <TagLabel>{tx.gateway || "—"}</TagLabel>
                          </Tag>
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.06)">
                          <StatusBadge v={tx.status} />
                        </Td>
                        <Td
                          borderColor="rgba(255,255,255,0.06)"
                          fontSize="sm"
                          color="whiteAlpha.700"
                          whiteSpace="nowrap"
                        >
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleString()
                            : "—"}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.06)">
                          <Link to={`/admin/payments/${tx.id}`}>
                            <Button
                              size="sm"
                              {...btnPrimary}
                              h="36px"
                              borderRadius="lg"
                              leftIcon={<ViewIcon />}
                            >
                              Ko‘rish
                            </Button>
                          </Link>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {/* PAGINATION */}
      <Flex justify="space-between" align="center" mt={6} gap={3} wrap="wrap">
        <Button
          {...btnGhost}
          w={{ base: "100%", sm: "160px" }}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={page === 1}
        >
          Oldingi
        </Button>

        <Text color="whiteAlpha.700">
          Sahifa {pagination.page} / {pagination.totalPages}
        </Text>

        <Button
          {...btnGhost}
          w={{ base: "100%", sm: "160px" }}
          onClick={() =>
            setPage((p) => (p < pagination.totalPages ? p + 1 : p))
          }
          isDisabled={page === pagination.totalPages}
        >
          Keyingi
        </Button>
      </Flex>
    </Box>
  );
}
