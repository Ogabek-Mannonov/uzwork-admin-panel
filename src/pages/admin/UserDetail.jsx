// src/pages/admin/UserDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
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

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "client",
  });

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api(`/admin/users/${userId}`);
      const u = normalizePayload(res);

      if (!u) {
        setUser(null);
        setError("Foydalanuvchi topilmadi.");
        return;
      }

      const safeUser = normalizeUser(u);
      setUser(safeUser);

      setForm({
        first_name: safeUser.first_name || "",
        last_name: safeUser.last_name || "",
        email: safeUser.email || "",
        phone: safeUser.phone || "",
        role: safeUser.role || "client",
      });
    } catch (err) {
      console.error("Foydalanuvchi tafsilotlarini olishda xato:", err);
      setError("Foydalanuvchi ma'lumotlarini yuklashda xato yuz berdi. Keyinroq urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

  /* ================= JOBS SPLIT ================= */
  const activeJobs = useMemo(() => {
    const list = user?.recent_jobs || [];
    return list.filter((j) => j.status === "open" || j.status === "in_progress");
  }, [user]);

  const completedJobs = useMemo(() => {
    const list = user?.recent_jobs || [];
    return list.filter((j) => j.status === "completed");
  }, [user]);

  /* ================= EDIT ================= */
  const onChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    if (!user) return;
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "client",
    });
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const res = await api.put(`/admin/users/${user.id}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      });

      const updatedRaw = normalizePayload(res) || { ...user, ...form };

      const merged = normalizeUser({
        ...user,
        ...updatedRaw,
        available_balance: updatedRaw.available_balance ?? user.available_balance,
        escrow_balance: updatedRaw.escrow_balance ?? user.escrow_balance,
        total_spent: updatedRaw.total_spent ?? user.total_spent,
        total_earned: updatedRaw.total_earned ?? user.total_earned,
      });

      setUser(merged);
      setIsEditing(false);

      toast({
        title: "Saqlandi",
        description: "Foydalanuvchi ma'lumotlari yangilandi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("User update error:", err);
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

  const toggleUserStatus = async () => {
    if (!user) return;

    const nextStatus = user.status === "active" ? "blocked" : "active";
    const ok = window.confirm(nextStatus === "blocked" ? "Userni bloklamoqchimisiz?" : "Userni faollashtirmoqchimisiz?");
    if (!ok) return;

    try {
      setStatusLoading(true);

      const res = await api.patch(`/admin/users/${user.id}/status`, { status: nextStatus });

      const payload = res?.data ?? res;
      const updatedRaw = payload?.data?.user || payload?.user || null;

      setUser((prev) =>
        normalizeUser({
          ...(prev || {}),
          ...(updatedRaw || {}),
          status: updatedRaw?.status ?? nextStatus,
        })
      );

      toast({
        title: "OK",
        description: nextStatus === "blocked" ? "User bloklandi" : "User faollashtirildi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Status update error:", err);
      toast({
        title: "Xato",
        description: "Status o‘zgartirishda xato",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setStatusLoading(false);
    }
  };

  /* ================= STATES ================= */
  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="blue.300" thickness="4px" />
        <Text ml={4} fontSize="lg" color="whiteAlpha.800">
          Foydalanuvchi tafsilotlari yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error || !user) {
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
        <Text>{error || "Foydalanuvchi topilmadi."}</Text>
      </Alert>
    );
  }

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Noma'lum";

  return (
    <Box>
      {/* Top bar */}
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
              <Button {...btnGhost} onClick={cancelEdit} isDisabled={saving}>
                Bekor qilish
              </Button>
              <Button {...btnPrimary} onClick={saveEdit} isLoading={saving}>
                Saqlash
              </Button>
            </>
          )}

          <Button
            {...btnGhost}
            border={user.status === "active" ? "1px solid rgba(255,0,80,0.20)" : "1px solid rgba(0,220,130,0.22)"}
            bg={user.status === "active" ? "rgba(255,0,80,0.08)" : "rgba(0,220,130,0.10)"}
            _hover={{ bg: user.status === "active" ? "rgba(255,0,80,0.12)" : "rgba(0,220,130,0.14)" }}
            onClick={toggleUserStatus}
            isLoading={statusLoading}
          >
            {user.status === "active" ? "Bloklash" : "Faollashtirish"}
          </Button>
        </HStack>
      </Flex>

      {/* Profile card */}
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

                  {getStatusBadge(user.status || "active")}

                  {user.is_verified && (
                    <Badge {...badgeGreen}>
                      <HStack spacing={1}>
                        <Shield size={14} />
                        <Text>Tasdiqlangan</Text>
                      </HStack>
                    </Badge>
                  )}

                  {user.is_premium && <Badge {...badgeYellow}>Premium</Badge>}
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </CardHeader>

        <CardBody position="relative">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {/* Contact */}
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Email
                </Text>
                <Flex align="center" gap={2} mt={2} color="whiteAlpha.900">
                  <Mail size={16} />
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
                </Flex>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Telefon
                </Text>
                <Flex align="center" gap={2} mt={2} color="whiteAlpha.900">
                  <Phone size={16} />
                  {!isEditing ? (
                    <Text>{user.phone || "Kiritilmagan"}</Text>
                  ) : (
                    <Input
                      value={form.phone}
                      onChange={(e) => onChange("phone", e.target.value)}
                      placeholder="Telefon"
                      {...inputStyle}
                    />
                  )}
                </Flex>
              </Box>
            </VStack>

            {/* Balance */}
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Available balans
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1} color="whiteAlpha.900">
                  {moneyUZS(user.available_balance)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Escrow balans
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1} color="whiteAlpha.900">
                  {moneyUZS(user.escrow_balance)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Jami sarflangan
                </Text>
                <Text fontSize="lg" fontWeight="semibold" mt={1} color="whiteAlpha.900">
                  {moneyUZS(user.total_spent)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Jami ishlab topilgan
                </Text>
                <Text fontSize="lg" fontWeight="semibold" mt={1} color="whiteAlpha.900">
                  {moneyUZS(user.total_earned)}
                </Text>
              </Box>
            </VStack>

            {/* Misc */}
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Ro‘yxatdan o‘tgan
                </Text>
                <Text mt={1} color="whiteAlpha.900">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Rating
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1} color="whiteAlpha.900">
                  {user.rating || "Noma'lum"} ⭐
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="whiteAlpha.700">
                  Tugallangan loyihalar
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1} color="whiteAlpha.900">
                  {user?.jobs_summary?.completed ?? completedJobs.length ?? 0}
                </Text>
              </Box>
            </VStack>
          </SimpleGrid>

          {user.jobs_summary && (
            <>
              <Divider my={6} borderColor="rgba(255,255,255,0.08)" />
              <HStack spacing={3} wrap="wrap">
                <Badge {...badgeBlue}>Jami: {user.jobs_summary.total}</Badge>
                <Badge {...badgeGreen}>Active: {user.jobs_summary.active}</Badge>
                <Badge {...badgeBlue}>In progress: {user.jobs_summary.in_progress}</Badge>
                <Badge {...badgePurple}>Completed: {user.jobs_summary.completed}</Badge>
                <Badge {...badgeRed}>Cancelled: {user.jobs_summary.cancelled}</Badge>
              </HStack>
            </>
          )}
        </CardBody>
      </Card>

      {/* Jobs section */}
      <Card {...GLASS_CARD} position="relative">
        <Box {...SHINE_OVERLAY} />
        <CardHeader position="relative">
          <Heading size="md" color="whiteAlpha.900">
            Loyihalar
          </Heading>
          <Text mt={1} color="whiteAlpha.600" fontSize="sm">
            Jarayondagi va tugallangan loyihalar ro‘yxati
          </Text>
        </CardHeader>

        <CardBody position="relative">
          {/* Active */}
          <Heading size="sm" mb={3} color="whiteAlpha.900">
            Jarayondagi loyihalar
          </Heading>

          {activeJobs.length > 0 ? (
            <Box overflowX="auto" mb={8}>
              <Table variant="simple">
                <Thead>
                  <Tr bg="rgba(255,255,255,0.04)">
                    <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Loyiha nomi</Th>
                    <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Byudjet</Th>
                    <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activeJobs.map((job) => (
                    <Tr key={job.id} _hover={{ bg: "rgba(255,255,255,0.04)" }}>
                      <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900">
                        {job.title}
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.06)" fontWeight="semibold" color="whiteAlpha.900">
                        {job.budget || "Belgilanmagan"}
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.06)">{jobStatusBadge(job.status)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text color="whiteAlpha.600" mb={8}>
              Jarayonda loyiha yo‘q
            </Text>
          )}

          {/* Completed */}
          <Heading size="sm" mb={3} color="whiteAlpha.900">
            Tugallangan loyihalar
          </Heading>

          {completedJobs.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr bg="rgba(255,255,255,0.04)">
                    <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Loyiha nomi</Th>
                    <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Byudjet</Th>
                    <Th color="whiteAlpha.700" borderColor="rgba(255,255,255,0.08)">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {completedJobs.map((job) => (
                    <Tr key={job.id} _hover={{ bg: "rgba(255,255,255,0.04)" }}>
                      <Td borderColor="rgba(255,255,255,0.06)" color="whiteAlpha.900">
                        {job.title}
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.06)" fontWeight="semibold" color="whiteAlpha.900">
                        {job.budget || "Belgilanmagan"}
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.06)">{jobStatusBadge(job.status)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text color="whiteAlpha.600">Tugallangan loyiha yo‘q</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
