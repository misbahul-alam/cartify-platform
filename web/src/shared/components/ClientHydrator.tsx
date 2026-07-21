"use client";

import { useAuthStore } from "@/features/auth/store";
import { useCartStore } from "@/features/cart/store";
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
