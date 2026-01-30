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
  Avatar,
  HStack,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Button,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import api from "../../lib/api";

export default function AdminDisputes() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // simple pagination
  const [page, setPage] = useState(1);
  const limit = 20;

  const getStatusBadge = (s) => {
    const colorScheme = {
      open: "orange",
      in_review: "blue",
      resolved: "green",
      cancelled: "gray",
    };
    const label = {
      open: "Ochiq",
      in_review: "Ko'rib chiqilmoqda",
      resolved: "Hal qilingan",
      cancelled: "Bekor qilingan",
    };
    return (
      <Badge colorScheme={colorScheme[s] || "gray"} fontSize="sm" px={3} py={1} borderRadius="full">
        {label[s] || s || "—"}
      </Badge>
    );
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);

      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("limit", String(limit));
      if (status !== "all") qs.set("status", status);

      const res = await api(`/disputes?${qs.toString()}`);
      const payload = res?.data ?? res;

      const disputes =
        payload?.data?.disputes ||
        payload?.disputes ||
        payload?.data?.data?.disputes ||
        [];

      setItems(Array.isArray(disputes) ? disputes : []);
    } catch (e) {
      console.error("Disputes list error:", e);
      setError("Disputelarni yuklashda xato.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const raisedByLabel = (role) => {
    const v = String(role || "").toLowerCase();
    if (v === "client") return <Badge colorScheme="red">Client</Badge>;
    if (v === "freelancer") return <Badge colorScheme="purple">Freelancer</Badge>;
    if (v === "admin") return <Badge colorScheme="blue">Admin</Badge>;
    return <Badge colorScheme="gray">—</Badge>;
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("uz-UZ", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return String(d);
    }
  };

  const shortId = (id) => (id ? String(id).slice(0, 8) : "—");

  const empty = useMemo(() => !loading && items.length === 0, [loading, items]);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Heading size="xl">Nizolar (Disputes)</Heading>

        <HStack>
          <Text fontSize="sm" color="gray.600">Status:</Text>
          <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} maxW="220px">
            <option value="all">Hammasi</option>
            <option value="open">Ochiq</option>
            <option value="in_review">Ko'rib chiqilmoqda</option>
            <option value="resolved">Hal qilingan</option>
          </Select>
        </HStack>
      </Flex>

      {loading && (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="lg" />
          <Text ml={3}>Yuklanmoqda...</Text>
        </Flex>
      )}

      {!loading && error && (
        <Alert status="error" borderRadius="lg" mb={5}>
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Box overflowX="auto" bg="white" borderRadius="lg" borderWidth="1px">
            <Table variant="simple" size="md">
              <Thead>
                <Tr bg="gray.50">
                  <Th>ID</Th>
                  <Th>Chat</Th>
                  <Th>Raised by</Th>
                  <Th>Reason</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Amal</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((d) => (
                  <Tr key={d.id} _hover={{ bg: "gray.50" }}>
                    <Td fontWeight="semibold">#{shortId(d.id)}</Td>

                    <Td>
                      <Text fontSize="sm">
                        {d.chat_id ? `Chat ${String(d.chat_id).slice(0, 8)}...` : "—"}
                      </Text>
                    </Td>

                    <Td>
                      <HStack spacing={2}>
                        <Avatar size="xs" name={d.raised_by_role || "User"} />
                        {raisedByLabel(d.raised_by_role)}
                      </HStack>
                    </Td>

                    <Td maxW="380px">
                      <Text noOfLines={2}>{d.reason || "—"}</Text>
                    </Td>

                    <Td>{getStatusBadge(d.status)}</Td>

                    <Td>{formatDate(d.created_at)}</Td>

                    <Td>
                      <HStack spacing={2}>
                        <Link to={`/admin/disputes/${d.id}`}>
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            aria-label="Ko'rish"
                          />
                        </Link>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {empty && (
              <Box p={10} textAlign="center" color="gray.500">
                Hozircha dispute yo‘q
              </Box>
            )}
          </Box>

          {/* pagination */}
          <Flex justify="center" align="center" mt={5} gap={3}>
            <Button onClick={() => setPage((p) => Math.max(p - 1, 1))} isDisabled={page === 1}>
              Orqaga
            </Button>
            <Badge px={4} py={2} borderRadius="md">Page: {page}</Badge>
            <Button onClick={() => setPage((p) => p + 1)} isDisabled={items.length < limit}>
              Keyingi
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
}
