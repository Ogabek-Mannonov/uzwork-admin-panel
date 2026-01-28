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
import { ArrowLeft, Mail, Phone, Shield, Ban, CheckCircle, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../lib/api";

export default function UserDetail() {
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null); // edit uchun
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

  const normalizeUser = (res) => {
    const payload = res?.data ?? res;
    return payload?.data?.user || payload?.user || payload?.data?.data?.user || null;
  };

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api(`/admin/users/${userId}`);
      const u = normalizeUser(res);

      if (!u) {
        setUser(null);
        setForm(null);
        return;
      }

      // status bo‘lmasa default active
      const normalized = { ...u, status: u.status ?? "active" };

      setUser(normalized);
      setForm({
        first_name: normalized.first_name ?? "",
        last_name: normalized.last_name ?? "",
        username: normalized.username ?? "",
        email: normalized.email ?? "",
        phone: normalized.phone ?? "",
        role: normalized.role ?? "client",
        status: normalized.status ?? "active",
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

  const fullName = useMemo(() => {
    if (!user) return "";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Noma'lum";
  }, [user]);

  const getRoleBadge = (role) => {
    const color = role === "admin" ? "purple" : role === "freelancer" ? "blue" : "green";
    const label = role === "admin" ? "Admin" : role === "freelancer" ? "Freelancer" : "Client";
    return <Badge colorScheme={color}>{label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const s = status ?? "active";
    return s === "active" ? (
      <Badge colorScheme="green">Faol</Badge>
    ) : (
      <Badge colorScheme="red">Bloklangan</Badge>
    );
  };

  const onChange = (key, val) => {
    setForm((prev) => ({ ...(prev || {}), [key]: val }));
  };

  const startEdit = () => {
    if (!user) return;
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!user) return;
    setIsEditing(false);
    setForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      role: user.role ?? "client",
      status: user.status ?? "active",
    });
  };

  const saveEdit = async () => {
    if (!form) return;

    try {
      setSaving(true);

      const res = await api.put(`/admin/users/${userId}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        phone: form.phone,
        role: form.role,
        // statusni ham editdan yuborish mumkin (xohlasangiz olib tashlang)
        status: form.status,
      });

      const payload = res?.data ?? res;
      const updated = payload?.data?.user || payload?.user;

      setUser((prev) => ({ ...(prev || {}), ...(updated || {}) }));
      setIsEditing(false);

      toast({
        title: "Saqlandi",
        description: "User ma'lumotlari yangilandi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (e) {
      console.error("Save user error:", e);
      toast({
        title: "Xato",
        description: "Userni saqlashda xato yuz berdi",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!user) return;

    const nextStatus = (user.status ?? "active") === "active" ? "blocked" : "active";

    try {
      setSaving(true);

      const res = await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });

      const payload = res?.data ?? res;
      const updated = payload?.data?.user || payload?.user;

      setUser((prev) => ({ ...(prev || {}), ...(updated || {}), status: nextStatus }));

      // form ham sync
      setForm((prev) => ({ ...(prev || {}), status: nextStatus }));

      toast({
        title: "OK",
        description: nextStatus === "blocked" ? "User bloklandi" : "User faollashtirildi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (e) {
      console.error("toggle status error:", e);
      toast({
        title: "Xato",
        description: "Status o‘zgartirishda xato",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

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

  const isActive = (user.status ?? "active") === "active";

  return (
    <Box>
      {/* Top bar */}
      <Flex align="center" justify="space-between" mb={6} gap={4} wrap="wrap">
        <HStack spacing={3}>
          <Link to="/admin/users">
            <IconButton
              icon={<ArrowLeft size={20} />}
              colorScheme="gray"
              variant="ghost"
              aria-label="Orqaga"
            />
          </Link>
          <Heading size="xl">Foydalanuvchi tafsilotlari</Heading>
        </HStack>

        <HStack spacing={3}>
          {!isEditing ? (
            <Button
              leftIcon={<Pencil size={18} />}
              colorScheme="blue"
              variant="outline"
              onClick={startEdit}
            >
              Tahrirlash
            </Button>
          ) : (
            <>
              <Button
                colorScheme="green"
                onClick={saveEdit}
                isLoading={saving}
                loadingText="Saqlanmoqda"
              >
                Saqlash
              </Button>
              <Button variant="ghost" onClick={cancelEdit} isDisabled={saving}>
                Bekor
              </Button>
            </>
          )}

          <Button
            colorScheme={isActive ? "red" : "green"}
            variant={isActive ? "outline" : "solid"}
            leftIcon={isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
            onClick={toggleStatus}
            isLoading={saving && !isEditing}
          >
            {isActive ? "Bloklash" : "Faollashtirish"}
          </Button>
        </HStack>
      </Flex>

      <Card mb={8}>
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Flex align="center" gap={4}>
              <Avatar name={fullName} size="xl" />
              <Box>
                <Heading size="lg">{fullName}</Heading>
                <Flex align="center" gap={4} mt={2} wrap="wrap">
                  <Text color="gray.600">@{user.username}</Text>
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
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
          {isEditing ? (
            <>
              <Heading size="sm" mb={4}>Tahrirlash</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Ism</Text>
                  <Input value={form?.first_name || ""} onChange={(e) => onChange("first_name", e.target.value)} />
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Familiya</Text>
                  <Input value={form?.last_name || ""} onChange={(e) => onChange("last_name", e.target.value)} />
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Username</Text>
                  <Input value={form?.username || ""} onChange={(e) => onChange("username", e.target.value)} />
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Email</Text>
                  <Input value={form?.email || ""} onChange={(e) => onChange("email", e.target.value)} />
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Telefon</Text>
                  <Input value={form?.phone || ""} onChange={(e) => onChange("phone", e.target.value)} />
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Role</Text>
                  <Select value={form?.role || "client"} onChange={(e) => onChange("role", e.target.value)}>
                    <option value="freelancer">Freelancer</option>
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Status</Text>
                  <Select value={form?.status || "active"} onChange={(e) => onChange("status", e.target.value)}>
                    <option value="active">Faol</option>
                    <option value="blocked">Bloklangan</option>
                  </Select>
                </Box>
              </SimpleGrid>

              <Divider my={6} />

              <Text fontSize="sm" color="gray.600">
                Saqlash tugmasini bossangiz o‘zgarishlar backendga yoziladi.
              </Text>
            </>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="medium" color="gray.600">Email</Text>
                  <Flex align="center" gap={2} mt={1}>
                    <Mail size={16} />
                    <Text>{user.email}</Text>
                  </Flex>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="gray.600">Telefon</Text>
                  <Flex align="center" gap={2} mt={1}>
                    <Phone size={16} />
                    <Text>{user.phone || "Kiritilmagan"}</Text>
                  </Flex>
                </Box>
              </VStack>

              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="medium" color="gray.600">Balans</Text>
                  <Text fontSize="xl" fontWeight="bold" mt={1}>
                    {user.balance_uzs || "0 so‘m"}
                  </Text>
                  <Text fontSize="sm" color="gray.600">{user.balance_usd || "$0"}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="gray.600">Rating</Text>
                  <Text fontSize="xl" fontWeight="bold" mt={1}>
                    {user.rating || "Noma'lum"} ⭐
                  </Text>
                </Box>
              </VStack>

              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="medium" color="gray.600">Ro‘yxatdan o‘tgan</Text>
                  <Text mt={1}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="gray.600">Oxirgi faollik</Text>
                  <Text mt={1}>Noma'lum (keyin qo'shiladi)</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="gray.600">Tugallangan loyihalar</Text>
                  <Text fontSize="xl" fontWeight="bold" mt={1}>{user.completed_jobs || 0}</Text>
                </Box>
              </VStack>
            </SimpleGrid>
          )}
        </CardBody>
      </Card>

      {/* So‘nggi loyihalar (ixtiyoriy) */}
      <Card>
        <CardHeader>
          <Heading size="md">So‘nggi loyihalar</Heading>
        </CardHeader>
        <CardBody>
          {user.recent_jobs && user.recent_jobs.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Loyiha nomi</Th>
                  <Th>Byudjet</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {user.recent_jobs.map((job, index) => (
                  <Tr key={index}>
                    <Td>{job.title}</Td>
                    <Td fontWeight="semibold">{job.budget}</Td>
                    <Td>{getStatusBadge(job.status)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500">Hozircha loyihalar yo‘q</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
