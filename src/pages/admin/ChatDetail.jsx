// src/pages/admin/ChatDetail.jsx
import {
  Box,
  Heading,
  Text,
  Flex,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { ArrowLeft, Send, Paperclip, AlertTriangle } from "lucide-react"; // lucide-react dan
import { Link, useParams } from "react-router-dom";

export default function ChatDetail() {
  const { chatId } = useParams();

  // Mock data – keyin backend dan olamiz
  const chat = {
    id: chatId || "1",
    jobTitle: "React JS da responsiv web sayt",
    client: { name: "Kamola Company", username: "kamola_client" },
    freelancer: { name: "Ogabek Dev", username: "ogabek_dev" },
    messages: [
      { id: 1, sender: "client", text: "Salom, loyiha haqida gaplashsak bo‘ladimi?", time: "10:00" },
      { id: 2, sender: "freelancer", text: "Salom! Albatta, qaysi qism haqida?", time: "10:05" },
      { id: 3, sender: "client", text: "Admin panel dizayni haqida, ko‘proq funksiyalar qo‘shmoqchiman", time: "10:10" },
      { id: 4, sender: "freelancer", text: "Tushundim, qo‘shimcha funksiyalarni ro‘yxat qilib yuboring", time: "10:15" },
      { id: 5, sender: "client", text: "Fayl biriktirdim, ko‘rib chiqing", file: "requirements.pdf", time: "10:20" },
      { id: 6, sender: "freelancer", text: "Faylni ko‘rdim, 2 kun ichida yangi versiyani yuboraman", time: "10:25" },
    ],
  };

  return (
    <Box h="calc(100vh - 100px)" display="flex" flexDirection="column">
      {/* Header */}
      <Card mb={4}>
        <CardHeader>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={4}>
              <Link to="/admin/chats">
                <IconButton icon={<ArrowLeft size={20} />} colorScheme="gray" variant="ghost" />
              </Link>
              <Box>
                <Heading size="md">{chat.jobTitle}</Heading>
                <Flex align="center" gap={6} mt={2}>
                  <Flex align="center" gap={2}>
                    <Avatar name={chat.client.name} size="xs" />
                    <Text fontSize="sm">{chat.client.name} (@{chat.client.username})</Text>
                  </Flex>
                  <Flex align="center" gap={2}>
                    <Avatar name={chat.freelancer.name} size="xs" />
                    <Text fontSize="sm">{chat.freelancer.name} (@{chat.freelancer.username})</Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
            <Button leftIcon={<AlertTriangle size={18} />} colorScheme="red" variant="outline">
              Dispute ochish
            </Button>
          </Flex>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Box flex="1" overflowY="auto" p={4} bg="gray.50" borderRadius="lg">
        <VStack align="stretch" spacing={4}>
          {chat.messages.map((msg) => (
            <Flex
              key={msg.id}
              alignSelf={msg.sender === "client" ? "flex-start" : "flex-end"}
              maxW="70%"
              direction="column"
            >
              <Box
                bg={msg.sender === "client" ? "white" : "blue.100"}
                p={4}
                borderRadius="lg"
                boxShadow="md"
              >
                <Text>{msg.text}</Text>
                {msg.file && (
                  <HStack mt={2}>
                    <Paperclip size={16} />
                    <Text fontSize="sm" color="blue.600">{msg.file}</Text>
                  </HStack>
                )}
              </Box>
              <Text fontSize="xs" color="gray.500" mt={1} alignSelf={msg.sender === "client" ? "flex-start" : "flex-end"}>
                {msg.time}
              </Text>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Message input */}
      <Card mt={4}>
        <CardBody>
          <InputGroup>
            <Input placeholder="Xabar yozing..." />
            <InputRightElement width="4.5rem">
              <HStack>
                <IconButton icon={<Paperclip size={18} />} variant="ghost" aria-label="Fayl biriktirish" />
                <IconButton icon={<Send size={18} />} colorScheme="blue" aria-label="Yuborish" />
              </HStack>
            </InputRightElement>
          </InputGroup>
        </CardBody>
      </Card>
    </Box>
  );
}