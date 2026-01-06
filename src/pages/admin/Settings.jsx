// src/pages/admin/Settings.jsx
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
} from "@chakra-ui/react";

export default function AdminSettings() {
  const toast = useToast();

  // Mock current settings – keyin backend dan olamiz
  const currentSettings = {
    platformFeePercent: 10,
    premiumMonthlyPriceUZS: 500000,
    premiumYearlyPriceUZS: 5000000,
    escrowDays: 30,
    minWithdrawalUZS: 100000,
    allowedGateways: ["Payme", "Click", "Uzcard"],
    supportEmail: "support@uzwork.uz",
    supportPhone: "+998901234567",
    isMaintenance: false,
  };

  const handleSave = () => {
    toast({
      title: "Sozlamalar saqlandi",
      description: "Platforma sozlamalari muvaffaqiyatli yangilandi.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading size="xl" mb={8}>
        Platforma sozlamalari
      </Heading>

      <VStack spacing={8} align="stretch">
        {/* Platforma haqi va premium narxlar */}
        <Card>
          <CardHeader>
            <Heading size="md">Moliyaviy sozlamalar</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Platforma haqi (%)</FormLabel>
                <NumberInput defaultValue={currentSettings.platformFeePercent} min={0} max={30} precision={1}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Har bir muvaffaqiyatli tranzaksiyadan olinadigan foiz
                </Text>
              </FormControl>

              <HStack spacing={8}>
                <FormControl>
                  <FormLabel>Premium oylik narx (UZS)</FormLabel>
                  <NumberInput defaultValue={currentSettings.premiumMonthlyPriceUZS} min={0}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Premium yillik narx (UZS)</FormLabel>
                  <NumberInput defaultValue={currentSettings.premiumYearlyPriceUZS} min={0}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Escrow va withdrawal sozlamalari */}
        <Card>
          <CardHeader>
            <Heading size="md">Escrow va yechib olish sozlamalari</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Escrow muddati (kunlarda)</FormLabel>
                <NumberInput defaultValue={currentSettings.escrowDays} min={1} max={90}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Ish tugagandan keyin pul escrow da qancha turadi
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Minimal yechib olish summasi (UZS)</FormLabel>
                <NumberInput defaultValue={currentSettings.minWithdrawalUZS} min={10000}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* To‘lov tizimlari */}
        <Card>
          <CardHeader>
            <Heading size="md">Ruxsat etilgan to‘lov tizimlari</Heading>
          </CardHeader>
          <CardBody>
            <Wrap spacing={4}>
              {currentSettings.allowedGateways.map((gateway) => (
                <WrapItem key={gateway}>
                  <Tag size="lg" colorScheme="blue" variant="solid">
                    <TagLabel>{gateway}</TagLabel>
                    <TagCloseButton />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
            <Select placeholder="Yangi gateway qo‘shish" mt={4}>
              <option value="Payme">Payme</option>
              <option value="Click">Click</option>
              <option value="Uzcard">Uzcard</option>
              <option value="Humo">Humo</option>
            </Select>
          </CardBody>
        </Card>

        {/* Support va maintenance */}
        <Card>
          <CardHeader>
            <Heading size="md">Qo‘llab-quvvatlash va texnik xizmat</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Support email</FormLabel>
                <Input defaultValue={currentSettings.supportEmail} type="email" />
              </FormControl>

              <FormControl>
                <FormLabel>Support telefon</FormLabel>
                <Input defaultValue={currentSettings.supportPhone} />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">
                  Platforma texnik xizmat rejimida
                </FormLabel>
                <Switch colorScheme="red" isChecked={currentSettings.isMaintenance} />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Save tugmasi */}
        <HStack justify="end">
          <Button colorScheme="blue" size="lg" onClick={handleSave}>
            Sozlamalarni saqlash
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}