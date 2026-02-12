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
  useToast,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, EditIcon, DeleteIcon, StarIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";

/* ================= THEME ================= */
const GLASS_CARD = {
  bg: "rgba(10, 18, 38, 0.55)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.10)",
  borderRadius: "2xl",
  boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  backdropFilter: "blur(12px)",
  overflow: "hidden",
};

const SHINE_OVERLAY = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  bgGradient: "linear(to-b, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
};

const inputStyle = {
  bg: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.14)",
  color: "whiteAlpha.900",
  _placeholder: { color: "whiteAlpha.500" },
  _hover: { borderColor: "rgba(255,255,255,0.28)" },
  _focus: {
    borderColor: "rgba(66,153,225,0.9)",
    boxShadow: "0 0 0 3px rgba(66,153,225,0.25)",
  },
};

const badgeBlue = {
  bg: "rgba(30,144,255,0.16)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(30,144,255,0.28)",
};
const badgeGreen = {
  bg: "rgba(0,220,130,0.14)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(0,220,130,0.22)",
};
const badgeRed = {
  bg: "rgba(255,0,80,0.10)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(255,0,80,0.18)",
};
const badgePurple = {
  bg: "rgba(170,90,255,0.16)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(170,90,255,0.26)",
};
const badgeOrange = {
  bg: "rgba(255,170,0,0.14)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(255,170,0,0.22)",
};

// modal button styles (new)
const btnGhost = {
  h: "44px",
  borderRadius: "xl",
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(255,255,255,0.09)" },
};

const btnDanger = {
  h: "44px",
  borderRadius: "xl",
  bg: "rgba(255,0,80,0.10)",
  border: "1px solid rgba(255,0,80,0.18)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(255,0,80,0.14)" },
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBoost, setSelectedBoost] = useState("all");

  const toast = useToast();
  const navigate = useNavigate();

  // ✅ NEW: delete modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // {id, title}

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

  // ✅ CHANGED: open modal instead of window.confirm
  const handleAskDelete = (job) => {
    setDeleteTarget({ id: job.id, title: job.title || "—" });
    onOpen();
  };

  // ✅ NEW: confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeleting(true);

      await api.delete(`/projects/${deleteTarget.id}`);
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));

      toast({
        title: "O'chirildi",
        description: "Loyiha muvaffaqiyatli o'chirildi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onClose();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Xato",
        description: "Loyihani o'chirishda xato yuz berdi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api("/projects?status=all&limit=1000");
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
    const labels = {
      open: "OCHIQ",
      in_progress: "JARAYONDA",
      completed: "TUGALLANGAN",
      cancelled: "BEKOR",
    };

    if (status === "open") return <Badge {...badgeGreen}>{labels[status]}</Badge>;
    if (status === "in_progress") return <Badge {...badgeBlue}>{labels[status]}</Badge>;
    if (status === "completed") return <Badge {...badgePurple}>{labels[status]}</Badge>;
    if (status === "cancelled") return <Badge {...badgeRed}>{labels[status]}</Badge>;

    return (
      <Badge bg="rgba(255,255,255,0.08)" color="whiteAlpha.900" border="1px solid rgba(255,255,255,0.12)">
        {labels[status] || status || "—"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.300" thickness="4px" />
        <Text ml={4} fontSize="lg" color="whiteAlpha.800">
          Loyihalar yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert
        status="error"
        borderRadius="xl"
        my={4}
        bg="rgba(255,0,80,0.10)"
        border="1px solid rgba(255,0,80,0.18)"
        color="whiteAlpha.900"
      >
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="whiteAlpha.900">
            Loyihalar
          </Heading>
          <Text mt={1} color="whiteAlpha.600" fontSize="sm">
            Qidirish, status va boosted filter + amallar
          </Text>
        </Box>

        <Badge {...badgeBlue} borderRadius="full" px={3} py={1.5} fontWeight="semibold">
          NATIJA: {filteredJobs.length}
        </Badge>
      </Flex>

      {/* Filters (RESPONSIVE) */}
      <Card {...GLASS_CARD} mb={6} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardBody position="relative">
          <Flex
            gap={4}
            wrap="wrap"
            align="center"
            direction={{ base: "column", md: "row" }}
          >
            <InputGroup flex="1" w="full" minW={{ base: "100%", md: "360px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="rgba(255,255,255,0.55)" />
              </InputLeftElement>
              <Input
                placeholder="Loyiha yoki mijoz nomi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                {...inputStyle}
              />
            </InputGroup>

            <Select
              w={{ base: "100%", md: "220px" }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              {...inputStyle}
            >
              <option style={{ background: "#0A1226", color: "#fff" }} value="all">Barcha statuslar</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="open">Ochiq</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="in_progress">Jarayonda</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="completed">Tugallangan</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="cancelled">Bekor qilingan</option>
            </Select>

            <Select
              w={{ base: "100%", md: "220px" }}
              value={selectedBoost}
              onChange={(e) => setSelectedBoost(e.target.value)}
              {...inputStyle}
            >
              <option style={{ background: "#0A1226", color: "#fff" }} value="all">Barcha loyihalar</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="boosted">Boostlangan</option>
              <option style={{ background: "#0A1226", color: "#fff" }} value="normal">Oddiy</option>
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Table */}
      <Card {...GLASS_CARD} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardBody position="relative" p={0}>
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr bg="rgba(255,255,255,0.04)">
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Loyiha nomi</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Mijoz</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Byudjet</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)" textAlign="center">Takliflar</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Status</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Yaratilgan</Th>
                  <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Amallar</Th>
                </Tr>
              </Thead>

              <Tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <Tr key={job.id} _hover={{ bg: "rgba(255,255,255,0.04)" }} transition="background 0.12s">
                      <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900" fontWeight="semibold">
                        {job.isBoosted && <StarIcon color="yellow.300" mr={2} />}
                        {job.title || "—"}
                      </Td>

                      <Td borderColor="rgba(255,255,255,0.06)">
                        <HStack>
                          <Avatar name={job.clientName || "?"} size="xs" />
                          <Text color="whiteAlpha.900">{job.clientName || "Noma'lum"}</Text>
                        </HStack>
                      </Td>

                      <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.800">
                        {job.budgetLabel}
                      </Td>

                      <Td borderColor="rgba(255,255,255,0.06)" textAlign="center">
                        <Badge {...badgePurple} fontSize="sm" px={3} py={1} borderRadius="lg">
                          {job.proposalsCount} ta
                        </Badge>
                      </Td>

                      <Td borderColor="rgba(255,255,255,0.06)">{getStatusBadge(job.status)}</Td>

                      <Td borderColor="rgba(255,255,255,0.06)" fontSize="sm" color="whiteAlpha.700" whiteSpace="nowrap">
                        {formatCreatedAt(job.created_at)}
                      </Td>

                      <Td borderColor="rgba(255,255,255,0.06)">
                        <HStack spacing={2} wrap="wrap">
                          <IconButton
                            as={Link}
                            to={`/admin/jobs/${job.id}`}
                            icon={<ViewIcon />}
                            size="sm"
                            aria-label="Ko'rish"
                            bg="rgba(30,144,255,0.12)"
                            color="whiteAlpha.900"
                            border="1px solid rgba(30,144,255,0.20)"
                            _hover={{ bg: "rgba(30,144,255,0.18)" }}
                          />

                          {/* ✅ CHANGED: Edit now goes to JobDetail.jsx */}
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            aria-label="Tahrirlash"
                            bg="rgba(0,220,130,0.12)"
                            color="whiteAlpha.900"
                            border="1px solid rgba(0,220,130,0.20)"
                            _hover={{ bg: "rgba(0,220,130,0.16)" }}
                            onClick={() => navigate(`/admin/jobs/${job.id}`)}
                          />

                          {/* ✅ CHANGED: Delete opens modal */}
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            aria-label="O'chirish"
                            bg="rgba(255,0,80,0.10)"
                            color="whiteAlpha.900"
                            border="1px solid rgba(255,0,80,0.18)"
                            _hover={{ bg: "rgba(255,0,80,0.14)" }}
                            onClick={() => handleAskDelete(job)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={10} color="whiteAlpha.600">
                      Hech qanday loyiha topilmadi
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* ✅ DELETE CONFIRM MODAL */}
      <Modal isOpen={isOpen} onClose={deleting ? () => {} : onClose} isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.6)" />
        <ModalContent
          bg="rgba(10, 18, 38, 0.92)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          borderRadius="2xl"
          boxShadow="0 18px 60px rgba(0,0,0,0.5)"
          backdropFilter="blur(12px)"
          mx={4}
        >
          <ModalHeader>O'chirishni tasdiqlang</ModalHeader>
          <ModalCloseButton isDisabled={deleting} />
          <ModalBody>
            <Text color="whiteAlpha.800">
              <b>{deleteTarget?.title || "—"}</b> loyihasini o'chirmoqchimisiz? Bu amal ortga qaytmaydi.
            </Text>
          </ModalBody>
          <ModalFooter gap={3} flexDir={{ base: "column", sm: "row" }} w="full">
            <Button {...btnGhost} onClick={onClose} isDisabled={deleting} w="full">
              Bekor qilish
            </Button>
            <Button
              {...btnDanger}
              onClick={handleConfirmDelete}
              isLoading={deleting}
              loadingText="O'chirilmoqda..."
              w="full"
            >
              Ha, o'chirish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}