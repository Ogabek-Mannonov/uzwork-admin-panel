// src/pages/admin/JobDetail.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Divider,
  VStack,
  HStack,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { ArrowLeft, Star, Edit2, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../lib/api";

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]); // takliflar ro‘yxati
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobAndProposals = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Loyiha tafsilotlarini olish
        const jobRes = await api(`/admin/jobs/${jobId}`);
        setJob(jobRes.data.job || null);

        // 2. Ushbu loyihaga yuborilgan takliflar ro‘yxatini olish
        const proposalsRes = await api(`/proposals/project/${jobId}`);
        setProposals(proposalsRes.data.proposals || []);
      } catch (err) {
        console.error("Loyiha va takliflar olishda xato:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJobAndProposals();
  }, [jobId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} fontSize="lg">
          Loyiha va takliflar yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error || !job) {
    return (
      <Alert status="error" borderRadius="lg" my={8}>
        <AlertIcon />
        <Text>{error || "Loyiha topilmadi."}</Text>
      </Alert>
    );
  }

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
    return (
      <Badge colorScheme={colorScheme[status] || "gray"} fontSize="md" px={3} py={1} borderRadius="full">
        {label[status] || status}
      </Badge>
    );
  };

  return (
    <Box>
      {/* Back tugmasi */}
      <Flex align="center" mb={6} gap={4}>
        <Link to="/admin/jobs">
          <IconButton icon={<ArrowLeft size={20} />} colorScheme="gray" variant="ghost" />
        </Link>
        <Heading size="xl">Loyiha tafsilotlari</Heading>
      </Flex>

      <Card mb={8}>
        <CardHeader>
          <Flex justify="space-between" align="start">
            <Box>
              <Heading size="lg">{job.title}</Heading>
              <Flex align="center" gap={4} mt={3}>
                {job.is_boosted && (
                  <Badge colorScheme="yellow">
                    <HStack spacing={1}>
                      <Star size={16} />
                      <Text>Boostlangan</Text>
                    </HStack>
                  </Badge>
                )}
                {getStatusBadge(job.status)}
                <Text color="gray.600">ID: {job.id}</Text>
              </Flex>
            </Box>
            <HStack spacing={3}>
              <Button colorScheme="blue">
                <HStack spacing={2}>
                  <Edit2 size={18} />
                  <Text>Tahrirlash</Text>
                </HStack>
              </Button>
              <Button colorScheme="red" variant="outline">
                <HStack spacing={2}>
                  <Trash2 size={18} />
                  <Text>O‘chirish</Text>
                </HStack>
              </Button>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Client</Text>
                <Flex align="center" gap={3} mt={1}>
                  <Avatar name={job.client_name} size="md" />
                  <Box>
                    <Text fontWeight="semibold">{job.client_name}</Text>
                    <Text fontSize="sm" color="gray.600">@{job.client_username}</Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Byudjet</Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>
                  {job.budget_min && job.budget_max
                    ? `${job.budget_min.toLocaleString()} - ${job.budget_max.toLocaleString()} ${job.currency || 'UZS'}`
                    : "Belgilanmagan"}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Muddat</Text>
                <Text mt={1}>{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Belgilanmagan"}</Text>
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Yaratilgan sana</Text>
                <Text mt={1}>{new Date(job.created_at).toLocaleDateString()}</Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Takliflar soni</Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>{proposals.length} ta</Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Kerakli skillar</Text>
                <Wrap mt={2}>
                  {job.required_skills?.map((skill) => (
                    <WrapItem key={skill}>
                      <Tag size="lg" colorScheme="blue" variant="subtle">
                        <TagLabel>{skill}</TagLabel>
                      </Tag>
                    </WrapItem>
                  )) || <Text color="gray.500">Skillar kiritilmagan</Text>}
                </Wrap>
              </Box>
            </VStack>
          </SimpleGrid>

          <Divider my={8} />

          <Box>
            <Text fontWeight="medium" color="gray.600" mb={4}>Loyiha tavsifi</Text>
            <Text whiteSpace="pre-wrap">{job.description}</Text>
          </Box>

          {/* Takliflar jadvali – real takliflar */}
          {proposals.length > 0 ? (
            <Box mt={8}>
              <Heading size="md" mb={4}>Takliflar ({proposals.length})</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Freelancer</Th>
                    <Th>Taklif narxi</Th>
                    <Th>Muddat</Th>
                    <Th>Status</Th>
                    <Th>Amallar</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {proposals.map((p) => (
                    <Tr key={p.id}>
                      <Td fontWeight="medium">
                        {p.freelancer_first_name} {p.freelancer_last_name}
                      </Td>
                      <Td fontWeight="semibold">
                        {p.proposed_price ? `${p.proposed_price.toLocaleString()} so‘m` : "Noma'lum"}
                      </Td>
                      <Td>{p.proposed_duration ? `${p.proposed_duration} kun` : "Belgilanmagan"}</Td>
                      <Td>
                        <Badge colorScheme={
                          p.status === "pending" ? "yellow" :
                            p.status === "accepted" ? "green" :
                              p.status === "rejected" ? "red" : "gray"
                        }>
                          {p.status === "pending" ? "Kutilmoqda" :
                            p.status === "accepted" ? "Qabul qilingan" :
                              p.status === "rejected" ? "Rad etilgan" : p.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          as={Link}
                          to={`/admin/users/${p.freelancer_id}`}  // ← bu yerda UserDetail.jsx ga yo‘naltirish
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                        >
                          Ko'rish
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Box mt={8}>
              <Text color="gray.500">Hozircha bu loyihaga taklif yuborilmagan</Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}