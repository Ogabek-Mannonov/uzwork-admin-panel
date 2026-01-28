// src/pages/admin/AdminJobs.jsx
import React, { useEffect, useMemo, useState } from "react";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBoost, setSelectedBoost] = useState("all");

  const formatCreatedAt = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return "—";

    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    }

    const match = dateStr.match(/^(\d{4})\s*M?0?(\d{1,2})\s*(\d{1,2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
    }

    return dateStr.slice(0, 10).replace(/-/g, ".") || "—";
  };

  const buildBudgetLabel = (job) => {
    // Agar backend allaqachon string budget yuborsa
    if (job?.budget && typeof job.budget === "string") return job.budget;

    const min = job?.budget_min ?? job?.budgetMin;
    const max = job?.budget_max ?? job?.budgetMax;
    const currency = job?.currency || "UZS";

    if (min != null && max != null) {
      const minN = Number(min);
      const maxN = Number(max);
      if (!Number.isNaN(minN) && !Number.isNaN(maxN)) {
        return `${minN.toLocaleString()} - ${maxN.toLocaleString()} ${currency}`;
      }
      return `${min} - ${max} ${currency}`;
    }

    return "Belgilanmagan";
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api("/projects?status=all&limit=1000");

        // api wrapper ba'zan res.data emas, to'g'ridan-to'g'ri payload qaytaradi
        const payload = res?.data ?? res;

        const allJobs =
          payload?.data?.projects ||
          payload?.projects ||
          payload?.data?.data?.projects ||
          [];

        const normalized = (allJobs || []).map((j) => {
          const clientName =
            `${j.client_first_name || ""} ${j.client_last_name || ""}`.trim() ||
            j.client_name ||
            j.client_username ||
            "Noma'lum";

          const isBoosted = Boolean(j.boosted ?? j.is_boosted ?? j.isBoosted ?? false);

          const proposalsCount = Number(
            j.proposals_count ??
              j.proposalsCount ??
              j.offers_count ??
              j.offersCount ??
              j.bids_count ??
              j.bidsCount ??
              0
          );

          return {
            ...j,
            clientName,
            isBoosted,
            proposalsCount: Number.isNaN(proposalsCount) ? 0 : proposalsCount,
            budgetLabel: buildBudgetLabel(j),
          };
        });

        console.log("projects sample:", normalized?.[0]);
        setJobs(normalized);
      } catch (err) {
        console.error("Loyihalarni olishda xato:", err);
        setError("Loyihalarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          (job.title || "").toLowerCase().includes(lower) ||
          (job.clientName || "").toLowerCase().includes(lower)
      );
    }

    if (selectedStatus !== "all") {
      result = result.filter((job) => job.status === selectedStatus);
    }

    if (selectedBoost !== "all") {
      const wantBoosted = selectedBoost === "boosted";
      result = result.filter((job) => Boolean(job.isBoosted) === wantBoosted);
    }

    return result;
  }, [jobs, searchTerm, selectedStatus, selectedBoost]);

  const getStatusBadge = (status) => {
    const schemes = {
      open: "green",
      in_progress: "blue",
      completed: "purple",
      cancelled: "red",
    };
    const labels = {
      open: "OCHIQ",
      in_progress: "JARAYONDA",
      completed: "TUGALLANGAN",
      cancelled: "BEKOR",
    };

    return (
      <Badge colorScheme={schemes[status] || "gray"}>
        {labels[status] || status || "—"}
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
                    {job.isBoosted && <StarIcon color="yellow.400" mr={2} />}
                    {job.title || "—"}
                  </Td>

                  <Td>
                    <HStack>
                      <Avatar name={job.clientName || "?"} size="xs" />
                      <Text>{job.clientName || "Noma'lum"}</Text>
                    </HStack>
                  </Td>

                  <Td>{job.budgetLabel}</Td>

                  <Td textAlign="center">
                    <Badge colorScheme="purple" variant="subtle" fontSize="sm" px={3} py={1}>
                      {job.proposalsCount} ta
                    </Badge>
                  </Td>

                  <Td>{getStatusBadge(job.status)}</Td>

                  <Td fontSize="sm" whiteSpace="nowrap">
                    {formatCreatedAt(job.created_at)}
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
