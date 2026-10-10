"use client";

import { usePathname } from "next/navigation";
import CustomerBottomNav from "./CustomerBottomNav";

const HIDDEN_PATHS = new Set([
"/login",
"/forgot-password",
"/reset-password",
"/signup",
"/register",
]);

export default function CustomerNavigation() {
const pathname = usePathname();

if (!pathname || HIDDEN_PATHS.has(pathname)) {
return null;
}

return <CustomerBottomNav />;
}
