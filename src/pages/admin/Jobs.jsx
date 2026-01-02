// src/pages/admin/Jobs.jsx
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
  Button,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  IconButton,
  Avatar,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { SearchIcon, EditIcon, DeleteIcon, StarIcon, ViewIcon } from "@chakra-ui/icons";

export default function AdminJobs() {
  // Mock data – keyin backend dan olamiz
  const jobs = [
    {
      id: 1,
      title: "React JS da responsiv sayt",
      client: "Kamola Company",
      budget: "5,000,000 so'm",
      status: "open",
      proposals: 12,
      boosted: true,
      createdAt: "2026-01-01",
    },
    {
      id: 2,
      title: "Flutter mobil ilova",
      client: "Tech Startup",
      budget: "15,000,000 so'm",
      status: "in_progress",
      proposals: 8,
      boosted: false,
      createdAt: "2025-12-28",
    },
    {
      id: 3,
      title: "Logo dizayn",
      client: "Shaxsiy",
      budget: "1,500,000 so'm",
      status: "completed",
      proposals: 25,
      boosted: false,
      createdAt: "2025-12-20",
    },
    {
      id: 4,
      title: "Backend API (Node.js)",
      client: "E-commerce",
      budget: "10,000,000 so'm",
      status: "cancelled",
      proposals: 5,
      boosted: true,
      createdAt: "2025-12-15",
    },
  ];

  const getStatusBadge = (status) => {
    const colorScheme = {
      open: "green",
      in_progress: "blue",
      completed: "purple",
      cancelled: "red",
    };
    const label = {
      open: "Ochiq",
      in_progress: "Jarayonda",
      completed: "Tugallangan",
      cancelled: "Bekor qilingan",
    };
    return <Badge colorScheme={colorScheme[status] || "gray"}>{label[status] || status}</Badge>;
  };

  return (
    <Box>
      <Heading size="xl" mb={8}>
        Loyihalar
      </Heading>

      {/* Qidiruv va filter */}
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="500px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input placeholder="Loyiha nomi, client yoki ID bo'yicha qidirish" />
        </InputGroup>

        <Select maxW="200px" placeholder="Status">
          <option value="all">Barchasi</option>
          <option value="open">Ochiq</option>
          <option value="in_progress">Jarayonda</option>
          <option value="completed">Tugallangan</option>
          <option value="cancelled">Bekor qilingan</option>
        </Select>

        <Select maxW="200px" placeholder="Boost">
          <option value="all">Barchasi</option>
          <option value="boosted">Boostlangan</option>
          <option value="normal">Oddiy</option>
        </Select>
      </HStack>

      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="lg">
          <Thead>
            <Tr bg="gray.50">
              <Th>Loyiha nomi</Th>
              <Th>Client</Th>
              <Th>Byudjet</Th>
              <Th>Takliflar</Th>
              <Th>Status</Th>
              <Th>Yaratilgan</Th>
              <Th>Amallar</Th>
            </Tr>
          </Thead>
          <Tbody>
            {jobs.map((job) => (
              <Tr key={job.id} _hover={{ bg: "gray.50" }}>
                <Td>
                  <Flex align="center" gap={3}>
                    {job.boosted && <StarIcon color="yellow.500" />}
                    <Text fontWeight="medium">{job.title}</Text>
                  </Flex>
                </Td>
                <Td>
                  <Flex align="center" gap={2}>
                    <Avatar name={job.client} size="sm" />
                    <Text>{job.client}</Text>
                  </Flex>
                </Td>
                <Td fontWeight="semibold">{job.budget}</Td>
                <Td>
                  <Badge colorScheme="blue">{job.proposals} ta taklif</Badge>
                </Td>
                <Td>{getStatusBadge(job.status)}</Td>
                <Td>{job.createdAt}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<ViewIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      aria-label="Ko'rish"
                    />
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="green"
                      variant="ghost"
                      aria-label="Tahrirlash"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      aria-label="O'chirish"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}