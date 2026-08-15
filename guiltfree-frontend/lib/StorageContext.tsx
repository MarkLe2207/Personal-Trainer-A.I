"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface StorageContextValue {
  items: string[];
  addItems: (names: string[]) => void;
  addItem: (name: string) => void;
  removeItem: (name: string) => void;
}

const StorageContext = createContext<StorageContextValue | null>(null);

const DEFAULT_ITEMS = [
  "Chicken Breast",
  "Eggs",
  "Broccoli",
  "Rice",
  "Greek Yogurt",
  "Mixed Berries",
  "Spinach",
  "Salmon Fillet",
  "Lentils",
  "Quinoa",
];

function normalize(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function StorageProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);

  const addItems = useCallback((names: string[]) => {
    setItems((prev) => {
      const next = [...prev];
      for (const raw of names) {
        const clean = normalize(raw);
        if (
          clean &&
          !next.some((n) => n.toLowerCase() === clean.toLowerCase())
        ) {
          next.push(clean);
        }
      }
      return next;
    });
  }, []);

  const addItem = useCallback(
    (name: string) => {
      addItems([name]);
    },
    [addItems],
  );

  const removeItem = useCallback((name: string) => {
    setItems((prev) => prev.filter((n) => n.toLowerCase() !== name.toLowerCase()));
  }, []);

  const value = useMemo(
    () => ({ items, addItems, addItem, removeItem }),
    [items, addItems, addItem, removeItem],
  );

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
}

export function useStorage(): StorageContextValue {
  const ctx = useContext(StorageContext);
  if (!ctx) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return ctx;
}
