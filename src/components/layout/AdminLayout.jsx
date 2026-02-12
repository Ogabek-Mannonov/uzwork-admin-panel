// src/components/layout/AdminLayout.jsx
import React from "react";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

export default function AdminLayout() {
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  return (
    <Flex minH="100vh" position="relative" overflow="hidden">
      {/* Global admin background (login bilan bir xil) */}
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        bgGradient="linear(to-br, #06142D 0%, #0B2C5B 40%, #0A4AA6 100%)"
      />
      <Box
        position="fixed"
        w="520px"
        h="520px"
        bg="rgba(0, 140, 255, 0.22)"
        filter="blur(120px)"
        top="-160px"
        left="-160px"
        borderRadius="full"
        zIndex={0}
      />
      <Box
        position="fixed"
        w="520px"
        h="520px"
        bg="rgba(90, 40, 255, 0.16)"
        filter="blur(140px)"
        bottom="-200px"
        right="-200px"
        borderRadius="full"
        zIndex={0}
      />

      {isDesktop ? <Sidebar /> : <MobileSidebar />}

      <Box
        ml={isDesktop ? "280px" : 0}
        w="full"
        p={{ base: 4, md: 8 }}
        position="relative"
        zIndex={1}
      >
        {/* content wrapper (glass card) */}
        <Box
          bg="rgba(10, 18, 38, 0.45)"
          border="1px solid"
          borderColor="rgba(255,255,255,0.10)"
          borderRadius="2xl"
          p={{ base: 4, md: 6 }}
          backdropFilter="blur(12px)"
          boxShadow="0 22px 60px rgba(0,0,0,0.35)"
          minH="calc(100vh - 64px)"
        >
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
}
