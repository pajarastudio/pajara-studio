"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
const [show, setShow] = useState(true);

useEffect(() => {
const timer = window.setTimeout(() => {
setShow(false);
}, 2500);

return () => window.clearTimeout(timer);

}, []);

if (!show) return null;

return (
<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f7f4ee]">
<img
src="/20261010_192337.png"
alt="Pajara Admin"
className="h-full w-full object-cover"
/>
</div>
);
}
