// src/pages/admin/Settings.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Button,
  HStack,
  Text,
  Divider,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useToast,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import api from "../../lib/api";

/* ================= THEME (Admin glass dark) ================= */
const GLASS_CARD = {
  bg: "rgba(10, 18, 38, 0.55)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.10)",
  borderRadius: "2xl",
  boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  backdropFilter: "blur(12px)",
  overflow: "hidden",
  color: "whiteAlpha.900",
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

export default function AdminSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    platformFeePercent: 10,
    premiumMonthlyPriceUZS: 500000,
    premiumYearlyPriceUZS: 5000000,
    escrowDays: 30,
    minWithdrawalUZS: 100000,
    allowedGateways: ["Payme", "Click", "Uzcard"],
    supportEmail: "support@uzwork.uz",
    supportPhone: "+998901234567",
    isMaintenance: false,
  });

  // Backend dan sozlamalarni o'qib olish
  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const res = await api("/admin/settings");
        if (res.success && active) {
          const s = res.data || {};
          setSettings({
            platformFeePercent: s.platform_fee_percent != null ? Number(s.platform_fee_percent) : 10,
            premiumMonthlyPriceUZS: s.premium_monthly_price_uzs != null ? Number(s.premium_monthly_price_uzs) : 500000,
            premiumYearlyPriceUZS: s.premium_yearly_price_uzs != null ? Number(s.premium_yearly_price_uzs) : 5000000,
            escrowDays: s.escrow_days != null ? Number(s.escrow_days) : 30,
            minWithdrawalUZS: s.min_withdrawal_uzs != null ? Number(s.min_withdrawal_uzs) : 100000,
            allowedGateways: Array.isArray(s.allowed_gateways) ? s.allowed_gateways : ["Payme", "Click", "Uzcard"],
            supportEmail: s.support_email || "support@uzwork.uz",
            supportPhone: s.support_phone || "+998901234567",
            isMaintenance: s.is_maintenance === true || s.is_maintenance === "true",
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        toast({
          title: "Xatolik",
          description: "Sozlamalarni yuklashda xato yuz berdi.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSettings();
    return () => {
      active = false;
    };
  }, [toast]);

  // Sozlamalarni backend ga saqlash
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        platform_fee_percent: Number(settings.platformFeePercent),
        premium_monthly_price_uzs: Number(settings.premiumMonthlyPriceUZS),
        premium_yearly_price_uzs: Number(settings.premiumYearlyPriceUZS),
        escrow_days: Number(settings.escrowDays),
        min_withdrawal_uzs: Number(settings.minWithdrawalUZS),
        allowed_gateways: settings.allowedGateways,
        support_email: settings.supportEmail,
        support_phone: settings.supportPhone,
        is_maintenance: settings.isMaintenance,
      };

      const res = await api("/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast({
          title: "Sozlamalar saqlandi",
          description: "Platforma sozlamalari muvaffaqiyatli yangilandi.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Xatolik",
        description: err.message || "Sozlamalarni saqlashda xato yuz berdi.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Gateway qo'shish va o'chirish
  const handleRemoveGateway = (gateway) => {
    setSettings((prev) => ({
      ...prev,
      allowedGateways: prev.allowedGateways.filter((g) => g !== gateway),
    }));
  };

  const handleAddGateway = (gateway) => {
    if (!gateway) return;
    if (settings.allowedGateways.includes(gateway)) return;
    setSettings((prev) => ({
      ...prev,
      allowedGateways: [...prev.allowedGateways, gateway],
    }));
  };

  if (loading) {
    return (
      <Flex minH="400px" justify="center" align="center">
        <Spinner size="xl" color="blue.400" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box position="relative">
      <Heading size="xl" mb={8} color="whiteAlpha.900" fontWeight="bold">
        Platforma sozlamalari
      </Heading>

      <VStack spacing={8} align="stretch">
        {/* Platforma haqi va premium narxlar */}
        <Card {...GLASS_CARD}>
          <CardHeader>
            <Heading size="md" color="whiteAlpha.900">Moliyaviy sozlamalar</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel color="whiteAlpha.800">Platforma haqi (%)</FormLabel>
                <NumberInput
                  min={0}
                  max={30}
                  precision={1}
                  value={settings.platformFeePercent}
                  onChange={(val) => setSettings(prev => ({ ...prev, platformFeePercent: val }))}
                >
                  <NumberInputField {...inputStyle} />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="white" />
                    <NumberDecrementStepper color="white" />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="whiteAlpha.600" mt={2}>
                  Har bir muvaffaqiyatli tranzaksiyadan olinadigan foiz miqdori
                </Text>
              </FormControl>

              <HStack spacing={8} flexDir={{ base: "column", md: "row" }} align="stretch">
                <FormControl>
                  <FormLabel color="whiteAlpha.800">Premium oylik narx (UZS)</FormLabel>
                  <NumberInput
                    min={0}
                    value={settings.premiumMonthlyPriceUZS}
                    onChange={(val) => setSettings(prev => ({ ...prev, premiumMonthlyPriceUZS: val }))}
                  >
                    <NumberInputField {...inputStyle} />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="white" />
                      <NumberDecrementStepper color="white" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl mt={{ base: 4, md: 0 }}>
                  <FormLabel color="whiteAlpha.800">Premium yillik narx (UZS)</FormLabel>
                  <NumberInput
                    min={0}
                    value={settings.premiumYearlyPriceUZS}
                    onChange={(val) => setSettings(prev => ({ ...prev, premiumYearlyPriceUZS: val }))}
                  >
                    <NumberInputField {...inputStyle} />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="white" />
                      <NumberDecrementStepper color="white" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Escrow va withdrawal sozlamalari */}
        <Card {...GLASS_CARD}>
          <CardHeader>
            <Heading size="md" color="whiteAlpha.900">Escrow va yechib olish sozlamalari</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel color="whiteAlpha.800">Escrow muddati (kunlarda)</FormLabel>
                <NumberInput
                  min={1}
                  max={90}
                  value={settings.escrowDays}
                  onChange={(val) => setSettings(prev => ({ ...prev, escrowDays: val }))}
                >
                  <NumberInputField {...inputStyle} />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="white" />
                    <NumberDecrementStepper color="white" />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="whiteAlpha.600" mt={2}>
                  Ish yakunlangandan so'ng pullar escrow hisobida necha kun saqlanadi
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel color="whiteAlpha.800">Minimal yechib olish summasi (UZS)</FormLabel>
                <NumberInput
                  min={10000}
                  value={settings.minWithdrawalUZS}
                  onChange={(val) => setSettings(prev => ({ ...prev, minWithdrawalUZS: val }))}
                >
                  <NumberInputField {...inputStyle} />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="white" />
                    <NumberDecrementStepper color="white" />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* To'lov tizimlari */}
        <Card {...GLASS_CARD}>
          <CardHeader>
            <Heading size="md" color="whiteAlpha.900">Ruxsat etilgan to'lov tizimlari</Heading>
          </CardHeader>
          <CardBody>
            <Wrap spacing={4} mb={4}>
              {settings.allowedGateways.map((gateway) => (
                <WrapItem key={gateway}>
                  <Tag size="lg" colorScheme="blue" variant="solid" borderRadius="full">
                    <TagLabel>{gateway}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveGateway(gateway)} />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
            <Select
              placeholder="Yangi gateway qo'shish"
              {...inputStyle}
              onChange={(e) => {
                handleAddGateway(e.target.value);
                e.target.value = ""; // Tanlovni tozalash
              }}
              css={{
                option: {
                  background: "#0d1527 !important",
                  color: "#fff !important"
                }
              }}
            >
              <option value="Payme">Payme</option>
              <option value="Click">Click</option>
              <option value="Uzcard">Uzcard</option>
              <option value="Humo">Humo</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
            </Select>
          </CardBody>
        </Card>

        {/* Support va maintenance */}
        <Card {...GLASS_CARD}>
          <CardHeader>
            <Heading size="md" color="whiteAlpha.900">Qo'llab-quvvatlash va texnik xizmat</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel color="whiteAlpha.800">Qo'llab-quvvatlash xizmati email pochtasi</FormLabel>
                <Input
                  {...inputStyle}
                  value={settings.supportEmail}
                  type="email"
                  onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="whiteAlpha.800">Qo'llab-quvvatlash xizmati telefoni</FormLabel>
                <Input
                  {...inputStyle}
                  value={settings.supportPhone}
                  onChange={(e) => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0" color="whiteAlpha.800" cursor="pointer" htmlFor="maintenance-switch">
                  Platformani texnik xizmat ko'rsatish (Maintenance) rejimiga o'tkazish
                </FormLabel>
                <Switch
                  id="maintenance-switch"
                  colorScheme="red"
                  isChecked={settings.isMaintenance}
                  onChange={(e) => setSettings(prev => ({ ...prev, isMaintenance: e.target.checked }))}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Save tugmasi */}
        <HStack justify="end" pt={4}>
          <Button
            colorScheme="blue"
            size="lg"
            px={8}
            isLoading={saving}
            loadingText="Saqlanmoqda..."
            onClick={handleSave}
            _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            Sozlamalarni saqlash
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}