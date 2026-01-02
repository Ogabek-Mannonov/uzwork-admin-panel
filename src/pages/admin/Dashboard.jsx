// src/pages/admin/Dashboard.jsx
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
  VStack,  // <--- BU YERDA QO'SHILDI
  Icon,
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

export default function AdminDashboard() {
  // Mock data – keyin backend dan olamiz
  const stats = [
    { label: "Jami foydalanuvchilar", value: "8,542", change: "+12.5%", trend: "increase" },
    { label: "Faol loyihalar", value: "126", change: "+8.3%", trend: "increase" },
    { label: "Umumiy daromad", value: "1.24 mlrd so'm", change: "+23.1%", trend: "increase" },
    { label: "Platforma haqi", value: "248 mln so'm", change: "+18.7%", trend: "increase" },
  ];

  const recentActivity = [
    { name: "Ogabek Developer", action: "Yangi loyiha joylashtirdi", time: "5 daqiqa oldin" },
    { name: "Ali Freelancer", action: "Taklif yubordi", time: "12 daqiqa oldin" },
    { name: "Kamola Client", action: "To'lov amalga oshirdi", time: "25 daqiqa oldin" },
    { name: "Rustam Admin", action: "Foydalanuvchini tasdiqladi", time: "1 soat oldin" },
  ];

  return (
    <Box>
      <Heading size="xl" mb={8}>
        Dashboard
      </Heading>

      {/* Statistika kartochkalari */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={10}>
        {stats.map((stat) => (
          <GridItem key={stat.label}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">{stat.label}</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">
                    {stat.value}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={stat.trend === "increase" ? "increase" : "decrease"} />
                    {stat.change}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
        {/* So'nggi faollik */}
        <Card>
          <CardHeader>
            <Heading size="md">So'nggi faollik</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              {recentActivity.map((activity, index) => (
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
                <Badge colorScheme="orange" fontSize="lg">24</Badge>
              </Flex>
              <Flex justify="between">
                <Flex align="center" gap={3}>
                  <Icon as={CheckCircle} color="green.500" boxSize={6} />
                  <Text>Tugallangan loyihalar (bu oy)</Text>
                </Flex>
                <Badge colorScheme="green" fontSize="lg">67</Badge>
              </Flex>
              <Flex justify="between">
                <Flex align="center" gap={3}>
                  <Icon as={AlertCircle} color="red.500" boxSize={6} />
                  <Text>Ochiq nizolar</Text>
                </Flex>
                <Badge colorScheme="red" fontSize="lg">5</Badge>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}