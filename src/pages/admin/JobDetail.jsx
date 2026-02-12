// src/pages/admin/JobDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
} from "@chakra-ui/react";
import { ArrowLeft, Star, Edit2, Trash2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
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

const btnPrimary = {
  h: "44px",
  borderRadius: "xl",
  fontWeight: "bold",
  bgGradient: "linear(to-r, #1E90FF, #2B6CB0)",
  color: "white",
  boxShadow: "0 16px 30px rgba(30,144,255,0.22)",
  _hover: { transform: "translateY(-1px)", boxShadow: "0 20px 34px rgba(30,144,255,0.30)" },
  _active: { transform: "translateY(0px)" },
  transition: "all 0.18s",
};

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

/* ================= HELPERS ================= */
const safeArr = (v) => (Array.isArray(v) ? v : []);
const skillsToText = (skills) => safeArr(skills).join(", ");
const textToSkills = (txt) =>
  String(txt || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const parseNumberOrNull = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // delete modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deleting, setDeleting] = useState(false);

  // edit modal
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [saving, setSaving] = useState(false);

  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // edit form
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "open",
    currency: "UZS",
    budget_min: "",
    budget_max: "",
    deadline: "", // yyyy-mm-dd
    required_skills_text: "",
    is_boosted: false,
  });

  const setF = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const normalizeJob = (j) => {
    if (!j) return null;
    return {
      ...j,
      // backendda ba'zan is_boosted / boosted keladi
      is_boosted: Boolean(j.is_boosted ?? j.boosted ?? j.isBoosted ?? false),
      required_skills: safeArr(j.required_skills ?? j.skills ?? j.requiredSkills),
      budget_min: j.budget_min ?? j.budgetMin ?? null,
      budget_max: j.budget_max ?? j.budgetMax ?? null,
    };
  };

  useEffect(() => {
    const fetchJobAndProposals = async () => {
      try {
        setLoading(true);
        setError(null);

        const jobRes = await api(`/admin/jobs/${jobId}`);
        const jobRaw = jobRes?.data?.job || jobRes?.data?.data?.job || jobRes?.job || null;
        const normalized = normalizeJob(jobRaw);
        setJob(normalized);

        const proposalsRes = await api(`/proposals/project/${jobId}`);
        setProposals(proposalsRes?.data?.proposals || proposalsRes?.data?.data?.proposals || []);

        // init edit form
        if (normalized) {
          const dl = normalized.deadline ? new Date(normalized.deadline) : null;
          const deadlineStr =
            dl && !Number.isNaN(dl.getTime())
              ? `${dl.getFullYear()}-${String(dl.getMonth() + 1).padStart(2, "0")}-${String(dl.getDate()).padStart(2, "0")}`
              : "";

          setForm({
            title: normalized.title || "",
            description: normalized.description || "",
            status: normalized.status || "open",
            currency: normalized.currency || "UZS",
            budget_min: normalized.budget_min ?? "",
            budget_max: normalized.budget_max ?? "",
            deadline: deadlineStr,
            required_skills_text: skillsToText(normalized.required_skills),
            is_boosted: Boolean(normalized.is_boosted),
          });
        }
      } catch (err) {
        console.error("Loyiha va takliflar olishda xato:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJobAndProposals();
  }, [jobId]);

  const getStatusBadge = (status) => {
    const labels = {
      open: "Ochiq",
      in_progress: "Jarayonda",
      completed: "Tugallangan",
      cancelled: "Bekor qilingan",
    };
    if (status === "open") return <Badge {...badgeGreen}>{labels[status]}</Badge>;
    if (status === "in_progress") return <Badge {...badgeBlue}>{labels[status]}</Badge>;
    if (status === "completed") return <Badge {...badgePurple}>{labels[status]}</Badge>;
    if (status === "cancelled") return <Badge {...badgeRed}>{labels[status]}</Badge>;
    return (
      <Badge bg="rgba(255,255,255,0.08)" color="whiteAlpha.900" border="1px solid rgba(255,255,255,0.12)">
        {labels[status] || status}
      </Badge>
    );
  };

  const proposalStatusBadge = (s) => {
    const label =
      s === "pending" ? "Kutilmoqda" : s === "accepted" ? "Qabul qilingan" : s === "rejected" ? "Rad etilgan" : s;

    if (s === "pending") return <Badge {...badgeOrange}>{label}</Badge>;
    if (s === "accepted") return <Badge {...badgeGreen}>{label}</Badge>;
    if (s === "rejected") return <Badge {...badgeRed}>{label}</Badge>;

    return (
      <Badge bg="rgba(255,255,255,0.08)" color="whiteAlpha.900" border="1px solid rgba(255,255,255,0.12)">
        {label}
      </Badge>
    );
  };

  const budgetLabel = useMemo(() => {
    if (!job) return "—";
    return job.budget_min != null && job.budget_max != null
      ? `${Number(job.budget_min).toLocaleString()} - ${Number(job.budget_max).toLocaleString()} ${job.currency || "UZS"}`
      : "Belgilanmagan";
  }, [job]);

  const openEdit = () => {
    if (!job) return;
    // formni yana job bilan sync qilib ochamiz
    const dl = job.deadline ? new Date(job.deadline) : null;
    const deadlineStr =
      dl && !Number.isNaN(dl.getTime())
        ? `${dl.getFullYear()}-${String(dl.getMonth() + 1).padStart(2, "0")}-${String(dl.getDate()).padStart(2, "0")}`
        : "";

    setForm({
      title: job.title || "",
      description: job.description || "",
      status: job.status || "open",
      currency: job.currency || "UZS",
      budget_min: job.budget_min ?? "",
      budget_max: job.budget_max ?? "",
      deadline: deadlineStr,
      required_skills_text: skillsToText(job.required_skills),
      is_boosted: Boolean(job.is_boosted),
    });

    onEditOpen();
  };

  const handleSaveEdit = async () => {
    if (!job?.id) return;

    try {
      setSaving(true);

      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        currency: form.currency,
        budget_min: parseNumberOrNull(form.budget_min),
        budget_max: parseNumberOrNull(form.budget_max),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        required_skills: textToSkills(form.required_skills_text),
        is_boosted: Boolean(form.is_boosted),
      };

      let updated = null;
      try {
        const r1 = await api.put(`/projects/${job.id}`, payload);
        updated = r1?.data?.job || r1?.data?.data?.job || r1?.data?.project || r1?.data?.data?.project || null;
      } 
      catch (err) {
        console.error("Update error:", err);
        throw err;
      }

      const merged = normalizeJob({ ...job, ...(updated || payload) });
      setJob(merged);

      toast({
        title: "Saqlandi",
        description: "Loyiha muvaffaqiyatli yangilandi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onEditClose();
    } catch (err) {
      console.error("Update error:", err);
      toast({
        title: "Xato",
        description: "Tahrirlashda xato yuz berdi",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!job?.id) return;

    try {
      setDeleting(true);

      // Jobs listda ham shu endpoint ishlatilgan:
      await api.delete(`/projects/${job.id}`);

      toast({
        title: "O'chirildi",
        description: "Loyiha muvaffaqiyatli o'chirildi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onDeleteClose();
      navigate("/admin/jobs");
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Xato",
        description: "Loyihani o'chirishda xato yuz berdi",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.300" thickness="4px" />
        <Text ml={4} fontSize="lg" color="whiteAlpha.800">
          Loyiha va takliflar yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error || !job) {
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
        <Text>{error || "Loyiha topilmadi."}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Top bar (RESPONSIVE) */}
      <Flex
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        mb={6}
        gap={4}
        direction={{ base: "column", md: "row" }}
      >
        <HStack spacing={3} align="start">
          <Link to="/admin/jobs">
            <IconButton aria-label="Back" icon={<ArrowLeft size={20} />} {...btnGhost} />
          </Link>

          <Box>
            <Heading size="lg" color="whiteAlpha.900">
              Loyiha tafsilotlari
            </Heading>
            <Text color="whiteAlpha.600" fontSize="sm">
              Loyiha, client va takliflar ro'yxati
            </Text>
          </Box>
        </HStack>

        <Flex gap={3} direction={{ base: "column", sm: "row" }} w={{ base: "full", md: "auto" }}>
          {/* ✅ REAL EDIT (NO ROUTE) */}
          <Button {...btnPrimary} onClick={openEdit} w={{ base: "full", md: "auto" }}>
            <HStack spacing={2}>
              <Edit2 size={18} />
              <Text>Tahrirlash</Text>
            </HStack>
          </Button>

          <Button {...btnDanger} w={{ base: "full", md: "auto" }} onClick={onDeleteOpen}>
            <HStack spacing={2}>
              <Trash2 size={18} />
              <Text>O'chirish</Text>
            </HStack>
          </Button>
        </Flex>
      </Flex>

      {/* Main card */}
      <Card {...GLASS_CARD} mb={8} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardHeader position="relative">
          <Flex justify="space-between" align="start" gap={4} wrap="wrap">
            <Box>
              <Heading size="md" color="whiteAlpha.900">
                {job.title}
              </Heading>

              <Flex align="center" gap={3} mt={3} wrap="wrap">
                {job.is_boosted && (
                  <Badge bg="rgba(255,214,10,0.12)" border="1px solid rgba(255,214,10,0.20)" color="whiteAlpha.900">
                    <HStack spacing={1}>
                      <Star size={16} />
                      <Text>Boostlangan</Text>
                    </HStack>
                  </Badge>
                )}

                {getStatusBadge(job.status)}

                <Badge bg="rgba(255,255,255,0.06)" border="1px solid rgba(255,255,255,0.10)" color="whiteAlpha.800">
                  ID: {job.id}
                </Badge>
              </Flex>
            </Box>

            <Badge {...badgeBlue} borderRadius="full" px={3} py={1.5} fontWeight="semibold">
              Takliflar: {proposals.length}
            </Badge>
          </Flex>
        </CardHeader>

        <CardBody position="relative">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Client
                </Text>
                <Flex align="center" gap={3} mt={2}>
                  <Avatar name={job.client_name} size="md" />
                  <Box>
                    <Text fontWeight="semibold" color="whiteAlpha.900">
                      {job.client_name || "Noma'lum"}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      @{job.client_username || "—"}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Byudjet
                </Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1} color="whiteAlpha.900">
                  {budgetLabel}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Muddat
                </Text>
                <Text mt={1} color="whiteAlpha.900">
                  {job.deadline ? new Date(job.deadline).toLocaleDateString() : "Belgilanmagan"}
                </Text>
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Yaratilgan sana
                </Text>
                <Text mt={1} color="whiteAlpha.900">
                  {job.created_at ? new Date(job.created_at).toLocaleDateString() : "—"}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Takliflar soni
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1} color="whiteAlpha.900">
                  {proposals.length} ta
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Kerakli skillar
                </Text>

                <Wrap mt={2}>
                  {Array.isArray(job.required_skills) && job.required_skills.length > 0 ? (
                    job.required_skills.map((skill) => (
                      <WrapItem key={skill}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          bg="rgba(30,144,255,0.10)"
                          border="1px solid rgba(30,144,255,0.18)"
                          color="whiteAlpha.900"
                        >
                          <TagLabel>{skill}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))
                  ) : (
                    <Text color="whiteAlpha.600">Skillar kiritilmagan</Text>
                  )}
                </Wrap>
              </Box>
            </VStack>
          </SimpleGrid>

          <Divider my={8} borderColor="rgba(255,255,255,0.08)" />

          <Box>
            <Text fontWeight="semibold" color="whiteAlpha.700" mb={3}>
              Loyiha tavsifi
            </Text>
            <Text color="whiteAlpha.900" whiteSpace="pre-wrap" lineHeight="1.8">
              {job.description || "—"}
            </Text>
          </Box>

          {/* Proposals */}
          {proposals.length > 0 ? (
            <Box mt={10}>
              <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                <Heading size="md" color="whiteAlpha.900">
                  Takliflar ({proposals.length})
                </Heading>
                <Badge {...badgePurple} borderRadius="full" px={3} py={1.5}>
                  pending: {proposals.filter((p) => p.status === "pending").length}
                </Badge>
              </Flex>

              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr bg="rgba(255,255,255,0.04)">
                      <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                        Freelancer
                      </Th>
                      <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                        Taklif narxi
                      </Th>
                      <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                        Muddat
                      </Th>
                      <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                        Status
                      </Th>
                      <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">
                        Amallar
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {proposals.map((p) => (
                      <Tr key={p.id} _hover={{ bg: "rgba(255,255,255,0.04)" }}>
                        <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900" fontWeight="semibold">
                          {p.freelancer_first_name} {p.freelancer_last_name}
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900" fontWeight="semibold">
                          {p.proposed_price ? `${Number(p.proposed_price).toLocaleString()} so'm` : "Noma'lum"}
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.800">
                          {p.proposed_duration ? `${p.proposed_duration} kun` : "Belgilanmagan"}
                        </Td>

                        <Td borderColor="rgba(255,255,255,0.06)">{proposalStatusBadge(p.status)}</Td>

                        <Td borderColor="rgba(255,255,255,0.06)">
                          <Button
                            as={Link}
                            to={`/admin/users/${p.freelancer_id}`}
                            size="sm"
                            borderRadius="xl"
                            bg="rgba(30,144,255,0.10)"
                            border="1px solid rgba(30,144,255,0.18)"
                            color="whiteAlpha.900"
                            _hover={{ bg: "rgba(30,144,255,0.14)" }}
                            w={{ base: "full", sm: "auto" }}
                          >
                            Ko'rish
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          ) : (
            <Box mt={10}>
              <Text color="whiteAlpha.600">Hozircha bu loyihaga taklif yuborilmagan</Text>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* ================= EDIT MODAL ================= */}
      <Modal isOpen={isEditOpen} onClose={saving ? () => {} : onEditClose} isCentered size={{ base: "full", md: "xl" }}>
        <ModalOverlay bg="rgba(0,0,0,0.6)" />
        <ModalContent
          bg="rgba(10, 18, 38, 0.92)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          borderRadius={{ base: "0", md: "2xl" }}
          boxShadow="0 18px 60px rgba(0,0,0,0.5)"
          backdropFilter="blur(12px)"
        >
          <ModalHeader>Tahrirlash</ModalHeader>
          <ModalCloseButton isDisabled={saving} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="whiteAlpha.800">Sarlavha</FormLabel>
                <Input
                  value={form.title}
                  onChange={(e) => setF("title", e.target.value)}
                  bg="rgba(255,255,255,0.06)"
                  border="1px solid rgba(255,255,255,0.10)"
                  borderRadius="xl"
                  color="whiteAlpha.900"
                  _placeholder={{ color: "whiteAlpha.600" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="whiteAlpha.800">Tavsif</FormLabel>
                <Textarea
                  value={form.description}
                  onChange={(e) => setF("description", e.target.value)}
                  minH="120px"
                  bg="rgba(255,255,255,0.06)"
                  border="1px solid rgba(255,255,255,0.10)"
                  borderRadius="xl"
                  color="whiteAlpha.900"
                  _placeholder={{ color: "whiteAlpha.600" }}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel color="whiteAlpha.800">Status</FormLabel>
                  <Select
                    value={form.status}
                    onChange={(e) => setF("status", e.target.value)}
                    bg="rgba(255,255,255,0.06)"
                    border="1px solid rgba(255,255,255,0.10)"
                    borderRadius="xl"
                    color="whiteAlpha.900"
                  >
                    <option value="open" style={{ color: "#111" }}>Ochiq</option>
                    <option value="in_progress" style={{ color: "#111" }}>Jarayonda</option>
                    <option value="completed" style={{ color: "#111" }}>Tugallangan</option>
                    <option value="cancelled" style={{ color: "#111" }}>Bekor qilingan</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.800">Valyuta</FormLabel>
                  <Select
                    value={form.currency}
                    onChange={(e) => setF("currency", e.target.value)}
                    bg="rgba(255,255,255,0.06)"
                    border="1px solid rgba(255,255,255,0.10)"
                    borderRadius="xl"
                    color="whiteAlpha.900"
                  >
                    <option value="UZS" style={{ color: "#111" }}>UZS</option>
                    <option value="USD" style={{ color: "#111" }}>USD</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.800">Budget min</FormLabel>
                  <Input
                    type="number"
                    value={form.budget_min}
                    onChange={(e) => setF("budget_min", e.target.value)}
                    bg="rgba(255,255,255,0.06)"
                    border="1px solid rgba(255,255,255,0.10)"
                    borderRadius="xl"
                    color="whiteAlpha.900"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.800">Budget max</FormLabel>
                  <Input
                    type="number"
                    value={form.budget_max}
                    onChange={(e) => setF("budget_max", e.target.value)}
                    bg="rgba(255,255,255,0.06)"
                    border="1px solid rgba(255,255,255,0.10)"
                    borderRadius="xl"
                    color="whiteAlpha.900"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.800">Deadline</FormLabel>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setF("deadline", e.target.value)}
                    bg="rgba(255,255,255,0.06)"
                    border="1px solid rgba(255,255,255,0.10)"
                    borderRadius="xl"
                    color="whiteAlpha.900"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.800">Boost</FormLabel>
                  <Select
                    value={form.is_boosted ? "1" : "0"}
                    onChange={(e) => setF("is_boosted", e.target.value === "1")}
                    bg="rgba(255,255,255,0.06)"
                    border="1px solid rgba(255,255,255,0.10)"
                    borderRadius="xl"
                    color="whiteAlpha.900"
                  >
                    <option value="0" style={{ color: "#111" }}>Oddiy</option>
                    <option value="1" style={{ color: "#111" }}>Boostlangan</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel color="whiteAlpha.800">Skills (vergul bilan)</FormLabel>
                <Input
                  value={form.required_skills_text}
                  onChange={(e) => setF("required_skills_text", e.target.value)}
                  placeholder="React, Node.js, PostgreSQL"
                  bg="rgba(255,255,255,0.06)"
                  border="1px solid rgba(255,255,255,0.10)"
                  borderRadius="xl"
                  color="whiteAlpha.900"
                  _placeholder={{ color: "whiteAlpha.600" }}
                />
                <Text mt={1} fontSize="xs" color="whiteAlpha.600">
                  Saqlanganda array bo‘lib ketadi: [{textToSkills(form.required_skills_text).join(", ")}]
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3} flexDirection={{ base: "column", sm: "row" }}>
            <Button {...btnGhost} onClick={onEditClose} isDisabled={saving} w={{ base: "full", sm: "auto" }}>
              Bekor qilish
            </Button>
            <Button
              {...btnPrimary}
              onClick={handleSaveEdit}
              isLoading={saving}
              loadingText="Saqlanmoqda..."
              w={{ base: "full", sm: "auto" }}
            >
              Saqlash
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      <Modal isOpen={isDeleteOpen} onClose={deleting ? () => {} : onDeleteClose} isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.6)" />
        <ModalContent
          bg="rgba(10, 18, 38, 0.92)"
          border="1px solid rgba(255,255,255,0.10)"
          color="whiteAlpha.900"
          borderRadius="2xl"
          boxShadow="0 18px 60px rgba(0,0,0,0.5)"
          backdropFilter="blur(12px)"
        >
          <ModalHeader>O'chirishni tasdiqlang</ModalHeader>
          <ModalCloseButton isDisabled={deleting} />
          <ModalBody>
            <Text color="whiteAlpha.800">
              <b>{job.title}</b> loyihasini o'chirilsinmi? Bu amal ortga qaytmaydi.
            </Text>
          </ModalBody>
          <ModalFooter gap={3} flexDirection={{ base: "column", sm: "row" }}>
            <Button {...btnGhost} onClick={onDeleteClose} isDisabled={deleting} w={{ base: "full", sm: "auto" }}>
              Bekor qilish
            </Button>
            <Button
              {...btnDanger}
              onClick={handleDelete}
              isLoading={deleting}
              loadingText="O'chirilmoqda..."
              w={{ base: "full", sm: "auto" }}
            >
              Ha, o'chirish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
