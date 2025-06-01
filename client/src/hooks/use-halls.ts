import { useQuery } from "@tanstack/react-query";

export interface Hall {
  id: string;
  name: string;
  description: string;
}

export function useHalls() {
  return useQuery<Hall[]>({
    queryKey: ["/api/halls"],
    queryFn: async () => {
      const response = await fetch("/api/halls", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch halls");
      }
      return response.json();
    },
  });
}