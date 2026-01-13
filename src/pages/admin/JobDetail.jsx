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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Real backenddan loyiha tafsilotlarini olamiz
        const res = await api(`/admin/jobs/${jobId}`);

        setJob(res.data.job || null);
      } catch (err) {
        console.error("Loyiha tafsilotlarini olishda xato:", err);
        setError("Loyiha ma'lumotlarini yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJobDetail();
  }, [jobId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} fontSize="lg">
          Loyiha tafsilotlari yuklanmoqda...
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
                    {/* Agar rating bo‘lsa qo‘shing */}
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Byudjet</Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>{job.budget}</Text>
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
                <Text fontSize="xl" fontWeight="bold" mt={1}>{job.proposals_count || 0} ta</Text>
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

          {/* Takliflar table */}
          {job.proposals && job.proposals.length > 0 && (
            <Box mt={8}>
              <Heading size="md" mb={4}>Takliflar ({job.proposals.length})</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Freelancer</Th>
                    <Th>Taklif narxi</Th>
                    <Th>Muddat</Th>
                    <Th>Amallar</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {job.proposals.map((p, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium">{p.freelancer}</Td>
                      <Td fontWeight="semibold">{p.proposed_price}</Td>
                      <Td>{p.proposed_duration}</Td>
                      <Td>
                        <Button size="sm" colorScheme="blue" variant="ghost">
                          Ko‘rish
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}