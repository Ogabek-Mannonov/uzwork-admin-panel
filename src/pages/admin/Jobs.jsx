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
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBoost, setSelectedBoost] = useState("all");

  // Sana vaqtni xavfsiz va chiroyli formatlash funksiyasi
  const formatDate = (value) => {
    if (!value) return "—";

    const str = String(value).trim();

    // Agar sana allaqachon yaxshi formatda bo'lsa
    const isoRegex = /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}/;
    if (isoRegex.test(str)) {
      try {
        return new Date(str).toLocaleString("uz-UZ", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } catch {}
    }

    // "M01", "MOI" kabi xatolarni tuzatish
    const cleaned = str
      .replace(/MOI?/gi, "01")
      .replace(/M(\d{1,2})/g, (m, d) => d.padStart(2, "0"))
      .replace(/(\d{4})\s*([01]\d)\s*(\d{1,2})/, "$1-$2-$3");

    try {
      const date = new Date(cleaned);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("uz-UZ", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    } catch {error}

    // Agar hech narsa ishlamasa → xom qiymatni chiroyli qilamiz
    return str.replace("T", " ").replace(/\.\d+Z?$/, "").slice(0, 19) || "—";
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api("/admin/jobs");
        const allJobs = res.data.jobs || [];
        setJobs(allJobs);
        setFilteredJobs(allJobs);
      } catch (err) {
        console.error("Loyihalarni olishda xato:", err);
        setError("Loyihalarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Real vaqtda filtr
  useEffect(() => {
    let result = [...jobs];

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          (job.title || "").toLowerCase().includes(lowerSearch) ||
          (job.client_name || "").toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedStatus !== "all") {
      result = result.filter((job) => job.status === selectedStatus);
    }

    if (selectedBoost !== "all") {
      const isBoosted = selectedBoost === "boosted";
      result = result.filter((job) => job.is_boosted === isBoosted);
    }

    setFilteredJobs(result);
  }, [searchTerm, selectedStatus, selectedBoost, jobs]);

  const getStatusBadge = (status) => {
    const schemes = {
      open: "green",
      in_progress: "blue",
      completed: "purple",
      cancelled: "red",
    };

    const labels = {
      open: "Ochiq",
      in_progress: "Jarayonda",
      completed: "Tugallangan",
      cancelled: "Bekor qilingan",
    };

    return (
      <Badge colorScheme={schemes[status] || "gray"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" />
        <Text ml={4}>Loyihalar yuklanmoqda...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Barcha loyihalar (UzWork)</Heading>

      <Flex mb={6} gap={4} wrap="wrap">
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Loyiha yoki mijoz nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select
          maxW="220px"
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
          maxW="220px"
          value={selectedBoost}
          onChange={(e) => setSelectedBoost(e.target.value)}
        >
          <option value="all">Barcha loyihalar</option>
          <option value="boosted">Boostlangan</option>
          <option value="normal">Oddiy</option>
        </Select>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              <Th>Loyiha nomi</Th>
              <Th>Mijoz</Th>
              <Th>Byudjet</Th>
              <Th textAlign="center">Takliflar</Th>
              <Th>Status</Th>
              <Th>Yaratilgan sana</Th>
              <Th>Amallar</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Tr key={job.id}>
                  <Td>
                    {job.is_boosted && <StarIcon color="yellow.400" mr={2} />}
                    {job.title || "—"}
                  </Td>
                  <Td>
                    <HStack>
                      <Avatar name={job.client_name || "?"} size="xs" />
                      <Text>{job.client_name || "Noma'lum"}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    {job.budget_min && job.budget_max
                      ? `${job.budget_min.toLocaleString()} - ${job.budget_max.toLocaleString()} ${job.currency || "UZS"}`
                      : "Belgilanmagan"}
                  </Td>
                  <Td textAlign="center">
                    <Badge colorScheme="purple" variant="subtle" fontSize="sm" px={3} py={1}>
                      {job.proposals_count ?? 0} ta
                    </Badge>
                  </Td>
                  <Td>{getStatusBadge(job.status)}</Td>
                  <Td fontSize="sm" whiteSpace="nowrap">
                    {formatDate(job.created_at)}
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton
                        as={Link}
                        to={`/admin/jobs/${job.id}`}
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
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center" py={10}>
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