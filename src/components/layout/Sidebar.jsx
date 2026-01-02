// src/components/layout/Sidebar.jsx
import {
  Box,
  VStack,
  Heading,
  Button,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  DollarSign,
  Settings,
  LogOut,
  AlertTriangle,  // <--- YANGI ICON QO‘SHILDI
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Foydalanuvchilar", path: "/admin/users" },
  { icon: Briefcase, label: "Loyihalar", path: "/admin/jobs" },
  { icon: MessageSquare, label: "Chatlar", path: "/admin/chats" },
  { icon: DollarSign, label: "To'lovlar", path: "/admin/payments" },
  { icon: AlertTriangle, label: "Nizolar", path: "/admin/disputes" },  // <--- YANGI MENU
  { icon: Settings, label: "Sozlamalar", path: "/admin/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      w="280px"
      h="100vh"
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      position="fixed"
      left={0}
      top={0}
      overflowY="auto"
    >
      <VStack align="stretch" spacing={0}>
        <Box p={6} borderBottom="1px" borderColor={borderColor}>
          <Heading size="lg" color="blue.600" fontWeight="bold">
            UzWork Admin
          </Heading>
        </Box>

        <VStack align="stretch" p={4} spacing={2}>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                justifyContent="start"
                w="full"
                size="lg"
                leftIcon={<item.icon size={20} />}
                bg={location.pathname.startsWith(item.path) ? "blue.50" : "transparent"}
                color={location.pathname.startsWith(item.path) ? "blue.600" : "gray.700"}
                fontWeight={location.pathname.startsWith(item.path) ? "semibold" : "normal"}
                _hover={{ bg: "blue.50", color: "blue.600" }}
              >
                <Text>{item.label}</Text>
              </Button>
            </Link>
          ))}
        </VStack>

        <Divider />

        <Box p={4}>
          <Button
            variant="ghost"
            colorScheme="red"
            justifyContent="start"
            w="full"
            size="lg"
            leftIcon={<LogOut size={20} />}
          >
            Chiqish
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}