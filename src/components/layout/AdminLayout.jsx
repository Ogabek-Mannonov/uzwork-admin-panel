// src/components/layout/AdminLayout.jsx
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import React from "react";

export default function AdminLayout() {
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  return (
    <Flex minH="100vh">
      {isDesktop ? <Sidebar /> : <MobileSidebar />}

      <Box
        ml={isDesktop ? "280px" : 0}
        w="full"
        p={8}
        bg="gray.50"
      >
        <Outlet /> {/* Bu yerda Dashboard, Users va boshqa sahifalar chiqadi */}
      </Box>
    </Flex>
  );
}