// src/pages/admin/JobDetail.jsx
import React from "react";
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
} from "@chakra-ui/react";
import { ArrowLeft, Star, Edit2, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function JobDetail() {
  const { jobId } = useParams();

  // Mock data – keyin backend dan olamiz
  const job = {
    id: jobId || "1",
    title: "React JS da responsiv web sayt ishlab chiqish",
    client: { name: "Kamola Company", username: "kamola_client", rating: 4.9 },
    description: "Zamonaviy, responsiv landing page va admin panel kerak. React + Tailwind CSS ishlatiladi. API integratsiya va authentication bo‘lishi kerak. Muddat 2 hafta.",
    budget: "5,000,000 so‘m",
    status: "open",
    boosted: true,
    proposalsCount: 12,
    createdAt: "2026-01-01",
    deadline: "2026-01-15",
    skills: ["React", "Tailwind CSS", "Node.js", "Authentication", "Responsive Design"],
    proposals: [
      { freelancer: "Ogabek Dev", price: "4,800,000 so‘m", duration: "10 kun" },
      { freelancer: "Ali Pro", price: "5,200,000 so‘m", duration: "12 kun" },
      { freelancer: "Sardor Designer", price: "4,500,000 so‘m", duration: "8 kun" },
    ],
  };

  const getStatusBadge = (status) => {
    const colorScheme = {
      open: "green",
      in_progress: "blue",
      completed: "purple",
      cancelled: "red",
    };
    const label = {
      open: "Ochiq",
      in_progress: "Jarayonda",
      completed: "Tugallangan",
      cancelled: "Bekor qilingan",
    };
    return (
      <Badge colorScheme={colorScheme[status] || "gray"} fontSize="md" px={3} py={1} borderRadius="full">
        {label[status] || status}
      </Badge>
    );
  };

  return (
    <Box>
      {/* Back tugmasi */}
      <Flex align="center" mb={6} gap={4}>
        <Link to="/admin/jobs">
          <IconButton icon={<ArrowLeft size={20} />} colorScheme="gray" variant="ghost" />
        </Link>
        <Heading size="xl">Loyiha tafsilotlari</Heading>
      </Flex>

      <Card mb={8}>
        <CardHeader>
          <Flex justify="space-between" align="start">
            <Box>
              <Heading size="lg">{job.title}</Heading>
              <Flex align="center" gap={4} mt={3}>
                {job.boosted && (
                  <Badge colorScheme="yellow">
                    <HStack spacing={1}>
                      <Star size={16} />
                      <Text>Boostlangan</Text>
                    </HStack>
                  </Badge>
                )}
                {getStatusBadge(job.status)}
                <Text color="gray.600">ID: {job.id}</Text>
              </Flex>
            </Box>
            <HStack spacing={3}>
              <Button colorScheme="blue">
                <HStack spacing={2}>
                  <Edit2 size={18} />
                  <Text>Tahrirlash</Text>
                </HStack>
              </Button>
              <Button colorScheme="red" variant="outline">
                <HStack spacing={2}>
                  <Trash2 size={18} />
                  <Text>O‘chirish</Text>
                </HStack>
              </Button>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Client</Text>
                <Flex align="center" gap={3} mt={1}>
                  <Avatar name={job.client.name} size="md" />
                  <Box>
                    <Text fontWeight="semibold">{job.client.name}</Text>
                    <Text fontSize="sm" color="gray.600">@{job.client.username}</Text>
                    <Text fontSize="sm">Rating: {job.client.rating} ⭐</Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Byudjet</Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>{job.budget}</Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Muddat</Text>
                <Text mt={1}>{job.deadline}</Text>
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="gray.600">Yaratilgan sana</Text>
                <Text mt={1}>{job.createdAt}</Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Takliflar soni</Text>
                <Text fontSize="xl" fontWeight="bold" mt={1}>{job.proposalsCount} ta</Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color="gray.600">Kerakli skillar</Text>
                <Wrap mt={2}>
                  {job.skills.map((skill) => (
                    <WrapItem key={skill}>
                      <Tag size="lg" colorScheme="blue" variant="subtle">
                        <TagLabel>{skill}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            </VStack>
          </SimpleGrid>

          <Divider my={8} />

          <Box>
            <Text fontWeight="medium" color="gray.600" mb={4}>Loyiha tavsifi</Text>
            <Text whiteSpace="pre-wrap">{job.description}</Text>
          </Box>

          {/* Takliflar table */}
          {job.proposals.length > 0 && (
            <Box mt={8}>
              <Heading size="md" mb={4}>Takliflar ({job.proposalsCount})</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Freelancer</Th>
                    <Th>Taklif narxi</Th>
                    <Th>Muddat</Th>
                    <Th>Amallar</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {job.proposals.map((p, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium">{p.freelancer}</Td>
                      <Td fontWeight="semibold">{p.price}</Td>
                      <Td>{p.duration}</Td>
                      <Td>
                        <Button size="sm" colorScheme="blue" variant="ghost">
                          Ko‘rish
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}