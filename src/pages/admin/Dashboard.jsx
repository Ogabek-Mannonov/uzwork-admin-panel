// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Stack,
  Button,
} from "@chakra-ui/react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MessageSquare,
  DollarSign,
  Briefcase,
  TrendingUp,
  Activity,
  ShieldAlert,
} from "lucide-react";
import api from "../../lib/api";

// ✅ Charts (recharts)
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

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

const SOFT = {
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "xl",
};

const selectStyle = {
  bg: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.14)",
  color: "whiteAlpha.900",
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

function formatMoneyLabel(v, currency = "so'm") {
  if (v == null) return `0 ${currency}`;
  const n = Number(v);
  if (!Number.isFinite(n)) return `${v} ${currency}`;
  return `${n.toLocaleString("uz-UZ")} ${currency}`;
}

function safePct(pct) {
  const n = Number(pct);
  if (Number.isNaN(n)) return 0;
  return n;
}

function growthArrowType(pct) {
  const n = safePct(pct);
  return n >= 0 ? "increase" : "decrease";
}
function formatPct(pct) {
  const n = safePct(pct);
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function safeName(u) {
  const full = `${u?.first_name || ""} ${u?.last_name || ""}`.trim();
  return full || u?.username || "Noma'lum";
}

function GlassChartCard({
  title,
  subtitle,
  data,
  xKey = "label",
  yKey = "value",
  type = "line",
  stroke = "rgba(66,153,225,0.95)",
  fill = "rgba(66,153,225,0.18)",
  rightLabel,
}) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card {...GLASS_CARD} position="relative">
      <Box {...SHINE_OVERLAY} />
      <CardHeader position="relative" pb={2}>
        <Flex justify="space-between" align="start" gap={4} wrap="wrap">
          <Box>
            <Heading size="md" color="whiteAlpha.900">
              {title}
            </Heading>
            {subtitle ? (
              <Text mt={1} color="whiteAlpha.600" fontSize="sm">
                {subtitle}
              </Text>
            ) : null}
          </Box>

          {rightLabel ? (
            <Badge {...badgeBlue} borderRadius="full" px={3} py={1.5} fontWeight="semibold">
              {rightLabel}
            </Badge>
          ) : null}
        </Flex>
      </CardHeader>

      <CardBody position="relative" pt={2}>
        {hasData ? (
          <Box h="240px" {...SOFT} p={3}>
            <ResponsiveContainer width="100%" height="100%">
              {type === "area" ? (
                <AreaChart data={data}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey={xKey}
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,18,38,0.92)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      color: "white",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey={yKey}
                    stroke={stroke}
                    fill={fill}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey={xKey}
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,18,38,0.92)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      color: "white",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey={yKey}
                    stroke={stroke}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box {...SOFT} p={6} textAlign="center">
            <Text color="whiteAlpha.600">Trend ma’lumotlari yo‘q</Text>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}

export default function AdminDashboard() {
  const [range, setRange] = useState("30d");

  const normalizePayload = (res) => {
    const payload = res?.data ?? res;
    return payload?.data || payload;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard", range],
    queryFn: async () => {
      const res = await api(`/admin/dashboard?range=${range}`);
      return normalizePayload(res);
    },
  });

  const stats = data?.stats || null;
  const breakdown = data?.breakdown || null;
  const finance = data?.finance || null;
  const moderation = data?.moderation || null;
  const chatStats = data?.chatStats || null;

  const topClients = Array.isArray(data?.topClients) ? data.topClients : [];
  const topFreelancers = Array.isArray(data?.topFreelancers) ? data.topFreelancers : [];
  const recentActivity = Array.isArray(data?.recentActivity) ? data.recentActivity : [];

  const trends = data?.trends || data?.timeSeries || null;
  const funnel = data?.funnel || null;
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];

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

  // ✅ Trends normalize (backend format turlicha bo‘lsa ham ishlaydi)
  const series = useMemo(() => {
    const norm = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr
        .map((x, idx) => {
          if (x && typeof x === "object") {
            // {label, value} yoki {date, amount} yoki {x,y}
            const label = x.label ?? x.date ?? x.x ?? String(idx + 1);
            const value = x.value ?? x.amount ?? x.y ?? 0;
            return { label: String(label), value: Number(value) || 0 };
          }
          return { label: String(idx + 1), value: Number(x) || 0 };
        })
        .slice(0, 60);
    };

    return {
      gmv: norm(trends?.gmv),
      revenue: norm(trends?.platformRevenue ?? trends?.revenue),
      users: norm(trends?.newUsers ?? trends?.users),
      deposits: norm(trends?.deposits),
      withdrawals: norm(trends?.withdrawals),
    };
  }, [trends]);

  const hasAnyTrend =
    series.gmv.length ||
    series.revenue.length ||
    series.users.length ||
    series.deposits.length ||
    series.withdrawals.length;

  if (isLoading) {
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
        <Text>{error?.message || "Ma'lumotlarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring."}</Text>
      </Alert>
    );
  }

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
          <Select value={range} onChange={(e) => setRange(e.target.value)} maxW="220px" {...selectStyle}>
            <option style={{ background: "#0A1226", color: "#fff" }} value="today">
              Bugun
            </option>
            <option style={{ background: "#0A1226", color: "#fff" }} value="7d">
              Oxirgi 7 kun
            </option>
            <option style={{ background: "#0A1226", color: "#fff" }} value="30d">
              Oxirgi 30 kun
            </option>
          </Select>
        </HStack>
      </Flex>

      {/* ✅ Alerts (Upwork-style) */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={6}>
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardBody position="relative">
            <HStack spacing={3}>
              <Icon as={ShieldAlert} color="orange.300" />
              <Box>
                <Text color="whiteAlpha.900" fontWeight="bold">
                  Alerts & Health
                </Text>
                <Text color="whiteAlpha.600" fontSize="sm">
                  Muhim ogohlantirishlar
                </Text>
              </Box>
            </HStack>

            <Divider my={4} borderColor="rgba(255,255,255,0.08)" />

            <VStack align="stretch" spacing={2}>
              {/* backend alerts bo‘lmasa — fallback */}
              {alerts?.length ? (
                alerts.slice(0, 3).map((a, idx) => (
                  <Flex
                    key={idx}
                    {...SOFT}
                    p={3}
                    justify="space-between"
                    align="start"
                    gap={4}
                  >
                    <Box>
                      <Text color="whiteAlpha.900" fontWeight="semibold">
                        {a.title || "Alert"}
                      </Text>
                      <Text color="whiteAlpha.600" fontSize="sm" noOfLines={2}>
                        {a.desc || "—"}
                      </Text>
                    </Box>
                    <Badge
                      {...(a.type === "danger" ? badgeRed : a.type === "warning" ? badgeOrange : badgeBlue)}
                      borderRadius="full"
                      px={3}
                      py={1}
                      flexShrink={0}
                    >
                      {a.type || "info"}
                    </Badge>
                  </Flex>
                ))
              ) : (
                <>
                  <Flex {...SOFT} p={3} justify="space-between" align="center">
                    <Text color="whiteAlpha.800">Withdraw pending</Text>
                    <Badge {...badgeOrange} borderRadius="full" px={3} py={1}>
                      {finance?.pendingWithdrawals ?? 0}
                    </Badge>
                  </Flex>
                  <Flex {...SOFT} p={3} justify="space-between" align="center">
                    <Text color="whiteAlpha.800">Open disputes</Text>
                    <Badge {...badgeRed} borderRadius="full" px={3} py={1}>
                      {moderation?.openDisputes ?? 0}
                    </Badge>
                  </Flex>
                  <Flex {...SOFT} p={3} justify="space-between" align="center">
                    <Text color="whiteAlpha.800">Blocked chats</Text>
                    <Badge {...badgeRed} borderRadius="full" px={3} py={1}>
                      {chatStats?.blockedChats ?? 0}
                    </Badge>
                  </Flex>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* quick badges */}
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardBody position="relative">
            <HStack spacing={3}>
              <Icon as={Activity} color="blue.300" />
              <Box>
                <Text color="whiteAlpha.900" fontWeight="bold">
                  Performance
                </Text>
                <Text color="whiteAlpha.600" fontSize="sm">
                  Davr bo‘yicha tez ko‘rsatkichlar
                </Text>
              </Box>
            </HStack>

            <Divider my={4} borderColor="rgba(255,255,255,0.08)" />

            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <Text color="whiteAlpha.800">New users</Text>
                <Badge {...badgeBlue} borderRadius="full" px={3} py={1}>
                  {stats?.newUsers ?? 0}
                </Badge>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text color="whiteAlpha.800">New jobs</Text>
                <Badge {...badgeGreen} borderRadius="full" px={3} py={1}>
                  {stats?.newJobs ?? 0}
                </Badge>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text color="whiteAlpha.800">Messages (24h)</Text>
                <Badge {...badgePurple} borderRadius="full" px={3} py={1}>
                  {chatStats?.messagesLast24h ?? 0}
                </Badge>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* funnel summary */}
        <Card {...GLASS_CARD} position="relative">
          <Box {...SHINE_OVERLAY} />
          <CardBody position="relative">
            <HStack spacing={3}>
              <Icon as={TrendingUp} color="green.300" />
              <Box>
                <Text color="whiteAlpha.900" fontWeight="bold">
                  Funnel
                </Text>
                <Text color="whiteAlpha.600" fontSize="sm">
                  Job → Proposal → Contract → Completed
                </Text>
              </Box>
            </HStack>

            <Divider my={4} borderColor="rgba(255,255,255,0.08)" />

            {funnel ? (
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" align="center">
                  <Text color="whiteAlpha.800">Jobs posted</Text>
                  <Badge {...badgeBlue} borderRadius="full" px={3} py={1}>
                    {funnel.posted ?? 0}
                  </Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text color="whiteAlpha.800">Proposals</Text>
                  <Badge {...badgePurple} borderRadius="full" px={3} py={1}>
                    {funnel.proposals ?? 0}
                  </Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text color="whiteAlpha.800">Contracts</Text>
                  <Badge {...badgeGreen} borderRadius="full" px={3} py={1}>
                    {funnel.contracts ?? 0}
                  </Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text color="whiteAlpha.800">Completed</Text>
                  <Badge {...badgeOrange} borderRadius="full" px={3} py={1}>
                    {funnel.completed ?? 0}
                  </Badge>
                </Flex>
              </VStack>
            ) : (
              <Text color="whiteAlpha.600">
                Funnel ma’lumotlari yo‘q (backend keyin qo‘shamiz)
              </Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

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

      {/* ✅ Trends (Line charts) */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={8}>
        <GlassChartCard
          title="GMV trend"
          subtitle="Davr bo‘yicha GMV (escrow yechilgan)"
          data={series.gmv}
          type="area"
          stroke="rgba(170,90,255,0.95)"
          fill="rgba(170,90,255,0.16)"
          rightLabel={hasAnyTrend ? "Trend" : "No data"}
        />
        <GlassChartCard
          title="Platforma daromadi trend"
          subtitle="Komissiya/fee trend"
          data={series.revenue}
          type="line"
          stroke="rgba(255,200,0,0.95)"
          fill="rgba(255,200,0,0.14)"
        />
        <GlassChartCard
          title="New users trend"
          subtitle="Ro‘yxatdan o‘tganlar"
          data={series.users}
          type="line"
          stroke="rgba(30,144,255,0.95)"
          fill="rgba(30,144,255,0.18)"
        />
        <GlassChartCard
          title="Deposits trend"
          subtitle="Deposit hajmi trend"
          data={series.deposits}
          type="area"
          stroke="rgba(0,180,255,0.95)"
          fill="rgba(0,180,255,0.14)"
        />
      </SimpleGrid>

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
                <Badge {...badgeBlue}>{stats?.newUsers ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={Briefcase} color="green.300" />
                  <Text color="whiteAlpha.800">Yangi loyihalar</Text>
                </HStack>
                <Badge {...badgeGreen}>{stats?.newJobs ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={DollarSign} color="orange.300" />
                  <Text color="whiteAlpha.800">Withdraw pending</Text>
                </HStack>
                <VStack spacing={0} align="end">
                  <Badge {...badgeOrange}>{finance?.pendingWithdrawals ?? 0}</Badge>
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
                <Badge {...badgeGreen}>{jobBreak.open}</Badge>
              </Flex>
              <Flex justify="space-between">
                <Text>Jarayonda</Text>
                <Badge {...badgeBlue}>{jobBreak.in_progress}</Badge>
              </Flex>
              <Flex justify="space-between">
                <Text>Tugallangan</Text>
                <Badge {...badgePurple}>{jobBreak.completed}</Badge>
              </Flex>
              <Flex justify="space-between">
                <Text>Bekor</Text>
                <Badge {...badgeRed}>{jobBreak.cancelled}</Badge>
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
                <Badge {...badgeRed}>{moderation?.blockedUsers ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Ochiq nizolar</Text>
                <Badge {...badgeRed}>{moderation?.openDisputes ?? 0}</Badge>
              </Flex>

              <Divider borderColor="rgba(255,255,255,0.08)" />

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={MessageSquare} color="blue.300" />
                  <Text>Chatlar jami</Text>
                </HStack>
                <Badge {...badgeBlue}>{chatStats?.totalChats ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Blocked chatlar</Text>
                <Badge {...badgeRed}>{chatStats?.blockedChats ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>24 soatda xabarlar</Text>
                <Badge {...badgePurple}>{chatStats?.messagesLast24h ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Shubhali chatlar</Text>
                <Badge {...badgeOrange}>{chatStats?.suspiciousChats ?? 0}</Badge>
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
                  <Badge {...badgeOrange}>{moderation?.pendingMilestones ?? 0}</Badge>
                </Flex>

                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={CheckCircle} color="green.300" boxSize={6} />
                    <Text>Tugallangan (bu oy)</Text>
                  </HStack>
                  <Badge {...badgeGreen}>{moderation?.completedThisMonth ?? 0}</Badge>
                </Flex>

                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={AlertCircle} color="red.300" boxSize={6} />
                    <Text>Ochiq nizolar</Text>
                  </HStack>
                  <Badge {...badgeRed}>{moderation?.openDisputes ?? 0}</Badge>
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
                        <Badge {...badgeBlue}>{c.jobs_count} job</Badge>
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
                        <Badge {...badgePurple}>{f.messages_count} msg</Badge>
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
