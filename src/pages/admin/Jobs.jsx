// src/pages/admin/Jobs.jsx
import React, { useState, useEffect } from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  IconButton,
  Avatar,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, EditIcon, DeleteIcon, StarIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import api from "../../lib/api";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Real backenddan loyihalar ro‘yxatini olamiz
        const res = await api("/admin/jobs");

        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error("Loyihalarni olishda xato:", err);
        setError("Loyihalarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

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

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} fontSize="lg">
          Loyihalar yuklanmoqda...
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
                  <Link to={`/admin/jobs/${job.id}`}>
                    <Flex align="center" gap={3} cursor="pointer">
                      {job.boosted && <StarIcon color="yellow.500" />}
                      <Text fontWeight="medium" color="blue.600">
                        {job.title}
                      </Text>
                    </Flex>
                  </Link>
                </Td>
                <Td>
                  <Flex align="center" gap={2}>
                    <Avatar name={job.client_name} size="sm" />
                    <Text>{job.client_name}</Text>
                  </Flex>
                </Td>
                <Td fontWeight="semibold">{job.budget}</Td>
                <Td>
                  <Badge colorScheme="blue">{job.proposals || "Noma'lum"} ta taklif</Badge>
                </Td>
                <Td>{getStatusBadge(job.status)}</Td>
                <Td>{new Date(job.created_at).toLocaleDateString()}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Link to={`/admin/jobs/${job.id}`}>
                      <IconButton
                        icon={<ViewIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        aria-label="Ko'rish"
                      />
                    </Link>
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