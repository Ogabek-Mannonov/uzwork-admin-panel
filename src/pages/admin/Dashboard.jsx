// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Text,
  Flex,
  Avatar,
  Badge,
  VStack,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Select,
  Divider,
} from "@chakra-ui/react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MessageSquare,
  DollarSign,
  Briefcase,
} from "lucide-react";
import api from "../../lib/api";

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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [finance, setFinance] = useState(null);
  const [moderation, setModeration] = useState(null);
  const [chatStats, setChatStats] = useState(null);

  const [topClients, setTopClients] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizePayload = (res) => {
    const payload = res?.data ?? res;
    return payload?.data || payload;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api(`/admin/dashboard?range=${range}`);
        const data = normalizePayload(res);

        setStats(data?.stats || null);
        setBreakdown(data?.breakdown || null);
        setFinance(data?.finance || null);
        setModeration(data?.moderation || null);
        setChatStats(data?.chatStats || null);

        setTopClients(Array.isArray(data?.topClients) ? data.topClients : []);
        setTopFreelancers(Array.isArray(data?.topFreelancers) ? data.topFreelancers : []);
        setRecentActivity(Array.isArray(data?.recentActivity) ? data.recentActivity : []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [range]);

  const growthArrowType = (pct) => {
    const n = Number(pct);
    if (Number.isNaN(n)) return "increase";
    return n >= 0 ? "increase" : "decrease";
  };

  const formatPct = (pct) => {
    const n = Number(pct);
    if (Number.isNaN(n)) return "+0%";
    const sign = n >= 0 ? "+" : "";
    return `${sign}${n.toFixed(1)}%`;
  };

  const safeName = (u) => {
    const full = `${u?.first_name || ""} ${u?.last_name || ""}`.trim();
    return full || u?.username || "Noma'lum";
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh" color="whiteAlpha.900">
        <Spinner size="xl" color="blue.300" thickness="4px" />
        <Text ml={4} fontSize="lg" color="whiteAlpha.800">
          Dashboard yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert
        status="error"
        borderRadius="xl"
        my={4}
        bg="rgba(255,0,80,0.10)"
        border="1px solid rgba(255,0,80,0.18)"
        color="whiteAlpha.900"
      >
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  const jobBreak = breakdown?.jobs || {
    open: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };

  const gmvLabel = stats?.gmvLabel ?? stats?.totalRevenueLabel ?? "0 so'm";
  const gmvGrowth = stats?.gmvGrowthPct ?? stats?.revenueGrowthPct ?? 0;

  const platformRevenueLabel =
    stats?.platformRevenueLabel ?? stats?.platformFeeLabel ?? "0 so'm";
  const platformRevenueGrowth =
    stats?.platformRevenueGrowthPct ?? stats?.feeGrowthPct ?? 0;

  const depositVolumeLabel = stats?.depositVolumeLabel ?? "0 so'm";
  const depositVolumeGrowth = stats?.depositVolumeGrowthPct ?? 0;

  const kpis = [
    {
      label: "Jami foydalanuvchilar",
      value: stats?.totalUsers ?? 0,
      growth: stats?.usersGrowthPct,
      accent: "rgba(30,144,255,0.18)",
    },
    {
      label: "Faol loyihalar",
      value: stats?.activeJobs ?? 0,
      growth: stats?.jobsGrowthPct,
      accent: "rgba(0, 220, 130, 0.16)",
    },
    {
      label: "GMV (Escrow yechildi)",
      value: gmvLabel,
      growth: gmvGrowth,
      accent: "rgba(170, 90, 255, 0.16)",
    },
    {
      label: "Platforma daromadi",
      value: platformRevenueLabel,
      growth: platformRevenueGrowth,
      accent: "rgba(255, 200, 0, 0.14)",
    },
    {
      label: "Deposit hajmi",
      value: depositVolumeLabel,
      growth: depositVolumeGrowth,
      accent: "rgba(0, 180, 255, 0.14)",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="whiteAlpha.900">
            Dashboard
          </Heading>
          <Text mt={1} color="whiteAlpha.600" fontSize="sm">
            Umumiy ko‘rsatkichlar va so‘nggi faollik
          </Text>
        </Box>

        <HStack>
          <Text color="whiteAlpha.700" fontSize="sm">
            Davr:
          </Text>
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            maxW="220px"
            bg="rgba(255,255,255,0.06)"
            borderColor="rgba(255,255,255,0.14)"
            color="whiteAlpha.900"
            _hover={{ borderColor: "rgba(255,255,255,0.28)" }}
            _focus={{
              borderColor: "rgba(66,153,225,0.9)",
              boxShadow: "0 0 0 3px rgba(66,153,225,0.25)",
            }}
          >
            <option style={{ color: "#111" }} value="today">
              Bugun
            </option>
            <option style={{ color: "#111" }} value="7d">
              Oxirgi 7 kun
            </option>
            <option style={{ color: "#111" }} value="30d">
              Oxirgi 30 kun
            </option>
          </Select>
        </HStack>
      </Flex>

      {/* KPI */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
        gap={6}
        mb={6}
      >
        {kpis.map((k) => (
          <GridItem key={k.label}>
            <Card {...GLASS_CARD} position="relative">
              <Box {...SHINE_OVERLAY} />
              <Box
                position="absolute"
                top="-40px"
                right="-40px"
                w="140px"
                h="140px"
                bg={k.accent}
                filter="blur(35px)"
                borderRadius="full"
              />
              <CardBody position="relative">
                <Stat>
                  <StatLabel color="whiteAlpha.700">{k.label}</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="whiteAlpha.900">
                    {k.value}
                  </StatNumber>
                  <StatHelpText color="whiteAlpha.700">
                    <StatArrow type={growthArrowType(k.growth)} />
                    {formatPct(k.growth)}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {/* SUMMARY + BREAKDOWN */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={8}>
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardHeader position="relative">
            <Heading size="md" color="whiteAlpha.900">
              Davr bo‘yicha
            </Heading>
          </CardHeader>
          <CardBody position="relative">
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={Users} color="blue.300" />
                  <Text color="whiteAlpha.800">Yangi userlar</Text>
                </HStack>
                <Badge bg="rgba(30,144,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(30,144,255,0.28)">
                  {stats?.newUsers ?? 0}
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={Briefcase} color="green.300" />
                  <Text color="whiteAlpha.800">Yangi loyihalar</Text>
                </HStack>
                <Badge bg="rgba(0,220,130,0.14)" color="whiteAlpha.900" border="1px solid rgba(0,220,130,0.22)">
                  {stats?.newJobs ?? 0}
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={DollarSign} color="orange.300" />
                  <Text color="whiteAlpha.800">Withdraw pending</Text>
                </HStack>
                <VStack spacing={0} align="end">
                  <Badge bg="rgba(255,170,0,0.14)" color="whiteAlpha.900" border="1px solid rgba(255,170,0,0.22)">
                    {finance?.pendingWithdrawals ?? 0}
                  </Badge>
                  <Text fontSize="xs" color="whiteAlpha.600">
                    {finance?.pendingWithdrawalsAmountLabel ?? "0 so'm"}
                  </Text>
                </VStack>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardHeader position="relative">
            <Heading size="md" color="whiteAlpha.900">
              Loyihalar statusi
            </Heading>
          </CardHeader>
          <CardBody position="relative">
            <VStack align="stretch" spacing={3} color="whiteAlpha.800">
              <Flex justify="space-between">
                <Text>Ochiq</Text>
                <Badge bg="rgba(0,220,130,0.14)" color="whiteAlpha.900" border="1px solid rgba(0,220,130,0.22)">
                  {jobBreak.open}
                </Badge>
              </Flex>
              <Flex justify="space-between">
                <Text>Jarayonda</Text>
                <Badge bg="rgba(30,144,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(30,144,255,0.28)">
                  {jobBreak.in_progress}
                </Badge>
              </Flex>
              <Flex justify="space-between">
                <Text>Tugallangan</Text>
                <Badge bg="rgba(170,90,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(170,90,255,0.26)">
                  {jobBreak.completed}
                </Badge>
              </Flex>
              <Flex justify="space-between">
                <Text>Bekor</Text>
                <Badge bg="rgba(255,0,80,0.10)" color="whiteAlpha.900" border="1px solid rgba(255,0,80,0.18)">
                  {jobBreak.cancelled}
                </Badge>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardHeader position="relative">
            <Heading size="md" color="whiteAlpha.900">
              Moderatsiya & Chat
            </Heading>
          </CardHeader>
          <CardBody position="relative">
            <VStack align="stretch" spacing={3} color="whiteAlpha.800">
              <Flex justify="space-between" align="center">
                <Text>Bloklangan userlar</Text>
                <Badge bg="rgba(255,0,80,0.10)" color="whiteAlpha.900" border="1px solid rgba(255,0,80,0.18)">
                  {moderation?.blockedUsers ?? 0}
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Ochiq nizolar</Text>
                <Badge bg="rgba(255,0,80,0.10)" color="whiteAlpha.900" border="1px solid rgba(255,0,80,0.18)">
                  {moderation?.openDisputes ?? 0}
                </Badge>
              </Flex>

              <Divider borderColor="rgba(255,255,255,0.08)" />

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={MessageSquare} color="blue.300" />
                  <Text>Chatlar jami</Text>
                </HStack>
                <Badge bg="rgba(30,144,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(30,144,255,0.28)">
                  {chatStats?.totalChats ?? 0}
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Blocked chatlar</Text>
                <Badge bg="rgba(255,0,80,0.10)" color="whiteAlpha.900" border="1px solid rgba(255,0,80,0.18)">
                  {chatStats?.blockedChats ?? 0}
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>24 soatda xabarlar</Text>
                <Badge bg="rgba(170,90,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(170,90,255,0.26)">
                  {chatStats?.messagesLast24h ?? 0}
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Shubhali chatlar</Text>
                <Badge bg="rgba(255,170,0,0.14)" color="whiteAlpha.900" border="1px solid rgba(255,170,0,0.22)">
                  {chatStats?.suspiciousChats ?? 0}
                </Badge>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* ACTIVITY + RIGHT */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
        {/* Recent activity */}
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardHeader position="relative">
            <Heading size="md" color="whiteAlpha.900">
              So'nggi faollik
            </Heading>
          </CardHeader>
          <CardBody position="relative">
            <VStack align="stretch" spacing={3}>
              {recentActivity.length > 0 ? (
                recentActivity.map((a, idx) => (
                  <Flex
                    key={idx}
                    align="center"
                    gap={4}
                    p={3}
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(255,255,255,0.08)"
                    borderRadius="xl"
                    _hover={{ bg: "rgba(255,255,255,0.07)" }}
                    transition="all 0.15s"
                  >
                    <Avatar name={a.name} size="md" />
                    <Box flex="1">
                      <Text fontWeight="semibold" color="whiteAlpha.900">
                        {a.name}
                      </Text>
                      <Text fontSize="sm" color="whiteAlpha.700">
                        {a.action}
                      </Text>
                    </Box>
                    <Text fontSize="sm" color="whiteAlpha.600" whiteSpace="nowrap">
                      {a.time}
                    </Text>
                  </Flex>
                ))
              ) : (
                <Text color="whiteAlpha.600" textAlign="center" py={6}>
                  Hozircha faollik yo‘q
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Box>
          {/* Quick stats */}
          <Card {...GLASS_CARD} position="relative" mb={8}>
            <Box {...SHINE_OVERLAY} />
            <CardHeader position="relative">
              <Heading size="md" color="whiteAlpha.900">
                Tezkor statistika
              </Heading>
            </CardHeader>
            <CardBody position="relative">
              <VStack align="stretch" spacing={4} color="whiteAlpha.800">
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={Clock} color="orange.300" boxSize={6} />
                    <Text>Kutilayotgan milestone lar</Text>
                  </HStack>
                  <Badge bg="rgba(255,170,0,0.14)" color="whiteAlpha.900" border="1px solid rgba(255,170,0,0.22)">
                    {moderation?.pendingMilestones ?? 0}
                  </Badge>
                </Flex>

                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={CheckCircle} color="green.300" boxSize={6} />
                    <Text>Tugallangan (bu oy)</Text>
                  </HStack>
                  <Badge bg="rgba(0,220,130,0.14)" color="whiteAlpha.900" border="1px solid rgba(0,220,130,0.22)">
                    {moderation?.completedThisMonth ?? 0}
                  </Badge>
                </Flex>

                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={AlertCircle} color="red.300" boxSize={6} />
                    <Text>Ochiq nizolar</Text>
                  </HStack>
                  <Badge bg="rgba(255,0,80,0.10)" color="whiteAlpha.900" border="1px solid rgba(255,0,80,0.18)">
                    {moderation?.openDisputes ?? 0}
                  </Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Top lists */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Card {...GLASS_CARD} position="relative">
              <Box {...SHINE_OVERLAY} />
              <CardHeader position="relative">
                <Heading size="sm" color="whiteAlpha.900">
                  Top clientlar
                </Heading>
              </CardHeader>
              <CardBody position="relative">
                {topClients.length ? (
                  <VStack align="stretch" spacing={3}>
                    {topClients.map((c) => (
                      <Flex key={c.id} justify="space-between" align="center">
                        <HStack>
                          <Avatar name={safeName(c)} size="sm" />
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="whiteAlpha.900">
                              {safeName(c)}
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.600">
                              @{c.username || "—"}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge bg="rgba(30,144,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(30,144,255,0.28)">
                          {c.jobs_count} job
                        </Badge>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Text color="whiteAlpha.600">Ma'lumot yo‘q</Text>
                )}
              </CardBody>
            </Card>

            <Card {...GLASS_CARD} position="relative">
              <Box {...SHINE_OVERLAY} />
              <CardHeader position="relative">
                <Heading size="sm" color="whiteAlpha.900">
                  Top freelancerlar
                </Heading>
              </CardHeader>
              <CardBody position="relative">
                {topFreelancers.length ? (
                  <VStack align="stretch" spacing={3}>
                    {topFreelancers.map((f) => (
                      <Flex key={f.id} justify="space-between" align="center">
                        <HStack>
                          <Avatar name={safeName(f)} size="sm" />
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="whiteAlpha.900">
                              {safeName(f)}
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.600">
                              @{f.username || "—"}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge bg="rgba(170,90,255,0.16)" color="whiteAlpha.900" border="1px solid rgba(170,90,255,0.26)">
                          {f.messages_count} msg
                        </Badge>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Text color="whiteAlpha.600">Ma'lumot yo‘q</Text>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
