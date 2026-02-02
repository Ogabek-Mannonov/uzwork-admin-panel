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
  Divider,
} from "@chakra-ui/react";
import { ArrowLeft, Mail, Phone, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../lib/api";

/* ================= HELPERS ================= */
const moneyUZS = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0 so'm";
  return `${new Intl.NumberFormat("uz-UZ").format(n)} so'm`;
};

const normalizePayload = (res) => {
  const payload = res?.data ?? res;
  // backend: { success, data: { user: {...} } }
  return payload?.data?.user || payload?.user || payload?.data?.data?.user || null;
};

// ✅ Variant 1: balans source of truth = user_balances dan kelgan fieldlar
const normalizeUser = (u) => {
  const safe = {
    ...u,
    status: u?.status ?? "active",
    recent_jobs: Array.isArray(u?.recent_jobs) ? u.recent_jobs : [],
    jobs_summary: u?.jobs_summary || null,

    // Balances from user_balances JOIN
    available_balance: Number(u?.available_balance ?? 0) || 0,
    escrow_balance: Number(u?.escrow_balance ?? 0) || 0,
    total_spent: Number(u?.total_spent ?? 0) || 0,
    total_earned: Number(u?.total_earned ?? 0) || 0,
  };

  return safe;
};

export default function UserDetail() {
  const { userId } = useParams();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);

  // inline edit
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

      // edit form init
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

  /* ================= UI BADGES ================= */
  const getRoleBadge = (role) => {
    const color = role === "admin" ? "purple" : role === "freelancer" ? "blue" : "green";
    const label = role === "admin" ? "Admin" : role === "freelancer" ? "Freelancer" : "Client";
    return <Badge colorScheme={color}>{label}</Badge>;
  };

  const getStatusBadge = (status) => {
    return status === "active" ? <Badge colorScheme="green">Faol</Badge> : <Badge colorScheme="red">Bloklangan</Badge>;
  };

  const jobStatusBadge = (status) => {
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
    return <Badge colorScheme={schemes[status] || "gray"}>{labels[status] || status || "—"}</Badge>;
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

  /* ================= EDIT HANDLERS ================= */
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

      // PUT /admin/users/:id
      const res = await api.put(`/admin/users/${user.id}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      });

      const updatedRaw = normalizePayload(res) || { ...user, ...form };

      // ✅ update response balance qaytarmasa ham eski balance saqlanadi
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

      // PATCH /admin/users/:id/status { status }
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
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} fontSize="lg">
          Foydalanuvchi tafsilotlari yuklanmoqda...
        </Text>
      </Flex>
    );
  }

  if (error || !user) {
    return (
      <Alert status="error" borderRadius="lg" my={8}>
        <AlertIcon />
        <Text>{error || "Foydalanuvchi topilmadi."}</Text>
      </Alert>
    );
  }

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Noma'lum";

  return (
    <Box>
      {/* Top bar */}
      <Flex align="center" justify="space-between" mb={6} gap={4}>
        <HStack spacing={3}>
          <Link to="/admin/users">
            <IconButton icon={<ArrowLeft size={20} />} colorScheme="gray" variant="ghost" />
          </Link>
          <Heading size="xl">Foydalanuvchi tafsilotlari</Heading>
        </HStack>

        <HStack spacing={3}>
          {!isEditing ? (
            <Button variant="outline" colorScheme="blue" onClick={startEdit}>
              Tahrirlash
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={cancelEdit} isDisabled={saving}>
                Bekor qilish
              </Button>
              <Button colorScheme="blue" onClick={saveEdit} isLoading={saving}>
                Saqlash
              </Button>
            </>
          )}

          <Button
            colorScheme={user.status === "active" ? "red" : "green"}
            variant="outline"
            onClick={toggleUserStatus}
            isLoading={statusLoading}
          >
            {user.status === "active" ? "Bloklash" : "Faollashtirish"}
          </Button>
        </HStack>
      </Flex>

      {/* Profile card */}
      <Card mb={8}>
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Flex align="center" gap={4}>
              <Avatar name={fullName} size="xl" />
              <Box>
                {!isEditing ? (
                  <Heading size="lg">{fullName}</Heading>
                ) : (
                  <HStack spacing={3} wrap="wrap">
                    <Input
                      value={form.first_name}
                      onChange={(e) => onChange("first_name", e.target.value)}
                      placeholder="First name"
                      maxW="200px"
                    />
                    <Input
                      value={form.last_name}
                      onChange={(e) => onChange("last_name", e.target.value)}
                      placeholder="Last name"
                      maxW="200px"
                    />
                  </HStack>
                )}

                <Flex align="center" gap={4} mt={2} wrap="wrap">
                  <Text color="gray.600">@{user.username}</Text>

                  {!isEditing ? (
                    getRoleBadge(user.role)
                  ) : (
                    <Select
                      value={form.role}
                      onChange={(e) => onChange("role", e.target.value)}
                      maxW="200px"
                      size="sm"
                    >
                      <option value="freelancer">Freelancer</option>
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </Select>
                  )}

                  {getStatusBadge(user.status || "active")}

                  {user.is_verified && (
                    <Badge colorScheme="green">
                      <HStack spacing={1}>
                        <Shield size={14} />
                        <Text>Tasdiqlangan</Text>
                      </HStack>
                    </Badge>
                  )}

                  {user.is_premium && <Badge colorScheme="yellow">Premium</Badge>}
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </CardHeader>

        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {/* Contact */}
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Email
                </Text>
                <Flex align="center" gap={2} mt={1}>
                  <Mail size={16} />
                  {!isEditing ? (
                    <Text>{user.email}</Text>
                  ) : (
                    <Input value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="Email" />
                  )}
                </Flex>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Telefon
                </Text>
                <Flex align="center" gap={2} mt={1}>
                  <Phone size={16} />
                  {!isEditing ? (
                    <Text>{user.phone || "Kiritilmagan"}</Text>
                  ) : (
                    <Input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="Telefon" />
                  )}
                </Flex>
              </Box>
            </VStack>

            {/* ✅ Balance (SOURCE: user_balances) */}
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Available balans
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>
                  {moneyUZS(user.available_balance)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Escrow balans
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>
                  {moneyUZS(user.escrow_balance)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Jami sarflangan
                </Text>
                <Text fontSize="lg" fontWeight="semibold" mt={1}>
                  {moneyUZS(user.total_spent)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Jami ishlab topilgan
                </Text>
                <Text fontSize="lg" fontWeight="semibold" mt={1}>
                  {moneyUZS(user.total_earned)}
                </Text>
              </Box>
            </VStack>

            {/* Misc */}
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Ro‘yxatdan o‘tgan
                </Text>
                <Text mt={1}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Rating
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>
                  {user.rating || "Noma'lum"} ⭐
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">
                  Tugallangan loyihalar
                </Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>
                  {user?.jobs_summary?.completed ?? completedJobs.length ?? 0}
                </Text>
              </Box>
            </VStack>
          </SimpleGrid>

          {user.jobs_summary && (
            <>
              <Divider my={6} />
              <HStack spacing={3} wrap="wrap">
                <Badge colorScheme="blue">Jami: {user.jobs_summary.total}</Badge>
                <Badge colorScheme="green">Active: {user.jobs_summary.active}</Badge>
                <Badge colorScheme="blue">In progress: {user.jobs_summary.in_progress}</Badge>
                <Badge colorScheme="purple">Completed: {user.jobs_summary.completed}</Badge>
                <Badge colorScheme="red">Cancelled: {user.jobs_summary.cancelled}</Badge>
              </HStack>
            </>
          )}
        </CardBody>
      </Card>

      {/* Jobs section */}
      <Card>
        <CardHeader>
          <Heading size="md">Loyihalar</Heading>
        </CardHeader>

        <CardBody>
          {/* Active */}
          <Heading size="sm" mb={3}>
            Jarayondagi loyihalar
          </Heading>

          {activeJobs.length > 0 ? (
            <Table variant="simple" mb={8}>
              <Thead>
                <Tr>
                  <Th>Loyiha nomi</Th>
                  <Th>Byudjet</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activeJobs.map((job) => (
                  <Tr key={job.id}>
                    <Td>{job.title}</Td>
                    <Td fontWeight="semibold">{job.budget || "Belgilanmagan"}</Td>
                    <Td>{jobStatusBadge(job.status)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500" mb={8}>
              Jarayonda loyiha yo‘q
            </Text>
          )}

          {/* Completed */}
          <Heading size="sm" mb={3}>
            Tugallangan loyihalar
          </Heading>

          {completedJobs.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Loyiha nomi</Th>
                  <Th>Byudjet</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {completedJobs.map((job) => (
                  <Tr key={job.id}>
                    <Td>{job.title}</Td>
                    <Td fontWeight="semibold">{job.budget || "Belgilanmagan"}</Td>
                    <Td>{jobStatusBadge(job.status)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500">Tugallangan loyiha yo‘q</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
