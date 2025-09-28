/**
 * UI Component Declarations
 * This file adds TypeScript support for custom variants of UI components
 */

import { ButtonProps } from "./button";

declare module "@/components/ui/button" {
  interface ButtonProps {
    variant?: "default" | "destructive" | "outline" | "success" | "warning" | "ghost";
  }
}
