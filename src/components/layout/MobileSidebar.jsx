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
  Button,
  Icon,
} from "@chakra-ui/react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileSidebar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        position="fixed"
        top={4}
        left={4}
        zIndex="overlay"
        onClick={onOpen}
        colorScheme="blue"
        size="lg"
      >
        <Icon as={Menu} boxSize={6} />
      </Button>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="280px">
          <DrawerCloseButton />
          <DrawerHeader />
          <DrawerBody p={0}>
            <Sidebar />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}