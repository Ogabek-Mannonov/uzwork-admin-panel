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
  VStack,
  HStack,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useToast,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { ArrowLeftIcon } from "@chakra-ui/icons";
import { MessageSquare } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";

export default function DisputeDetail() {
  const { disputeId } = useParams();
  const toast = useToast();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState(null);

  // resolve modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [resolution, setResolution] = useState("approved");
  const [adminNotes, setAdminNotes] = useState("");

  const normalize = (res) => {
    const payload = res?.data ?? res;
    return payload?.data?.dispute || payload?.dispute || null;
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api(`/disputes/${disputeId}`);
      const d = normalize(res);

      if (!d) {
        setError("Dispute topilmadi.");
        setDispute(null);
        return;
      }

      setDispute(d);
    } catch (e) {
      console.error("Dispute detail error:", e);
      setError("Dispute detailni yuklashda xato.");
      setDispute(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (disputeId) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId]);

  const getStatusBadge = (status) => {
    const colorScheme = {
      open: "orange",
      in_review: "blue",
      resolved: "green",
      cancelled: "gray",
    };
    const label = {
      open: "Ochiq",
      in_review: "Ko'rib chiqilmoqda",
      resolved: "Hal qilingan",
      cancelled: "Bekor qilingan",
    };
    return (
      <Badge colorScheme={colorScheme[status] || "gray"} px={3} py={1} borderRadius="full">
        {label[status] || status || "—"}
      </Badge>
    );
  };

  const getMilestoneStatusBadge = (status) => {
    const map = {
      pending: { c: "orange", t: "Pending" },
      submitted: { c: "blue", t: "Submitted" },
      approved: { c: "green", t: "Approved" },
      released: { c: "purple", t: "Released" },
    };
    const it = map[status] || { c: "gray", t: status || "—" };
    return (
      <Badge colorScheme={it.c} borderRadius="full" px={3} py={1}>
        {it.t}
      </Badge>
    );
  };

  const fullName = (u) =>
    `${u?.first_name || ""} ${u?.last_name || ""}`.trim() || u?.username || "Noma'lum";

  const createdAtLabel = useMemo(() => {
    if (!dispute?.created_at) return "—";
    try {
      return new Date(dispute.created_at).toLocaleString("uz-UZ", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return String(dispute.created_at);
    }
  }, [dispute]);

  const openChat = dispute?.chat_id ? `/admin/chats/${dispute.chat_id}` : null;

  const startReview = async () => {
    if (!dispute) return;
    try {
      setActing(true);
      const res = await api.patch(`/disputes/${dispute.id}/status`, { status: "in_review" });
      const payload = res?.data ?? res;
      const updated = payload?.data?.dispute || payload?.dispute;
      setDispute((p) => ({ ...(p || {}), ...(updated || {}), status: "in_review" }));
      toast({ title: "OK", description: "Status: in_review", status: "success", duration: 1600, isClosable: true });
    } catch (e) {
      console.error("startReview error:", e);
      toast({ title: "Xato", description: "Status o‘zgarmadi", status: "error", duration: 2200, isClosable: true });
    } finally {
      setActing(false);
    }
  };

  const openResolveModal = (r) => {
    setResolution(r);
    setAdminNotes(dispute?.admin_notes || "");
    onOpen();
  };

  const doResolve = async () => {
    if (!dispute) return;
    try {
      setActing(true);
      const res = await api.post(`/disputes/${dispute.id}/resolve`, {
        resolution,
        admin_notes: adminNotes?.trim() ? adminNotes.trim() : null,
      });
      const payload = res?.data ?? res;
      const updated = payload?.data?.dispute || payload?.dispute;

      setDispute((p) => ({
        ...(p || {}),
        ...(updated || {}),
        status: "resolved",
        resolution: updated?.resolution || resolution,
        admin_notes: updated?.admin_notes ?? adminNotes,
      }));

      toast({
        title: "Hal qilindi",
        description: resolution === "approved" ? "Freelancer foydasiga" : "Client foydasiga",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onClose();
    } catch (e) {
      console.error("resolve error:", e);
      toast({ title: "Xato", description: "Resolve bo‘lmadi", status: "error", duration: 2400, isClosable: true });
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" />
        <Text ml={4}>Dispute yuklanmoqda...</Text>
      </Flex>
    );
  }

  if (error || !dispute) {
    return (
      <Alert status="error" borderRadius="lg" my={8}>
        <AlertIcon />
        <Text>{error || "Dispute topilmadi."}</Text>
      </Alert>
    );
  }

  const client = dispute.client || null;
  const freelancer = dispute.freelancer || null;

  return (
    <Box>
      {/* Header */}
      <Flex align="center" mb={6} gap={4} wrap="wrap">
        <Link to="/admin/disputes">
          <IconButton icon={<ArrowLeftIcon />} colorScheme="gray" variant="ghost" size="lg" />
        </Link>

        <Heading size="xl">Nizo tafsilotlari</Heading>

        <HStack spacing={3}>
          <Badge fontSize="lg" colorScheme="orange">
            Nizo #{String(dispute.id).slice(0, 8)}
          </Badge>
          {getStatusBadge(dispute.status)}
        </HStack>

        <Flex ml="auto" gap={3} wrap="wrap">
          {openChat && (
            <Button
              as={Link}
              to={openChat}
              leftIcon={<MessageSquare size={18} />}
              variant="outline"
              colorScheme="blue"
            >
              Chatga o‘tish
            </Button>
          )}

          {dispute.status === "open" && (
            <Button onClick={startReview} isLoading={acting} colorScheme="blue" variant="outline">
              In review qilish
            </Button>
          )}
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        {/* Umumiy */}
        <Card>
          <CardHeader>
            <Heading size="md">Umumiy ma’lumotlar</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Flex justify="space-between" gap={6}>
                <Text fontWeight="medium">Chat ID</Text>
                <Text fontWeight="semibold">{dispute.chat_id ? String(dispute.chat_id).slice(0, 10) : "—"}</Text>
              </Flex>

              <Flex justify="space-between" gap={6}>
                <Text fontWeight="medium">Status</Text>
                {getStatusBadge(dispute.status)}
              </Flex>

              <Flex justify="space-between" gap={6}>
                <Text fontWeight="medium">Yaratilgan</Text>
                <Text>{createdAtLabel}</Text>
              </Flex>

              {dispute.amount != null && (
                <Flex justify="space-between" gap={6}>
                  <Text fontWeight="medium">Summa</Text>
                  <Text fontWeight="semibold">
                    {Number(dispute.amount).toLocaleString("uz-UZ")} {dispute.currency || ""}
                  </Text>
                </Flex>
              )}

              {dispute.resolution && (
                <Flex justify="space-between" gap={6}>
                  <Text fontWeight="medium">Qaror</Text>
                  <Badge colorScheme={dispute.resolution === "approved" ? "green" : "red"}>
                    {dispute.resolution}
                  </Badge>
                </Flex>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Sabab */}
        <Card>
          <CardHeader>
            <Heading size="md">Sababi</Heading>
          </CardHeader>
          <CardBody>
            <Text whiteSpace="pre-wrap">{dispute.reason || "—"}</Text>

            {dispute.admin_notes && (
              <>
                <Divider my={4} />
                <Text fontWeight="semibold">Admin izohi:</Text>
                <Text mt={1} whiteSpace="pre-wrap">{dispute.admin_notes}</Text>
              </>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Client/Freelancer */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader>
            <Heading size="md">Client</Heading>
          </CardHeader>
          <CardBody>
            {client ? (
              <Flex align="center" gap={4}>
                <Avatar name={fullName(client)} src={client.avatar_url || undefined} size="lg" />
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{fullName(client)}</Text>
                  <Text fontSize="sm" color="gray.600">@{client.username || "—"}</Text>
                </Box>
              </Flex>
            ) : (
              <Text color="gray.500">Client topilmadi</Text>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Freelancer</Heading>
          </CardHeader>
          <CardBody>
            {freelancer ? (
              <Flex align="center" gap={4}>
                <Avatar name={fullName(freelancer)} src={freelancer.avatar_url || undefined} size="lg" />
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{fullName(freelancer)}</Text>
                  <Text fontSize="sm" color="gray.600">@{freelancer.username || "—"}</Text>
                </Box>
              </Flex>
            ) : (
              <Text color="gray.500">Freelancer topilmadi</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Chat history */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Chat tarixi (oxirgi 30)</Heading>
        </CardHeader>
        <CardBody>
          {Array.isArray(dispute.chatHistory) && dispute.chatHistory.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              {dispute.chatHistory.map((m) => {
                const name =
                  `${m.sender_first_name || ""} ${m.sender_last_name || ""}`.trim() ||
                  m.sender_username ||
                  "Unknown";

                return (
                  <Box key={m.id} p={4} bg="gray.50" borderRadius="lg">
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="semibold">
                        {name}{" "}
                        <Text as="span" fontWeight="normal" color="gray.600">
                          ({m.sender_role || "user"})
                        </Text>
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleString("uz-UZ", { timeStyle: "short", dateStyle: "short" })
                          : "—"}
                      </Text>
                    </Flex>

                    <Text mt={2} whiteSpace="pre-wrap">
                      {m.type === "text"
                        ? m.content
                        : m.type === "voice"
                        ? "[VOICE]"
                        : m.type === "file"
                        ? `[FILE] ${m.file_url || ""}`
                        : m.content}
                    </Text>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Text color="gray.500">Chat tarixi topilmadi</Text>
          )}
        </CardBody>
      </Card>

      {/* Evidence */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Dalillar (Evidence)</Heading>
        </CardHeader>
        <CardBody>
          {Array.isArray(dispute.evidence_files) && dispute.evidence_files.length > 0 ? (
            <Wrap>
              {dispute.evidence_files.map((file, idx) => (
                <WrapItem key={`${file}-${idx}`}>
                  <Tag size="lg" colorScheme="blue" variant="subtle">
                    <TagLabel>{String(file)}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          ) : (
            <Text color="gray.500">Dalillar yo‘q</Text>
          )}
        </CardBody>
      </Card>

      {/* Milestones */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Milestone lar</Heading>
        </CardHeader>
        <CardBody>
          {Array.isArray(dispute.milestones) && dispute.milestones.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nom</Th>
                  <Th isNumeric>Summa</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dispute.milestones.map((ms) => (
                  <Tr key={ms.id}>
                    <Td>{ms.title || "—"}</Td>
                    <Td isNumeric>{ms.amount != null ? Number(ms.amount).toLocaleString("uz-UZ") : "—"}</Td>
                    <Td>{getMilestoneStatusBadge(ms.status)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500">Milestone topilmadi</Text>
          )}
        </CardBody>
      </Card>

      {/* Actions */}
      {dispute.status !== "resolved" && (
        <HStack spacing={4} justify="center" mt={10} wrap="wrap">
          <Button
            colorScheme="green"
            size="lg"
            onClick={() => openResolveModal("approved")}
            isLoading={acting}
          >
            Freelancerga pul (approved)
          </Button>

          <Button
            colorScheme="red"
            size="lg"
            onClick={() => openResolveModal("rejected")}
            isLoading={acting}
          >
            Clientga refund (rejected)
          </Button>

          <Button variant="outline" colorScheme="gray" size="lg" onClick={fetchDetail} isDisabled={acting}>
            Yangilash
          </Button>
        </HStack>
      )}

      {/* Resolve Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dispute’ni hal qilish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack mb={3}>
              <Text fontWeight="semibold">Qaror:</Text>
              <Badge colorScheme={resolution === "approved" ? "green" : "red"}>
                {resolution}
              </Badge>
            </HStack>

            <Text fontSize="sm" color="gray.600" mb={2}>
              Admin izohi (ixtiyoriy):
            </Text>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Masalan: dalillar tekshirildi, ish bajarilgan/bajarilmagan..."
              rows={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Bekor
            </Button>
            <Button
              colorScheme={resolution === "approved" ? "green" : "red"}
              onClick={doResolve}
              isLoading={acting}
            >
              Tasdiqlash
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
