// src/pages/admin/Users.jsx
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Select,
  HStack,
} from "@chakra-ui/react";
import { SearchIcon, EditIcon, NotAllowedIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export default function AdminUsers() {
  const users = [
    { id: 1, name: "Ogabek Developer", username: "ogabek_dev", email: "ogabek@example.com", role: "freelancer", status: "active" },
    { id: 2, name: "Kamola Client", username: "kamola_client", email: "kamola@company.uz", role: "client", status: "active" },
    { id: 3, name: "Ali Freelancer", username: "ali_pro", email: "ali@gmail.com", role: "freelancer", status: "blocked" },
  ];

  return (
    <Box>
      <Heading size="xl" mb={8}>
        Foydalanuvchilar
      </Heading>

      <HStack mb={6} spacing={4}>
        <InputGroup maxW="400px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input placeholder="Qidiruv..." />
        </InputGroup>
        <Select maxW="200px" placeholder="Role">
          <option>Freelancer</option>
          <option>Client</option>
          <option>Admin</option>
        </Select>
      </HStack>

      <Table variant="simple" size="lg">
        <Thead>
          <Tr bg="gray.50">
            <Th>Foydalanuvchi</Th>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Amallar</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user.id}>
              <Td>
                <Link to={`/admin/users/${user.id}`}>
                  <Flex align="center" gap={3} cursor="pointer" _hover={{ opacity: 0.8 }}>
                    <Avatar name={user.name} size="md" />
                    <Text fontWeight="medium" color="blue.600">
                      {user.name}
                    </Text>
                  </Flex>
                </Link>
              </Td>
              <Td>{user.username}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge colorScheme={user.role === "admin" ? "purple" : user.role === "freelancer" ? "blue" : "green"}>
                  {user.role === "freelancer" ? "Freelancer" : user.role === "client" ? "Client" : "Admin"}
                </Badge>
              </Td>
              <Td>
                <Badge colorScheme={user.status === "active" ? "green" : "red"}>
                  {user.status === "active" ? "Faol" : "Bloklangan"}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton icon={<EditIcon />} size="sm" colorScheme="blue" variant="ghost" />
                  {user.status === "active" ? (
                    <IconButton icon={<NotAllowedIcon />} size="sm" colorScheme="red" variant="ghost" />
                  ) : (
                    <IconButton icon={<CheckCircleIcon />} size="sm" colorScheme="green" variant="ghost" />
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}