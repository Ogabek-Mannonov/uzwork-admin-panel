// src/components/layout/Sidebar.jsx
import React from "react";
import {
  Box,
  VStack,
  Heading,
  Button,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // <--- useNavigate qo'shildi
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  DollarSign,
  Settings,
  LogOut,
  AlertTriangle,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Foydalanuvchilar", path: "/admin/users" },
  { icon: Briefcase, label: "Loyihalar", path: "/admin/jobs" },
  { icon: MessageSquare, label: "Chatlar", path: "/admin/chats" },
  { icon: DollarSign, label: "To'lovlar", path: "/admin/payments" },
  { icon: AlertTriangle, label: "Nizolar", path: "/admin/disputes" },
  { icon: Settings, label: "Sozlamalar", path: "/admin/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); // <--- navigatsiya uchun qo'shildi
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Logout funksiyasi – to‘liq xavfsiz chiqish
  const handleLogout = () => {
    // Barcha token va user ma'lumotlarini o‘chirish
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    // Agar refresh token bo‘lsa – uni ham o‘chirish (sizda bor bo‘lsa)
    // localStorage.removeItem("refreshToken");

    // Login sahifasiga yo‘naltirish
    navigate("/admin/login");

    // Brauzer cache ni tozalash uchun (ixtiyoriy, lekin foydali)
    window.location.reload();
  };

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
            onClick={handleLogout} // <--- Logout funksiyasi ulandi
          >
            Chiqish
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}