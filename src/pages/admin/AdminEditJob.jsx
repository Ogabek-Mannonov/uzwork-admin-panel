import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import api from "../../lib/api";

export default function AdminEditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [jobType, setJobType] = useState("fixed"); // DB: job_type
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState("UZS");
  const [skillsText, setSkillsText] = useState(""); // comma-separated

  // skills array -> textarea string
  const skillsArray = useMemo(() => {
    return skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [skillsText]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api(`/projects/${id}`);
        const payload = res?.data ?? res;

        const job =
          payload?.data?.project || // { success, data: { project } }
          payload?.project ||
          payload?.data?.data?.project ||
          null;

        if (!job) {
          throw new Error("Loyiha topilmadi (response project null).");
        }

        setTitle(job.title || "");
        setDescription(job.description || "");
        setStatus(job.status || "open");
        setJobType(job.job_type || job.budget_type || "fixed");
        setBudgetMin(
          job.budget_min != null ? String(job.budget_min) : ""
        );
        setBudgetMax(
          job.budget_max != null ? String(job.budget_max) : ""
        );
        setCurrency(job.currency || "UZS");

        const skills = job.required_skills || job.skills || [];
        if (Array.isArray(skills)) {
          setSkillsText(skills.join(", "));
        } else {
          setSkillsText("");
        }
      } catch (e) {
        console.error("Fetch job error:", e);
        setError(e.message || "Loyihani olishda xato yuz berdi.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // PUT uchun payload (jobs schema'ga mos)
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status, // agar backend admin uchun ruxsat bersa
        budget_min: budgetMin === "" ? null : Number(budgetMin),
        budget_max: budgetMax === "" ? null : Number(budgetMax),
        currency,
        job_type: jobType,
        required_skills: skillsArray,
      };

      // NOTE: sizning backend updateProject funksiyangiz boshqa field nomlarini kutishi mumkin.
      // Shuning uchun quyida "fallback" sifatida budget_type/skills ham yuboryapmiz:
      payload.budget_type = jobType;
      payload.skills = skillsArray;

      await api.put(`/projects/${id}`, payload);

      toast({
        title: "Saqlandi",
        description: "Loyiha muvaffaqiyatli yangilandi",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      navigate(`/admin/jobs/${id}`);
    } catch (e) {
      console.error("Save error:", e);
      toast({
        title: "Xato",
        description:
          e?.response?.data?.message ||
          e.message ||
          "Saqlashda xato yuz berdi",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" />
        <Text ml={4}>Loyiha yuklanmoqda...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
        <Button as={RouterLink} to="/admin/jobs" variant="outline">
          Orqaga
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="900px">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">Loyihani tahrirlash</Heading>
          <Text color="gray.500" mt={1}>
            ID: {id}
          </Text>
        </Box>

        <HStack>
          <Button as={RouterLink} to={`/admin/jobs/${id}`} variant="outline">
            Bekor qilish
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={saving}
            isDisabled={!title.trim() || !description.trim()}
          >
            Saqlash
          </Button>
        </HStack>
      </Flex>

      <Card>
        <CardBody>
          <FormControl mb={4} isRequired>
            <FormLabel>Sarlavha (title)</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Loyiha nomi..."
            />
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Tavsif (description)</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Loyiha haqida..."
              rows={5}
            />
          </FormControl>

          <HStack spacing={4} mb={4} align="flex-start">
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="open">Ochiq</option>
                <option value="in_progress">Jarayonda</option>
                <option value="completed">Tugallangan</option>
                <option value="cancelled">Bekor qilingan</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Job type</FormLabel>
              <Select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Valyuta</FormLabel>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
              </Select>
            </FormControl>
          </HStack>

          <HStack spacing={4} mb={4} align="flex-start">
            <FormControl>
              <FormLabel>Budget min</FormLabel>
              <Input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Masalan: 5000000"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Budget max</FormLabel>
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Masalan: 8000000"
              />
            </FormControl>
          </HStack>

          <FormControl mb={2}>
            <FormLabel>Skills (vergul bilan)</FormLabel>
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="react, nodejs, postgres"
            />
            <Text fontSize="sm" color="gray.500" mt={2}>
              Saqlanganda array bo‘lib ketadi: [{skillsArray.join(", ")}]
            </Text>
          </FormControl>
        </CardBody>
      </Card>
    </Box>
  );
}
