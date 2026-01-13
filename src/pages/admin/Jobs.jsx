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
  const [filteredJobs, setFilteredJobs] = useState([]); // filtrlangan ro‘yxat
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // qidiruv so‘zi
  const [selectedStatus, setSelectedStatus] = useState("all"); // tanlangan status
  const [selectedBoost, setSelectedBoost] = useState("all"); // tanlangan boost

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api("/admin/jobs");
        const allJobs = res.data.jobs || [];

        setJobs(allJobs);
        setFilteredJobs(allJobs); // boshida hammasi ko‘rinadi
      } catch (err) {
        console.error("Loyihalarni olishda xato:", err);
        setError("Loyihalarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Qidiruv, status va boost filtri (real vaqt rejimida)
  useEffect(() => {
    let result = [...jobs];

    // Qidiruv bo‘yicha filter (loyihasi nomi yoki client nomi)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((job) => {
        return (
          (job.title || "").toLowerCase().includes(lowerSearch) ||
          (job.client_name || "").toLowerCase().includes(lowerSearch)
        );
      });
    }

    // Status bo‘yicha filter
    if (selectedStatus !== "all") {
      result = result.filter((job) => job.status === selectedStatus);
    }

    // Boost bo‘yicha filter
    if (selectedBoost !== "all") {
      const isBoosted = selectedBoost === "boosted";
      result = result.filter((job) => job.is_boosted === isBoosted);
    }

    setFilteredJobs(result);
  }, [searchTerm, selectedStatus, selectedBoost, jobs]);

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
      <HStack mb={6} spacing={4} flexWrap="wrap">
        <InputGroup maxW="500px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Loyiha nomi yoki client bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select
          maxW="200px"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">Barcha statuslar</option>
          <option value="open">Ochiq</option>
          <option value="in_progress">Jarayonda</option>
          <option value="completed">Tugallangan</option>
          <option value="cancelled">Bekor qilingan</option>
        </Select>

        <Select
          maxW="200px"
          value={selectedBoost}
          onChange={(e) => setSelectedBoost(e.target.value)}
        >
          <option value="all">Barcha loyihalar</option>
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
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Tr key={job.id} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <Link to={`/admin/jobs/${job.id}`}>
                      <Flex align="center" gap={3} cursor="pointer">
                        {job.is_boosted && <StarIcon color="yellow.500" />}
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
                  <Td fontWeight="semibold">
                    {job.budget_min && job.budget_max
                      ? `${job.budget_min.toLocaleString()} - ${job.budget_max.toLocaleString()} ${job.currency || 'UZS'}`
                      : "Belgilanmagan"}
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">
                      {job.proposals_count || 0} ta taklif
                    </Badge>
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
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center" color="gray.500">
                  Hech qanday loyiha topilmadi
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}