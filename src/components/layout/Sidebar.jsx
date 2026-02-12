// src/components/layout/Sidebar.jsx
import React from "react";
import { Box, VStack, Heading, Button, Text, Divider, Image } from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    navigate("/admin/login");
    window.location.reload();
  };

  return (
    <Box
      w="280px"
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      overflowY="auto"
      bg="rgba(10, 18, 38, 0.78)"
      borderRight="1px solid"
      borderColor="rgba(255,255,255,0.10)"
      backdropFilter="blur(14px)"
      boxShadow="0 18px 50px rgba(0,0,0,0.35)"
    >
      <VStack align="stretch" spacing={0}>
        {/* Brand */}
        <Box p={6} borderBottom="1px solid" borderColor="rgba(255,255,255,0.08)">
          <VStack align="start" spacing={3}>
            <Image
              src="/UzWork transparent.png"
              alt="UzWork"
              h="34px"
              objectFit="contain"
              opacity={0.95}
            />
            <Heading size="md" color="whiteAlpha.900" fontWeight="bold">
              Admin Panel
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.600">
              Boshqaruv menyusi
            </Text>
          </VStack>
        </Box>

        {/* Menu */}
        <VStack align="stretch" p={4} spacing={2}>
          {menuItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link key={item.path} to={item.path} onClick={() => onNavigate?.()}>
                <Button
                  variant="ghost"
                  justifyContent="start"
                  w="full"
                  size="lg"
                  borderRadius="xl"
                  leftIcon={<item.icon size={20} />}
                  color={active ? "whiteAlpha.900" : "whiteAlpha.700"}
                  bg={active ? "rgba(30,144,255,0.16)" : "transparent"}
                  border={active ? "1px solid rgba(30,144,255,0.35)" : "1px solid transparent"}
                  boxShadow={active ? "0 14px 30px rgba(30,144,255,0.12)" : "none"}
                  _hover={{
                    bg: "rgba(255,255,255,0.06)",
                    color: "whiteAlpha.900",
                  }}
                >
                  <Text>{item.label}</Text>
                </Button>
              </Link>
            );
          })}
        </VStack>

        <Divider borderColor="rgba(255,255,255,0.08)" />

        {/* Logout */}
        <Box p={4}>
          <Button
            variant="ghost"
            justifyContent="start"
            w="full"
            size="lg"
            borderRadius="xl"
            leftIcon={<LogOut size={20} />}
            color="red.200"
            bg="rgba(255, 0, 80, 0.06)"
            border="1px solid rgba(255, 0, 80, 0.18)"
            _hover={{ bg: "rgba(255, 0, 80, 0.10)", color: "red.100" }}
            onClick={handleLogout}
          >
            Chiqish
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}
