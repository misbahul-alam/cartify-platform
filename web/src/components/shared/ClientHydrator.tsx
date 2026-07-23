"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useEffect } from "react";

export const ClientHydrator: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeCart = useCartStore((state) => state.initialize);

  useEffect(() => {
    async function init() {
      await initializeAuth();
      initializeCart();
    }
    init();
  }, [initializeAuth, initializeCart]);

  return null;
};
