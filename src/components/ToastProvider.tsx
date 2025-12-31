"use client";

import { useState, useEffect } from "react";
import { Toast, setToastCallback } from "./Toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setToastCallback((message: string) => {
      setToastMessage(message);
      setIsVisible(true);
    });
  }, []);

  return (
    <>
      {children}
      <Toast
        message={toastMessage}
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </>
  );
}

