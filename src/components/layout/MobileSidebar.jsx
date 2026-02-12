// src/components/layout/MobileSidebar.jsx
import React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileSidebar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {/* glass hamburger */}
      <IconButton
        aria-label="Open menu"
        position="fixed"
        top={4}
        left={4}
        zIndex="overlay"
        onClick={onOpen}
        icon={<Icon as={Menu} boxSize={6} />}
        bg="rgba(10, 18, 38, 0.55)"
        color="whiteAlpha.900"
        border="1px solid"
        borderColor="rgba(255,255,255,0.14)"
        backdropFilter="blur(12px)"
        _hover={{ bg: "rgba(10, 18, 38, 0.7)" }}
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay bg="rgba(0,0,0,0.55)" />
        <DrawerContent
          maxW="280px"
          bg="rgba(10, 18, 38, 0.92)"
          borderRight="1px solid"
          borderColor="rgba(255,255,255,0.10)"
        >
          <DrawerCloseButton color="whiteAlpha.800" />
          <DrawerHeader borderBottom="1px solid" borderColor="rgba(255,255,255,0.08)" />
          <DrawerBody p={0}>
            <Sidebar onNavigate={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
