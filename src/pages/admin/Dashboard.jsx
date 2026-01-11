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
} from "@chakra-ui/react";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../lib/api"; // real backend so‘rovi uchun

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Real backenddan statistika olamiz
        const res = await api("/admin/dashboard");

        setStats(res.data.stats || {});
        setRecentActivity(res.data.recentActivity || []);
        setQuickStats(res.data.quickStats || {});
      } catch (err) {
        console.error("Dashboard ma'lumotlari olishda xato:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} fontSize="lg">
          Dashboard yuklanmoqda...
        </Text>
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

  // Agar backenddan ma'lumot kelmasa – fallback demo qiymatlar
  const fallbackStats = stats || {
    totalUsers: "8,542",
    activeJobs: "126",
    totalRevenue: "1.24 mlrd so'm",
    platformFee: "248 mln so'm",
    usersGrowth: "+12.5%",
    jobsGrowth: "+8.3%",
    revenueGrowth: "+23.1%",
    feeGrowth: "+18.7%",
  };

  const fallbackRecentActivity = recentActivity.length > 0 ? recentActivity : [
    { name: "Ogabek Developer", action: "Yangi loyiha joylashtirdi", time: "5 daqiqa oldin" },
    { name: "Ali Freelancer", action: "Taklif yubordi", time: "12 daqiqa oldin" },
    { name: "Kamola Client", action: "To'lov amalga oshirdi", time: "25 daqiqa oldin" },
  ];

  const fallbackQuickStats = quickStats || {
    pendingMilestones: 24,
    completedThisMonth: 67,
    openDisputes: 5,
  };

  return (
    <Box>
      <Heading size="xl" mb={8}>
        Dashboard
      </Heading>

      {/* Statistika kartochkalari */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={10}>
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Jami foydalanuvchilar</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold">
                  {fallbackStats.totalUsers}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {fallbackStats.usersGrowth}
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
                <StatNumber fontSize="3xl" fontWeight="bold">
                  {fallbackStats.activeJobs}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {fallbackStats.jobsGrowth}
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
                <StatNumber fontSize="3xl" fontWeight="bold">
                  {fallbackStats.totalRevenue}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {fallbackStats.revenueGrowth}
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
                <StatNumber fontSize="3xl" fontWeight="bold">
                  {fallbackStats.platformFee}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {fallbackStats.feeGrowth}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
        {/* So'nggi faollik */}
        <Card>
          <CardHeader>
            <Heading size="md">So'nggi faollik</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              {fallbackRecentActivity.map((activity, index) => (
                <Flex key={index} align="center" gap={4}>
                  <Avatar name={activity.name} size="md" />
                  <Box flex="1">
                    <Text fontWeight="medium">{activity.name}</Text>
                    <Text fontSize="sm" color="gray.600">{activity.action}</Text>
                  </Box>
                  <Text fontSize="sm" color="gray.500">{activity.time}</Text>
                </Flex>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Tezkor statistika */}
        <Card>
          <CardHeader>
            <Heading size="md">Tezkor statistika</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Flex justify="between">
                <Flex align="center" gap={3}>
                  <Icon as={Clock} color="orange.500" boxSize={6} />
                  <Text>Kutilayotgan milestone lar</Text>
                </Flex>
                <Badge colorScheme="orange" fontSize="lg">
                  {fallbackQuickStats.pendingMilestones}
                </Badge>
              </Flex>

              <Flex justify="between">
                <Flex align="center" gap={3}>
                  <Icon as={CheckCircle} color="green.500" boxSize={6} />
                  <Text>Tugallangan loyihalar (bu oy)</Text>
                </Flex>
                <Badge colorScheme="green" fontSize="lg">
                  {fallbackQuickStats.completedThisMonth}
                </Badge>
              </Flex>

              <Flex justify="between">
                <Flex align="center" gap={3}>
                  <Icon as={AlertCircle} color="red.500" boxSize={6} />
                  <Text>Ochiq nizolar</Text>
                </Flex>
                <Badge colorScheme="red" fontSize="lg">
                  {fallbackQuickStats.openDisputes}
                </Badge>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}