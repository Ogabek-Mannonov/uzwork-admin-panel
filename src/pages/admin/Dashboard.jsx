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
import { Clock, CheckCircle, AlertCircle, Users, MessageSquare, DollarSign, Briefcase } from "lucide-react";
import api from "../../lib/api";

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
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} fontSize="lg">Dashboard yuklanmoqda...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg" my={8}>
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  const jobBreak = breakdown?.jobs || { open: 0, in_progress: 0, completed: 0, cancelled: 0 };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
        <Heading size="xl">Dashboard</Heading>

        <HStack>
          <Text color="gray.600" fontSize="sm">Davr:</Text>
          <Select value={range} onChange={(e) => setRange(e.target.value)} maxW="220px">
            <option value="today">Bugun</option>
            <option value="7d">Oxirgi 7 kun</option>
            <option value="30d">Oxirgi 30 kun</option>
          </Select>
        </HStack>
      </Flex>

      {/* KPI */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={6}>
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Jami foydalanuvchilar</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold">{stats?.totalUsers ?? 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type={growthArrowType(stats?.usersGrowthPct)} />
                  {formatPct(stats?.usersGrowthPct)}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Faol loyihalar</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold">{stats?.activeJobs ?? 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type={growthArrowType(stats?.jobsGrowthPct)} />
                  {formatPct(stats?.jobsGrowthPct)}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Umumiy daromad</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold">{stats?.totalRevenueLabel ?? "0 so'm"}</StatNumber>
                <StatHelpText>
                  <StatArrow type={growthArrowType(stats?.revenueGrowthPct)} />
                  {formatPct(stats?.revenueGrowthPct)}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Platforma haqi</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold">{stats?.platformFeeLabel ?? "0 so'm"}</StatNumber>
                <StatHelpText>
                  <StatArrow type={growthArrowType(stats?.feeGrowthPct)} />
                  {formatPct(stats?.feeGrowthPct)}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* RANGE SUMMARY + BREAKDOWN */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={8}>
        {/* Range summary */}
        <Card>
          <CardHeader>
            <Heading size="md">Davr bo‘yicha</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={Users} />
                  <Text>Yangi userlar</Text>
                </HStack>
                <Badge colorScheme="blue" fontSize="lg">{stats?.newUsers ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={Briefcase} />
                  <Text>Yangi loyihalar</Text>
                </HStack>
                <Badge colorScheme="green" fontSize="lg">{stats?.newJobs ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={DollarSign} />
                  <Text>Withdraw pending</Text>
                </HStack>
                <VStack spacing={0} align="end">
                  <Badge colorScheme="orange" fontSize="lg">{finance?.pendingWithdrawals ?? 0}</Badge>
                  <Text fontSize="xs" color="gray.600">{finance?.pendingWithdrawalsAmountLabel ?? "0 so'm"}</Text>
                </VStack>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Job breakdown */}
        <Card>
          <CardHeader>
            <Heading size="md">Loyihalar statusi</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between"><Text>Ochiq</Text><Badge colorScheme="green">{jobBreak.open}</Badge></Flex>
              <Flex justify="space-between"><Text>Jarayonda</Text><Badge colorScheme="blue">{jobBreak.in_progress}</Badge></Flex>
              <Flex justify="space-between"><Text>Tugallangan</Text><Badge colorScheme="purple">{jobBreak.completed}</Badge></Flex>
              <Flex justify="space-between"><Text>Bekor</Text><Badge colorScheme="red">{jobBreak.cancelled}</Badge></Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Moderation/Chat quick */}
        <Card>
          <CardHeader>
            <Heading size="md">Moderatsiya & Chat</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <Text>Bloklangan userlar</Text>
                <Badge colorScheme="red">{moderation?.blockedUsers ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Ochiq nizolar</Text>
                <Badge colorScheme="red">{moderation?.openDisputes ?? 0}</Badge>
              </Flex>

              <Divider />

              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={MessageSquare} />
                  <Text>Chatlar jami</Text>
                </HStack>
                <Badge colorScheme="blue">{chatStats?.totalChats ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Blocked chatlar</Text>
                <Badge colorScheme="red">{chatStats?.blockedChats ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>24 soatda xabarlar</Text>
                <Badge colorScheme="purple">{chatStats?.messagesLast24h ?? 0}</Badge>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text>Shubhali chatlar</Text>
                <Badge colorScheme="orange">{chatStats?.suspiciousChats ?? 0}</Badge>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* ACTIVITY + QUICK + TOP LISTS */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <Heading size="md">So'nggi faollik</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              {recentActivity.length > 0 ? (
                recentActivity.map((a, idx) => (
                  <Flex key={idx} align="center" gap={4} p={3} bg="gray.50" borderRadius="md">
                    <Avatar name={a.name} size="md" />
                    <Box flex="1">
                      <Text fontWeight="medium">{a.name}</Text>
                      <Text fontSize="sm" color="gray.600">{a.action}</Text>
                    </Box>
                    <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">{a.time}</Text>
                  </Flex>
                ))
              ) : (
                <Text color="gray.500" textAlign="center" py={6}>Hozircha faollik yo‘q</Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Box>
          {/* Quick stats */}
          <Card mb={8}>
            <CardHeader>
              <Heading size="md">Tezkor statistika</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between">
                  <Flex align="center" gap={3}>
                    <Icon as={Clock} color="orange.500" boxSize={6} />
                    <Text>Kutilayotgan milestone lar</Text>
                  </Flex>
                  <Badge colorScheme="orange" fontSize="lg">{moderation?.pendingMilestones ?? 0}</Badge>
                </Flex>

                <Flex justify="space-between">
                  <Flex align="center" gap={3}>
                    <Icon as={CheckCircle} color="green.500" boxSize={6} />
                    <Text>Tugallangan (bu oy)</Text>
                  </Flex>
                  <Badge colorScheme="green" fontSize="lg">{moderation?.completedThisMonth ?? 0}</Badge>
                </Flex>

                <Flex justify="space-between">
                  <Flex align="center" gap={3}>
                    <Icon as={AlertCircle} color="red.500" boxSize={6} />
                    <Text>Ochiq nizolar</Text>
                  </Flex>
                  <Badge colorScheme="red" fontSize="lg">{moderation?.openDisputes ?? 0}</Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Top lists */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Card>
              <CardHeader>
                <Heading size="sm">Top clientlar</Heading>
              </CardHeader>
              <CardBody>
                {topClients.length ? (
                  <VStack align="stretch" spacing={3}>
                    {topClients.map((c) => (
                      <Flex key={c.id} justify="space-between" align="center">
                        <HStack>
                          <Avatar name={safeName(c)} size="sm" />
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm">{safeName(c)}</Text>
                            <Text fontSize="xs" color="gray.500">@{c.username || "—"}</Text>
                          </Box>
                        </HStack>
                        <Badge colorScheme="blue">{c.jobs_count} job</Badge>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">Ma'lumot yo‘q</Text>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="sm">Top freelancerlar</Heading>
              </CardHeader>
              <CardBody>
                {topFreelancers.length ? (
                  <VStack align="stretch" spacing={3}>
                    {topFreelancers.map((f) => (
                      <Flex key={f.id} justify="space-between" align="center">
                        <HStack>
                          <Avatar name={safeName(f)} size="sm" />
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm">{safeName(f)}</Text>
                            <Text fontSize="xs" color="gray.500">@{f.username || "—"}</Text>
                          </Box>
                        </HStack>
                        <Badge colorScheme="purple">{f.messages_count} msg</Badge>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">Ma'lumot yo‘q</Text>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
