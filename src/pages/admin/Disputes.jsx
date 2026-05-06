import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Card,
  CardBody,
  TableContainer,
  Stack,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
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

const neutralBadge = {
  bg: "rgba(255,255,255,0.08)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(255,255,255,0.12)",
};

export default function AdminDisputes() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "disputes", { status, page }],
    queryFn: async () => {
      let url = `/disputes?limit=${limit}&page=${page}`;
      if (status !== "all") url += `&status=${status}`;
      const res = await api(url);
      const payload = res?.data ?? res;
      return payload?.data?.disputes || payload?.disputes || [];
    },
  });

  const items = Array.isArray(data) ? data : [];

  const getStatusBadge = (s) => {
    const v = String(s || "").toLowerCase();
    const map = {
      open: { label: "Ochiq", badge: badgeOrange },
      in_review: { label: "Ko'rib chiqilmoqda", badge: badgeBlue },
      resolved: { label: "Hal qilingan", badge: badgeGreen },
      cancelled: { label: "Bekor qilingan", badge: neutralBadge },
    };
    const m = map[v] || { label: v || "—", badge: neutralBadge };
    return (
      <Badge {...m.badge} fontSize="sm" px={3} py={1} borderRadius="full">
        {m.label}
      </Badge>
    );
  };

  const shortId = (id) => (id ? String(id).slice(0, 8) : "—");

  const formatDate = (d) => {
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

  const getRaisedByUser = (d) => {
    return (
      d?.raised_by_user ||
      d?.raised_by ||
      d?.raisedByUser ||
      (String(d?.raised_by_role || "").toLowerCase() === "client" ? d?.client : null) ||
      (String(d?.raised_by_role || "").toLowerCase() === "freelancer" ? d?.freelancer : null) ||
      null
    );
  };

  const fullName = (u) =>
    `${u?.first_name || ""} ${u?.last_name || ""}`.trim() || u?.full_name || u?.name || "";

  const usernameOf = (u) => {
    const un = u?.username || u?.handle || u?.login;
    return un ? String(un) : "";
  };

  const raisedByCell = (d) => {
    const role = String(d?.raised_by_role || "").toLowerCase();
    const u = getRaisedByUser(d);

    const roleBadge =
      role === "client" ? (
        <Badge {...badgeRed} fontSize="xs" px={2.5} py={1} borderRadius="md">
          CLIENT
        </Badge>
      ) : role === "freelancer" ? (
        <Badge {...badgePurple} fontSize="xs" px={2.5} py={1} borderRadius="md">
          FREELANCER
        </Badge>
      ) : role === "admin" ? (
        <Badge {...badgeBlue} fontSize="xs" px={2.5} py={1} borderRadius="md">
          ADMIN
        </Badge>
      ) : (
        <Badge {...neutralBadge} fontSize="xs" px={2.5} py={1} borderRadius="md">
          —
        </Badge>
      );

    const name = fullName(u);
    const uname = usernameOf(u);

    const primary =
      uname ? `@${uname}` : name ? name : u?.id ? String(u.id).slice(0, 8) : "—";

    const secondary = uname && name ? name : "";

    return (
      <HStack spacing={3} align="center">
        <Avatar
          size="sm"
          name={uname || name || role || "User"}
          src={u?.avatar_url || u?.avatar || undefined}
          bg="rgba(255,255,255,0.08)"
          border="1px solid rgba(255,255,255,0.12)"
          color="whiteAlpha.900"
        />
        <VStack spacing={0} align="start" minW={0}>
          <HStack spacing={2} minW={0} wrap="wrap">
            {roleBadge}
            <Text
              fontSize="sm"
              color="whiteAlpha.900"
              fontWeight="semibold"
              noOfLines={1}
              maxW={{ base: "170px", lg: "220px" }}
            >
              {primary}
            </Text>
          </HStack>

          {secondary ? (
            <Text fontSize="xs" color="whiteAlpha.600" noOfLines={1} maxW={{ base: "220px", lg: "260px" }}>
              {secondary}
            </Text>
          ) : null}
        </VStack>
      </HStack>
    );
  };

  const empty = useMemo(() => !isLoading && items.length === 0, [isLoading, items]);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="whiteAlpha.900">
            Nizolar (Disputes)
          </Heading>
          <Text mt={1} color="whiteAlpha.600" fontSize="sm">
            Status bo'yicha filter + ko'rish
          </Text>
        </Box>

        <Badge {...badgeBlue} borderRadius="full" px={3} py={1.5} fontWeight="semibold">
          NATIJA: {items.length}
        </Badge>
      </Flex>

      <Card {...GLASS_CARD} mb={6} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardBody position="relative">
          <Flex gap={3} wrap="wrap" align="center" justify="space-between">
            <HStack>
              <Text fontSize="sm" color="whiteAlpha.700">
                Status:
              </Text>
              <Select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                maxW={{ base: "100%", sm: "260px" }}
                {...inputStyle}
              >
                <option style={{ background: "#0A1226", color: "#fff" }} value="all">
                  Hammasi
                </option>
                <option style={{ background: "#0A1226", color: "#fff" }} value="open">
                  Ochiq
                </option>
                <option style={{ background: "#0A1226", color: "#fff" }} value="in_review">
                  Ko'rib chiqilmoqda
                </option>
                <option style={{ background: "#0A1226", color: "#fff" }} value="resolved">
                  Hal qilingan
                </option>
                <option style={{ background: "#0A1226", color: "#fff" }} value="cancelled">
                  Bekor qilingan
                </option>
              </Select>
            </HStack>

            <HStack spacing={2}>
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                isDisabled={page === 1}
                bg="rgba(255,255,255,0.06)"
                border="1px solid rgba(255,255,255,0.10)"
                color="whiteAlpha.900"
                _hover={{ bg: "rgba(255,255,255,0.09)" }}
              >
                Orqaga
              </Button>

              <Badge
                bg="rgba(255,255,255,0.06)"
                border="1px solid rgba(255,255,255,0.10)"
                color="whiteAlpha.900"
                px={4}
                py={2}
                borderRadius="lg"
              >
                Page: {page}
              </Badge>

              <Button
                onClick={() => setPage((p) => p + 1)}
                isDisabled={items.length < limit}
                bg="rgba(255,255,255,0.06)"
                border="1px solid rgba(255,255,255,0.10)"
                color="whiteAlpha.900"
                _hover={{ bg: "rgba(255,255,255,0.09)" }}
              >
                Keyingi
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {isLoading && (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="lg" color="blue.300" thickness="4px" />
          <Text ml={3} color="whiteAlpha.800">
            Yuklanmoqda...
          </Text>
        </Flex>
      )}

      {error && (
        <Alert
          status="error"
          borderRadius="xl"
          mb={5}
          bg="rgba(255,0,80,0.10)"
          border="1px solid rgba(255,0,80,0.18)"
          color="whiteAlpha.900"
        >
          <AlertIcon />
          <Text>{error?.message || "Bahslarni yuklashda xato yuz berdi."}</Text>
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          {isMobile ? (
            <Stack spacing={4}>
              {items.map((d) => (
                <Card key={d.id} {...GLASS_CARD} position="relative">
                  <Box {...SHINE_OVERLAY} />
                  <CardBody position="relative">
                    <Flex justify="space-between" align="start" gap={3}>
                      <Box minW={0}>
                        <Text
                          color="whiteAlpha.600"
                          fontSize="xs"
                          letterSpacing="0.08em"
                          textTransform="uppercase"
                        >
                          Dispute
                        </Text>
                        <Text color="whiteAlpha.900" fontWeight="bold" mt={1}>
                          #{shortId(d.id)}
                        </Text>
                        <Text color="whiteAlpha.700" fontSize="sm" mt={1}>
                          {d.chat_id ? `Chat ${String(d.chat_id).slice(0, 8)}...` : "Chat —"}
                        </Text>
                      </Box>
                      {getStatusBadge(d.status)}
                    </Flex>

                    <Box mt={3}>{raisedByCell(d)}</Box>

                    <Flex mt={3} justify="flex-end" align="center">
                      <Link to={`/admin/disputes/${d.id}`}>
                        <Button
                          size="sm"
                          leftIcon={<ViewIcon />}
                          bg="rgba(30,144,255,0.12)"
                          color="whiteAlpha.900"
                          border="1px solid rgba(30,144,255,0.20)"
                          _hover={{ bg: "rgba(30,144,255,0.18)" }}
                        >
                          Ko'rish
                        </Button>
                      </Link>
                    </Flex>

                    <Box
                      mt={3}
                      p={3}
                      borderRadius="xl"
                      bg="rgba(255,255,255,0.06)"
                      border="1px solid rgba(255,255,255,0.10)"
                    >
                      <Text color="whiteAlpha.600" fontSize="xs" mb={1}>
                        Reason
                      </Text>
                      <Text color="whiteAlpha.900" noOfLines={3}>
                        {d.reason || "—"}
                      </Text>
                    </Box>

                    <Text mt={3} fontSize="sm" color="whiteAlpha.700">
                      {formatDate(d.created_at)}
                    </Text>
                  </CardBody>
                </Card>
              ))}

              {empty && (
                <Card {...GLASS_CARD} position="relative">
                  <Box {...SHINE_OVERLAY} />
                  <CardBody position="relative">
                    <Text textAlign="center" color="whiteAlpha.600" py={6}>
                      Hozircha dispute yo'q
                    </Text>
                  </CardBody>
                </Card>
              )}
            </Stack>
          ) : (
            /* DESKTOP: TABLE */
            <Card {...GLASS_CARD} position="relative">
              <Box {...SHINE_OVERLAY} />
              <CardBody position="relative" p={0}>
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr bg="rgba(255,255,255,0.04)">
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          ID
                        </Th>
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          Chat
                        </Th>
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          Raised by
                        </Th>
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          Reason
                        </Th>
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          Status
                        </Th>
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          Created
                        </Th>
                        <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                          Amal
                        </Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {items.map((d) => (
                        <Tr key={d.id} _hover={{ bg: "rgba(255,255,255,0.04)" }} transition="background 0.12s">
                          <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900" fontWeight="semibold">
                            #{shortId(d.id)}
                          </Td>

                          <Td borderColor="rgba(255,255,255,0.06)">
                            <Text fontSize="sm" color="whiteAlpha.800">
                              {d.chat_id ? `Chat ${String(d.chat_id).slice(0, 8)}...` : "—"}
                            </Text>
                          </Td>

                          <Td borderColor="rgba(255,255,255,0.06)">
                            {raisedByCell(d)}
                          </Td>

                          <Td borderColor="rgba(255,255,255,0.06)" maxW="420px">
                            <Text color="whiteAlpha.900" noOfLines={2}>
                              {d.reason || "—" }
                            </Text>
                          </Td>

                          <Td borderColor="rgba(255,255,255,0.06)">{getStatusBadge(d.status)}</Td>

                          <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.700" fontSize="sm" whiteSpace="nowrap">
                            {formatDate(d.created_at)}
                          </Td>

                          <Td borderColor="rgba(255,255,255,0.06)">
                            <Link to={`/admin/disputes/${d.id}`}>
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                aria-label="Ko'rish"
                                bg="rgba(30,144,255,0.12)"
                                color="whiteAlpha.900"
                                border="1px solid rgba(30,144,255,0.20)"
                                _hover={{ bg: "rgba(30,144,255,0.18)" }}
                              />
                            </Link>
                          </Td>
                        </Tr>
                      ))}

                      {empty && (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={10} color="whiteAlpha.600">
                            Hozircha dispute yo'q
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
  