// src/pages/admin/UserDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Select,
  useToast,
  Divider} from "@chakra-ui/react";
import { ArrowLeft, Mail, Phone, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../lib/api";

/* ================= THEME HELPERS ================= */
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

const btnPrimary = {
  h: "40px",
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
  h: "40px",
  borderRadius: "xl",
  bg: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "whiteAlpha.900",
  _hover: { bg: "rgba(255,255,255,0.09)" },
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
const badgeYellow = {
  bg: "rgba(255, 214, 10, 0.12)",
  color: "whiteAlpha.900",
  border: "1px solid rgba(255, 214, 10, 0.20)",
};

const moneyUZS = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0 so'm";
  return `${new Intl.NumberFormat("uz-UZ").format(n)} so'm`;
};

const normalizePayload = (res) => {
  const payload = res?.data ?? res;
  return payload?.data?.user || payload?.user || payload?.data?.data?.user || null;
};

const normalizeUser = (u) => {
  return {
    ...u,
    status: u?.status ?? "active",
    recent_jobs: Array.isArray(u?.recent_jobs) ? u.recent_jobs : [],
    jobs_summary: u?.jobs_summary || null,
    available_balance: Number(u?.available_balance ?? 0) || 0,
    escrow_balance: Number(u?.escrow_balance ?? 0) || 0,
    total_spent: Number(u?.total_spent ?? 0) || 0,
    total_earned: Number(u?.total_earned ?? 0) || 0,
  };
};

export default function UserDetail() {
  const { userId } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "client",
  });

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: async () => {
      const res = await api(`/admin/users/${userId}`);
      const payload = normalizePayload(res);
      if (!payload) throw new Error("Foydalanuvchi topilmadi");
      const safeUser = normalizeUser(payload);
      setForm({
        first_name: safeUser.first_name || "",
        last_name: safeUser.last_name || "",
        email: safeUser.email || "",
        phone: safeUser.phone || "",
        role: safeUser.role || "client",
      });
      return safeUser;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (nextStatus) => {
      await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
    },
    onSuccess: (_, nextStatus) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Muvaffaqiyatli",
        description: nextStatus === "blocked" ? "User bloklandi" : "User faollashtirildi",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (err) => {
      console.error("Status update error:", err);
      toast({
        title: "Xatolik",
        description: "Statusni o'zgartirishda xato yuz berdi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const saveEditMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/admin/users/${userId}`, payload);
      return normalizePayload(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsEditing(false);
      toast({
        title: "Saqlandi",
        description: "Foydalanuvchi ma'lumotlari yangilandi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    onError: (err) => {
      console.error("User update error:", err);
      toast({
        title: "Xato",
        description: "Tahrirlashda xato yuz berdi",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    },
  });

  const handleToggleStatus = () => {
    if (!user) return;
    const nextStatus = user.status === "active" ? "blocked" : "active";
    const ok = window.confirm(nextStatus === "blocked" ? "Userni bloklamoqchimisiz?" : "Userni faollashtirmoqchimisiz?");
    if (ok) toggleStatusMutation.mutate(nextStatus);
  };

  const handleSaveEdit = () => {
    saveEditMutation.mutate(form);
  };

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "client",
      });
    }
    setIsEditing(false);
  };

  const onChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  /* ================= BADGES ================= */
  const getRoleBadge = (role) => {
    const label = role === "admin" ? "Admin" : role === "freelancer" ? "Freelancer" : "Client";
    if (role === "admin") return <Badge {...badgePurple}>{label}</Badge>;
    if (role === "freelancer") return <Badge {...badgeBlue}>{label}</Badge>;
    return <Badge {...badgeGreen}>{label}</Badge>;
  };

  const getStatusBadge = (status) => {
    return status === "active" ? <Badge {...badgeGreen}>Faol</Badge> : <Badge {...badgeRed}>Bloklangan</Badge>;
  };

  const jobStatusBadge = (status) => {
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
    return <Badge bg="rgba(255,255,255,0.08)" color="whiteAlpha.900" border="1px solid rgba(255,255,255,0.12)">{labels[status] || status || "—"}</Badge>;
  };

  const activeJobs = useMemo(() => {
    const list = user?.recent_jobs || [];
    return list.filter((j) => j.status === "open" || j.status === "in_progress");
  }, [user]);

  const completedJobs = useMemo(() => {
    const list = user?.recent_jobs || [];
    return list.filter((j) => j.status === "completed");
  }, [user]);

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
        <Text>{error?.message || "Foydalanuvchi ma'lumotlarini yuklashda xato."}</Text>
      </Alert>
    );
  }

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Noma'lum";

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={6} gap={4} wrap="wrap">
        <HStack spacing={3}>
          <Link to="/admin/users">
            <IconButton aria-label="Back" icon={<ArrowLeft size={20} />} {...btnGhost} />
          </Link>
          <Box>
            <Heading size="lg" color="whiteAlpha.900">
              Foydalanuvchi tafsilotlari
            </Heading>
            <Text color="whiteAlpha.600" fontSize="sm">
              Profil, balans, role va loyihalar
            </Text>
          </Box>
        </HStack>

        <HStack spacing={3} wrap="wrap">
          {!isEditing ? (
            <Button
              {...btnGhost}
              border="1px solid rgba(30,144,255,0.22)"
              bg="rgba(30,144,255,0.10)"
              _hover={{ bg: "rgba(30,144,255,0.14)" }}
              onClick={startEdit}
            >
              Tahrirlash
            </Button>
          ) : (
            <>
              <Button {...btnGhost} onClick={cancelEdit} isDisabled={saveEditMutation.isPending}>
                Bekor qilish
              </Button>
              <Button {...btnPrimary} onClick={handleSaveEdit} isLoading={saveEditMutation.isPending}>
                Saqlash
              </Button>
            </>
          )}

          <Button
            {...btnGhost}
            leftIcon={<Shield />}
            colorScheme={user.status === "active" ? "red" : "green"}
            onClick={handleToggleStatus}
            isLoading={toggleStatusMutation.isPending}
          >
            {user.status === "active" ? "Bloklash" : "Faollashtirish"}
          </Button>
        </HStack>
      </Flex>

      <Card {...GLASS_CARD} mb={8} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardHeader position="relative">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Flex align="center" gap={4} wrap="wrap">
              <Avatar name={fullName} size="xl" />
              <Box>
                {!isEditing ? (
                  <Heading size="md" color="whiteAlpha.900">
                    {fullName}
                  </Heading>
                ) : (
                  <HStack spacing={3} wrap="wrap">
                    <Input
                      value={form.first_name}
                      onChange={(e) => onChange("first_name", e.target.value)}
                      placeholder="First name"
                      maxW="200px"
                      {...inputStyle}
                    />
                    <Input
                      value={form.last_name}
                      onChange={(e) => onChange("last_name", e.target.value)}
                      placeholder="Last name"
                      maxW="200px"
                      {...inputStyle}
                    />
                  </HStack>
                )}

                <Flex align="center" gap={3} mt={2} wrap="wrap">
                  <Text color="whiteAlpha.600">@{user.username}</Text>
                  {!isEditing ? (
                    getRoleBadge(user.role)
                  ) : (
                    <Select
                      value={form.role}
                      onChange={(e) => onChange("role", e.target.value)}
                      maxW="200px"
                      size="sm"
                      {...inputStyle}
                    >
                      <option style={{ background: "#0A1226", color: "#fff" }} value="freelancer">
                        Freelancer
                      </option>
                      <option style={{ background: "#0A1226", color: "#fff" }} value="client">
                        Client
                      </option>
                      <option style={{ background: "#0A1226", color: "#fff" }} value="admin">
                        Admin
                      </option>
                    </Select>
                  )}
                  {getStatusBadge(user.status)}
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </CardHeader>

        <CardBody position="relative">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <VStack align="start" spacing={4}>
              <Heading size="sm" color="whiteAlpha.700" textTransform="uppercase">
                Kontakt Ma'lumotlari
              </Heading>
              <HStack color="whiteAlpha.900">
                <Mail size={18} />
                {!isEditing ? (
                  <Text>{user.email || "—"}</Text>
                ) : (
                  <Input
                    value={form.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="Email"
                    {...inputStyle}
                  />
                )}
              </HStack>
              <HStack color="whiteAlpha.900">
                <Phone size={18} />
                {!isEditing ? (
                  <Text>{user.phone || "—"}</Text>
                ) : (
                  <Input
                    value={form.phone}
                    onChange={(e) => onChange("phone", e.target.value)}
                    placeholder="Phone"
                    {...inputStyle}
                  />
                )}
              </HStack>
            </VStack>

            <VStack align="start" spacing={4}>
              <Heading size="sm" color="whiteAlpha.700" textTransform="uppercase">
                Moliyaviy Holat
              </Heading>
              <HStack justify="space-between" w="full">
                <Text color="whiteAlpha.600">Asosiy balans:</Text>
                <Text fontWeight="bold" color="blue.300">
                  {moneyUZS(user.available_balance)}
                </Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="whiteAlpha.600">Escrow (Band):</Text>
                <Text fontWeight="bold" color="orange.300">
                  {moneyUZS(user.escrow_balance)}
                </Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="whiteAlpha.600">
                  {user.role === "freelancer" ? "Jami ishlagan:" : "Jami sarflagan:"}
                </Text>
                <Text fontWeight="bold" color="green.300">
                  {moneyUZS(user.role === "freelancer" ? user.total_earned : user.total_spent)}
                </Text>
              </HStack>
            </VStack>

            <VStack align="start" spacing={4}>
              <Heading size="sm" color="whiteAlpha.700" textTransform="uppercase">
                Platforma Faolligi
              </Heading>
              <HStack justify="space-between" w="full">
                <Text color="whiteAlpha.600">A'zo bo'ldi:</Text>
                <Text color="whiteAlpha.900">{new Date(user.created_at).toLocaleDateString()}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="whiteAlpha.600">Jami loyihalar:</Text>
                <Badge {...badgePurple}>{user.jobs_summary?.total || 0}</Badge>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="whiteAlpha.600">Tugallangan:</Text>
                <Badge {...badgeGreen}>{user.jobs_summary?.completed || 0}</Badge>
              </HStack>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Card {...GLASS_CARD}>
          <CardHeader>
            <Heading size="md" color="whiteAlpha.900">
              Faol Loyihalar
            </Heading>
          </CardHeader>
          <CardBody p={0}>
            <Table variant="simple">
              <Thead bg="rgba(255,255,255,0.04)">
                <Tr>
                  <Th color="whiteAlpha.600">Loyiha</Th>
                  <Th color="whiteAlpha.600">Status</Th>
                  <Th color="whiteAlpha.600">Amal</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activeJobs.length > 0 ? (
                  activeJobs.map((j) => (
                    <Tr key={j.id} _hover={{ bg: "rgba(255,255,255,0.04)" }}>
                      <Td borderColor="rgba(255,255,255,0.06)">
                        <Text fontWeight="semibold" color="whiteAlpha.900">
                          {j.title}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.500">
                          {new Date(j.created_at).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.06)">{jobStatusBadge(j.status)}</Td>
                      <Td borderColor="rgba(255,255,255,0.06)">
                        <Link to={`/admin/jobs/${j.id}`}>
                          <Button size="xs" {...btnGhost}>
                            Ko'rish
                          </Button>
                        </Link>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={3} textAlign="center" py={6} color="whiteAlpha.500">
                      Faol loyihalar yo'q
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        <Card {...GLASS_CARD}>
          <CardHeader>
            <Heading size="md" color="whiteAlpha.900">
              Tugallangan Loyihalar
            </Heading>
          </CardHeader>
          <CardBody p={0}>
            <Table variant="simple">
              <Thead bg="rgba(255,255,255,0.04)">
                <Tr>
                  <Th color="whiteAlpha.600">Loyiha</Th>
                  <Th color="whiteAlpha.600">Budjet</Th>
                  <Th color="whiteAlpha.600">Amal</Th>
                </Tr>
              </Thead>
              <Tbody>
                {completedJobs.length > 0 ? (
                  completedJobs.map((j) => (
                    <Tr key={j.id} _hover={{ bg: "rgba(255,255,255,0.04)" }}>
                      <Td borderColor="rgba(255,255,255,0.06)">
                        <Text fontWeight="semibold" color="whiteAlpha.900">
                          {j.title}
                        </Text>
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.06)">
                        <Text color="green.300" fontWeight="bold">
                          {moneyUZS(j.budget_min || j.budget)}
                        </Text>
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.06)">
                        <Link to={`/admin/jobs/${j.id}`}>
                          <Button size="xs" {...btnGhost}>
                            Ko'rish
                          </Button>
                        </Link>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={3} textAlign="center" py={6} color="whiteAlpha.500">
                      Tugallangan loyihalar yo'q
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
