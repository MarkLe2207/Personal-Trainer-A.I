"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface CompletedWorkout {
  day: string;
  muscle: string;
  routine: string;
  duration: number;
  completedAt: string;
}

interface AppState {
  pantry: string[];
  addPantryItems: (items: string[]) => void;
  addPantryItem: (item: string) => void;
  removePantryItem: (item: string) => void;
  clearPantry: () => void;
  completedWorkouts: CompletedWorkout[];
  addCompletedWorkout: (w: CompletedWorkout) => void;
}

const AppContext = createContext<AppState | null>(null);

function normalize(item: string): string {
  const trimmed = item.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [pantry, setPantry] = useState<string[]>([
    "Chicken Breast",
    "Broccoli",
    "Eggs",
    "Greek Yogurt",
    "Oats",
    "Banana",
  ]);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>(
    [],
  );

  const addPantryItems = useCallback((items: string[]) => {
    setPantry((prev) => {
      const seen = new Set(prev.map((i) => i.toLowerCase()));
      const toAdd: string[] = [];
      for (const raw of items) {
        const item = normalize(raw);
        if (!item) continue;
        const key = item.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        toAdd.push(item);
      }
      return [...prev, ...toAdd];
    });
  }, []);

  const addPantryItem = useCallback(
    (item: string) => addPantryItems([item]),
    [addPantryItems],
  );

  const removePantryItem = useCallback((item: string) => {
    setPantry((prev) =>
      prev.filter((i) => i.toLowerCase() !== item.toLowerCase()),
    );
  }, []);

  const clearPantry = useCallback(() => setPantry([]), []);

  const addCompletedWorkout = useCallback((w: CompletedWorkout) => {
    setCompletedWorkouts((prev) => [w, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      pantry,
      addPantryItems,
      addPantryItem,
      removePantryItem,
      clearPantry,
      completedWorkouts,
      addCompletedWorkout,
    }),
    [
      pantry,
      addPantryItems,
      addPantryItem,
      removePantryItem,
      clearPantry,
      completedWorkouts,
      addCompletedWorkout,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
