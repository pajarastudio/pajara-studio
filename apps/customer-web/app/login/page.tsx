"use client";

import "./login.css";
import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError("Email atau password tidak sesuai.");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Terjadi kendala saat masuk. Silakan coba kembali.");
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* Pindahkan seluruh JSX login yang sebelumnya berada
          setelah tag <style> ke bagian ini. */}
    </main>
  );
}
