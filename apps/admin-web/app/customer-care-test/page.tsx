
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const API_URL = "https://pajara-connect-api.pajarastd.workers.dev";

const CONVERSATION_ID =
  "e200f970-292b-4786-acd0-cad5aa5d45d3";

export default function CustomerCareTestPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function testMessages() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const session = data.session;

        if (!session?.access_token) {
          throw new Error(
            "Sesi admin tidak ditemukan. Silakan login."
          );
        }

        const response = await fetch(
          `${API_URL}/admin/messages?conversation_id=${CONVERSATION_ID}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const json = await response.json();

        setResult(json);

        if (!response.ok) {
          setError(json.message || `HTTP ${response.status}`);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    testMessages();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 18px",
        background: "#F1ECE6",
        color: "#214D32",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Pajara Customer Care</h1>
      <p>Admin Messages API Test</p>

      {loading && <p>Mengambil pesan percakapan...</p>}

      {!loading && (
        <>
          <h3>
            {error ? "Koneksi bermasalah" : "Hasil pengujian"}
          </h3>

          {error && (
            <p style={{ color: "#B42318" }}>{error}</p>
          )}

          <pre
            style={{
              padding: 16,
              overflowX: "auto",
              borderRadius: 12,
              background: "#FFFFFF",
              color: "#333333",
              fontSize: 12,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
