// src/pages/admin/JobDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "open",
    currency: "UZS",
    budget_min: "",
    budget_max: "",
    deadline: "",
    required_skills_text: "",
    is_boosted: false,
  });

  const setF = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const normalizeJob = (j) => {
    if (!j) return null;
    return {
      ...j,
      is_boosted: Boolean(j.is_boosted ?? j.boosted ?? j.isBoosted ?? false),
      required_skills: safeArr(j.required_skills ?? j.skills ?? j.requiredSkills),
      budget_min: j.budget_min ?? j.budgetMin ?? null,
      budget_max: j.budget_max ?? j.budgetMax ?? null,
    };
  };

  const { data: jobAndProposals, isLoading, error } = useQuery({
    queryKey: ["admin", "job", jobId],
    queryFn: async () => {
      const [jobRes, proposalsRes] = await Promise.all([
        api(`/admin/jobs/${jobId}`),
        api(`/proposals/project/${jobId}`),
      ]);

      const jobRaw = jobRes?.data?.job || jobRes?.data?.data?.job || jobRes?.job || null;
      const normalized = normalizeJob(jobRaw);
      const proposals = proposalsRes?.data?.proposals || proposalsRes?.data?.data?.proposals || [];

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

      return { job: normalized, proposals };
    },
  });

  const job = jobAndProposals?.job || null;
  const proposals = jobAndProposals?.proposals || [];

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      await api.put(`/admin/jobs/${jobId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      onEditClose();
      toast({
        title: "Saqlandi",
        description: "Loyiha ma'lumotlari yangilandi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    onError: (err) => {
      console.error("Update error:", err);
      toast({
        title: "Xato",
        description: "Saqlashda xato yuz berdi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast({
        title: "O'chirildi",
        description: "Loyiha muvaffaqiyatli o'chirildi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/admin/jobs");
    },
    onError: (err) => {
      console.error("Delete error:", err);
      toast({
        title: "Xato",
        description: "Loyihani o'chirishda xato yuz berdi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

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
    return <Badge bg="rgba(255,255,255,0.08)" color="whiteAlpha.900">{labels[status] || status}</Badge>;
  };

  const proposalStatusBadge = (s) => {
    const label = s === "pending" ? "Kutilmoqda" : s === "accepted" ? "Qabul qilingan" : s === "rejected" ? "Rad etilgan" : s;
    if (s === "pending") return <Badge {...badgeOrange}>{label}</Badge>;
    if (s === "accepted") return <Badge {...badgeGreen}>{label}</Badge>;
    if (s === "rejected") return <Badge {...badgeRed}>{label}</Badge>;
    return <Badge bg="rgba(255,255,255,0.08)" color="whiteAlpha.900">{label}</Badge>;
  };

  const budgetLabel = useMemo(() => {
    if (!job) return "—";
    return job.budget_min != null && job.budget_max != null
      ? `${Number(job.budget_min).toLocaleString()} - ${Number(job.budget_max).toLocaleString()} ${job.currency || "UZS"}`
      : "Belgilanmagan";
  }, [job]);

  const handleConfirmSave = () => {
    const payload = {
      ...form,
      budget_min: parseNumberOrNull(form.budget_min),
      budget_max: parseNumberOrNull(form.budget_max),
      required_skills: textToSkills(form.required_skills_text),
    };
    updateMutation.mutate(payload);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.300" thickness="4px" />
        <Text ml={4} fontSize="lg" color="whiteAlpha.800">
          Ma'lumotlar yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error || !job) {
    return (
      <Alert status="error" borderRadius="xl" my={4} bg="rgba(255,0,80,0.10)" border="1px solid rgba(255,0,80,0.18)" color="whiteAlpha.900">
        <AlertIcon />
        <Text>{error?.message || "Loyiha topilmadi"}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={6} gap={4} wrap="wrap">
        <HStack spacing={3}>
          <Link to="/admin/jobs">
            <IconButton aria-label="Back" icon={<ArrowLeft size={20} />} {...btnGhost} />
          </Link>
          <Box>
            <Heading size="lg" color="whiteAlpha.900">Loyiha Tafsilotlari</Heading>
            <Text color="whiteAlpha.600" fontSize="sm">Loyihani boshqarish va takliflarni ko'rish</Text>
          </Box>
        </HStack>

        <HStack spacing={3} wrap="wrap">
          <Button {...btnGhost} leftIcon={<Edit2 size={18} />} onClick={onEditOpen}>
            Tahrirlash
          </Button>
          <Button {...btnDanger} leftIcon={<Trash2 size={18} />} onClick={onDeleteOpen}>
            O'chirish
          </Button>
        </HStack>
      </Flex>

      <Card {...GLASS_CARD} mb={8} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardHeader position="relative">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <HStack mb={2}>
                {getStatusBadge(job.status)}
                {job.is_boosted && <Badge {...badgePurple}>BOOSTED</Badge>}
              </HStack>
              <Heading size="md" color="whiteAlpha.900">{job.title}</Heading>
              <Text color="whiteAlpha.500" fontSize="sm" mt={1}>
                ID: #{job.id} | Yaratilgan: {new Date(job.created_at).toLocaleString()}
              </Text>
            </Box>
            <VStack align="end" spacing={1}>
              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">Budjet</Text>
              <Text color="green.300" fontWeight="bold" fontSize="xl">{budgetLabel}</Text>
            </VStack>
          </Flex>
        </CardHeader>

        <CardBody position="relative">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
            <VStack align="start" spacing={5}>
              <Box>
                <Heading size="sm" color="whiteAlpha.700" mb={2} textTransform="uppercase">Tavsif</Heading>
                <Text color="whiteAlpha.900" whiteSpace="pre-wrap">{job.description}</Text>
              </Box>
              <Box>
                <Heading size="sm" color="whiteAlpha.700" mb={2} textTransform="uppercase">Talab qilinadigan ko'nikmalar</Heading>
                <Wrap spacing={2}>
                  {job.required_skills.length > 0 ? (
                    job.required_skills.map((s, idx) => (
                      <WrapItem key={idx}>
                        <Tag bg="rgba(255,255,255,0.08)" color="whiteAlpha.900" border="1px solid rgba(255,255,255,0.12)">
                          <TagLabel>{s}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))
                  ) : (
                    <Text color="whiteAlpha.500" fontSize="sm">Belgilanmagan</Text>
                  )}
                </Wrap>
              </Box>
            </VStack>

            <VStack align="start" spacing={5}>
              <SimpleGrid columns={2} w="full" spacing={5}>
                <Box>
                  <Text color="whiteAlpha.500" fontSize="xs" textTransform="uppercase">Muddati</Text>
                  <Text color="whiteAlpha.900">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Belgilanmagan"}</Text>
                </Box>
                <Box>
                  <Text color="whiteAlpha.500" fontSize="xs" textTransform="uppercase">Valyuta</Text>
                  <Text color="whiteAlpha.900">{job.currency || "UZS"}</Text>
                </Box>
              </SimpleGrid>

              <Divider borderColor="rgba(255,255,255,0.08)" />

              <Box w="full">
                <Heading size="sm" color="whiteAlpha.700" mb={3} textTransform="uppercase">Mijoz (Buyurtmachi)</Heading>
                <Link to={`/admin/users/${job.client_id}`}>
                  <Flex p={3} {...SOFT} _hover={{ bg: "rgba(255,255,255,0.09)" }} transition="0.2s">
                    <Avatar size="sm" name={job.client_name || job.client_username} mr={3} />
                    <Box>
                      <Text fontWeight="bold" color="whiteAlpha.900">{job.client_name || job.client_username || "Noma'lum"}</Text>
                      <Text fontSize="xs" color="whiteAlpha.500">Mijoz profilini ko'rish</Text>
                    </Box>
                  </Flex>
                </Link>
              </Box>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      <Card {...GLASS_CARD}>
        <CardHeader>
          <Heading size="md" color="whiteAlpha.900">Takliflar ({proposals.length})</Heading>
        </CardHeader>
        <CardBody p={0}>
          <Table variant="simple">
            <Thead bg="rgba(255,255,255,0.04)">
              <Tr>
                <Th color="whiteAlpha.600">Freelancer</Th>
                <Th color="whiteAlpha.600">Taklif summasi</Th>
                <Th color="whiteAlpha.600">Status</Th>
                <Th color="whiteAlpha.600">Sana</Th>
              </Tr>
            </Thead>
            <Tbody>
              {proposals.length > 0 ? (
                proposals.map((p) => (
                  <Tr key={p.id} _hover={{ bg: "rgba(255,255,255,0.04)" }}>
                    <Td borderColor="rgba(255,255,255,0.06)">
                      <Flex align="center">
                        <Avatar size="xs" name={p.freelancer_name} mr={2} />
                        <Link to={`/admin/users/${p.freelancer_id}`}>
                          <Text color="blue.300" _hover={{ textDecoration: "underline" }}>{p.freelancer_name || "Freelancer"}</Text>
                        </Link>
                      </Flex>
                    </Td>
                    <Td borderColor="rgba(255,255,255,0.06)">
                      <Text fontWeight="bold" color="green.300">{p.amount?.toLocaleString()} {job.currency}</Text>
                    </Td>
                    <Td borderColor="rgba(255,255,255,0.06)">{proposalStatusBadge(p.status)}</Td>
                    <Td borderColor="rgba(255,255,255,0.06)">
                      <Text color="whiteAlpha.500" fontSize="sm">{new Date(p.created_at).toLocaleDateString()}</Text>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={10} color="whiteAlpha.500">Hozircha takliflar yo'q</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={updateMutation.isPending ? () => {} : onEditClose} size="xl">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg="rgba(10, 18, 38, 0.95)" border="1px solid rgba(255,255,255,0.15)" color="white">
          <ModalHeader>Loyihani Tahrirlash</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Sarlavha</FormLabel>
                <Input value={form.title} onChange={(e) => setF("title", e.target.value)} bg="whiteAlpha.100" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Tavsif</FormLabel>
                <Textarea value={form.description} onChange={(e) => setF("description", e.target.value)} bg="whiteAlpha.100" minH="150px" />
              </FormControl>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Budjet Min</FormLabel>
                  <Input type="number" value={form.budget_min} onChange={(e) => setF("budget_min", e.target.value)} bg="whiteAlpha.100" />
                </FormControl>
                <FormControl>
                  <FormLabel>Budjet Max</FormLabel>
                  <Input type="number" value={form.budget_max} onChange={(e) => setF("budget_max", e.target.value)} bg="whiteAlpha.100" />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Ko'nikmalar (vergul bilan ajrating)</FormLabel>
                <Input value={form.required_skills_text} onChange={(e) => setF("required_skills_text", e.target.value)} bg="whiteAlpha.100" />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={form.status} onChange={(e) => setF("status", e.target.value)} bg="whiteAlpha.100">
                  <option value="open">Ochiq</option>
                  <option value="in_progress">Jarayonda</option>
                  <option value="completed">Tugallangan</option>
                  <option value="cancelled">Bekor qilingan</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onEditClose} isDisabled={updateMutation.isPending}>Bekor qilish</Button>
            <Button {...btnPrimary} isLoading={updateMutation.isPending} onClick={handleConfirmSave}>Saqlash</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={deleteMutation.isPending ? () => {} : onDeleteClose}>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg="rgba(10, 18, 38, 0.95)" border="1px solid rgba(255,255,255,0.15)" color="white">
          <ModalHeader>O'chirishni tasdiqlang</ModalHeader>
          <ModalBody>Ushbu loyihani butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onDeleteClose} isDisabled={deleteMutation.isPending}>Bekor qilish</Button>
            <Button colorScheme="red" isLoading={deleteMutation.isPending} onClick={handleConfirmDelete}>Ha, o'chirish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
