// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from "react";
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
import api from "../../lib/api"; // admin panel uchun api utils

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

        // Backend dan barcha ma’lumotni bir so‘rovda olish (masalan /admin/dashboard)
        const res = await api("/admin/dashboard");

        setStats(res.data.stats); // masalan: users, activeJobs, totalRevenue, platformFee
        setRecentActivity(res.data.recentActivity);
        setQuickStats(res.data.quickStats); // pendingMilestones, completedThisMonth, openDisputes
      } catch (err) {
        console.error("Dashboard data olishda xato:", err);
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
          Yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

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
                  {stats?.totalUsers || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats?.usersGrowth || "+0%"}
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
                  {stats?.activeJobs || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats?.jobsGrowth || "+0%"}
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
                  {stats?.totalRevenue || "0 so‘m"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats?.revenueGrowth || "+0%"}
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
                  {stats?.platformFee || "0 so‘m"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats?.feeGrowth || "+0%"}
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
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <Flex key={index} align="center" gap={4}>
                    <Avatar name={activity.name} size="md" />
                    <Box flex="1">
                      <Text fontWeight="medium">{activity.name}</Text>
                      <Text fontSize="sm" color="gray.600">{activity.action}</Text>
                    </Box>
                    <Text fontSize="sm" color="gray.500">{activity.time}</Text>
                  </Flex>
                ))
              ) : (
                <Text color="gray.500">Hozircha faollik yo‘q</Text>
              )}
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
                  {quickStats?.pendingMilestones || 0}
                </Badge>
              </Flex>

              <Flex justify="between">
                <Flex align="center" gap={3}>
                  <Icon as={CheckCircle} color="green.500" boxSize={6} />
                  <Text>Tugallangan loyihalar (bu oy)</Text>
                </Flex>
                <Badge colorScheme="green" fontSize="lg">
                  {quickStats?.completedThisMonth || 0}
                </Badge>
              </Flex>

              <Flex justify="between">
                <Flex align="center" gap={3}>
                  <Icon as={AlertCircle} color="red.500" boxSize={6} />
                  <Text>Ochiq nizolar</Text>
                </Flex>
                <Badge colorScheme="red" fontSize="lg">
                  {quickStats?.openDisputes || 0}
                </Badge>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}