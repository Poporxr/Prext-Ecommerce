"use client";

import { useContext } from "react";
import { AuthContext } from "@/app/providers";

export function useAuth() {
  return useContext(AuthContext);
}
