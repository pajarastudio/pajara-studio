
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const API_URL = "https://pajara-connect-api.pajarastd.workers.dev";

type Conversation = {
  id: string;
  visitor_id: string;
  customer_name: string;
  customer_email?: string | null;
  site_key: string;
  status: string;
  created_at: string;
  updated_at: string;
  unread_count?: number;
};

type Attachment = {
  id?: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  url: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_type: "visitor" | "admin";
  message: string;
  is_read: boolean;
  created_at: string;
  attachments?: Attachment[];
};

type ConversationResponse = {
  success: boolean;
  conversations?: Conversation[];
  message?: string;
};

type MessageResponse = {
  success: boolean;
  messages?: Message[];
  message?: string;
};

export default function CustomerCarePage() {
  const [accessToken, setAccessToken] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedConversation = conversations.find(
    (item) => item.id === selectedId
  );

  const apiRequest = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),
          ...options.headers,
        },
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Permintaan gagal (${response.status})`
        );
      }

      return result;
    },
    [accessToken]
  );

  const loadConversations = useCallback(async () => {
    if (!accessToken) return;

    try {
      const result = (await apiRequest(
        "/admin/conversations"
      )) as ConversationResponse;

      const items = result.conversations ?? [];

      setConversations(items);

      setSelectedId((current) => {
        if (current && items.some((item) => item.id === current)) {
          return current;
        }

        return items[0]?.id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat percakapan."
      );
    }
  }, [accessToken, apiRequest]);

  const loadMessages = useCallback(
    async (conversationId: string, showLoading = true) => {
      if (!accessToken || !conversationId) {
        setMessages([]);
        return;
      }

      if (showLoading) setLoadingMessages(true);

      try {
        const result = (await apiRequest(
          `/admin/messages?conversation_id=${encodeURIComponent(
            conversationId
          )}`
        )) as MessageResponse;

        setMessages(result.messages ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat pesan."
        );
      } finally {
        if (showLoading) setLoadingMessages(false);
      }
    },
    [accessToken, apiRequest]
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const token = data.session?.access_token;

        if (!token) {
          throw new Error("Sesi admin tidak ditemukan. Silakan login.");
        }

        if (!active) return;

        setAccessToken(token);
        setAuthorized(true);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memeriksa sesi admin."
          );
        }
      } finally {
        if (active) setInitialLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authorized || !accessToken) return;

    void loadConversations();

    const interval = window.setInterval(() => {
      void loadConversations();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [authorized, accessToken, loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    void loadMessages(selectedId);

    const interval = window.setInterval(() => {
      void loadMessages(selectedId, false);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [selectedId, loadMessages]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = messageInput.trim();

    if (!message || !selectedId || sending) return;

    setSending(true);
    setError("");
    setNotice("");

    try {
      await apiRequest("/admin/message/reply", {
        method: "POST",
        body: JSON.stringify({
          conversation_id: selectedId,
          message,
        }),
      });

      setMessageInput("");
      setNotice("Balasan berhasil dikirim.");

      await loadMessages(selectedId, false);
      await loadConversations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengirim balasan."
      );
    } finally {
      setSending(false);
    }
  }

  const filteredConversations = conversations.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.customer_name?.toLowerCase().includes(keyword) ||
      item.customer_email?.toLowerCase().includes(keyword) ||
      item.id.toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && (item.unread_count ?? 0) > 0) ||
      item.status === filter;

    return matchesSearch && matchesFilter;
  });

  function formatTime(value: string) {
    if (!value) return "";

    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusLabel(status: string) {
    switch (status) {
      case "new":
        return "Baru";
      case "waiting":
        return "Menunggu balasan";
      case "replied":
        return "Sudah dibalas";
      case "completed":
        return "Selesai";
      default:
        return status;
    }
  }

  function siteLabel(site: string) {
    switch (site) {
      case "website":
        return "Website";
      case "customer":
        return "Customer Website";
      case "links":
        return "Pajara Links";
      case "news":
        return "Pajara News";
      default:
        return site || "Tidak diketahui";
    }
  }

  const unreadTotal = conversations.reduce(
    (total, item) => total + (item.unread_count ?? 0),
    0
  );

  if (initialLoading) {
    return (
      <main className="page">
        <p className="center">Memeriksa sesi admin...</p>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="page">
        <div className="empty-state">
          <h2>Akses tidak tersedia</h2>
          <p>{error || "Silakan login sebagai admin."}</p>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <p className="eyebrow">PAJARA STUDIO</p>
          <h1>Customer Care</h1>
          <p className="subtitle">
            Pusat komunikasi pelanggan Pajara Studio.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={() => {
            void loadConversations();
            if (selectedId) void loadMessages(selectedId);
          }}
          type="button"
        >
          ↻ Perbarui
        </button>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Total percakapan</span>
          <strong>{conversations.length}</strong>
        </div>
        <div className="stat-card">
          <span>Pesan belum dibaca</span>
          <strong>{unreadTotal}</strong>
        </div>
      </section>

      {error && (
        <div className="alert error">
          {error}
          <button onClick={() => setError("")} type="button">
            ×
          </button>
        </div>
      )}

      {notice && (
        <div className="alert success">
          {notice}
          <button onClick={() => setNotice("")} type="button">
            ×
          </button>
        </div>
      )}

      <section className="workspace">
        <aside className="conversation-panel">
          <div className="panel-heading">
            <h2>Percakapan</h2>
            <span>{filteredConversations.length}</span>
          </div>

          <input
            className="search-input"
            placeholder="Cari nama pelanggan..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="filter-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">Semua percakapan</option>
            <option value="unread">Belum dibaca</option>
            <option value="new">Baru</option>
            <option value="waiting">Menunggu balasan</option>
            <option value="replied">Sudah dibalas</option>
            <option value="completed">Selesai</option>
          </select>

          <div className="conversation-list">
            {filteredConversations.length === 0 ? (
              <div className="list-empty">
                Belum ada percakapan.
              </div>
            ) : (
              filteredConversations.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`conversation-item ${
                    selectedId === item.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedId(item.id);
                    setError("");
                    setNotice("");
                  }}
                >
                  <div className="conversation-top">
                    <strong>{item.customer_name || "Pelanggan"}</strong>
                    <span>{formatTime(item.updated_at)}</span>
                  </div>

                  <div className="conversation-bottom">
                    <span>{siteLabel(item.site_key)}</span>

                    {(item.unread_count ?? 0) > 0 && (
                      <span className="unread-badge">
                        {item.unread_count}
                      </span>
                    )}
                  </div>

                  <span className={`status status-${item.status}`}>
                    {statusLabel(item.status)}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="chat-panel">
          {!selectedConversation ? (
            <div className="empty-state">
              <div className="empty-icon">✉</div>
              <h2>Customer Care</h2>
              <p>
                Pilih percakapan untuk melihat pesan pelanggan.
              </p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div>
                  <h2>{selectedConversation.customer_name}</h2>
                  <p>
                    {siteLabel(selectedConversation.site_key)}
                    {selectedConversation.customer_email
                      ? ` · ${selectedConversation.customer_email}`
                      : ""}
                  </p>
                </div>

                <span
                  className={`status status-${selectedConversation.status}`}
                >
                  {statusLabel(selectedConversation.status)}
                </span>
              </div>

              <div className="message-list">
                {loadingMessages ? (
                  <p className="center">Memuat pesan...</p>
                ) : messages.length === 0 ? (
                  <p className="center">
                    Belum ada pesan dalam percakapan ini.
                  </p>
                ) : (
                  messages.map((item) => (
                    <div
                      key={item.id}
                      className={`message-row ${
                        item.sender_type === "admin"
                          ? "message-admin"
                          : "message-visitor"
                      }`}
                    >
                      <div className="message-bubble">
                        <span className="message-sender">
                          {item.sender_type === "admin"
                            ? "Pajara Studio"
                            : selectedConversation.customer_name}
                        </span>

                        {item.message && <p>{item.message}</p>}

                        {item.attachments && item.attachments.length > 0 && (
                          <div className="attachment-list">
                            {item.attachments.map((file, index) => (
                              <div
                                className="attachment-item"
                                key={file.id || `${file.file_name}-${index}`}
                              >
                                {file.url &&
                                file.mime_type.startsWith("image/") ? (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="attachment-image-link"
                                  >
                                    <img
                                      src={file.url}
                                      alt={file.file_name}
                                      className="attachment-image"
                                    />
                                  </a>
                                ) : file.url &&
                                  file.mime_type === "application/pdf" ? (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="attachment-pdf"
                                  >
                                    <span className="pdf-icon">PDF</span>
                                    <span>
                                      <strong>{file.file_name}</strong>
                                      <small>Buka dokumen PDF</small>
                                    </span>
                                  </a>
                                ) : (
                                  <span className="attachment-unavailable">
                                    Lampiran tidak tersedia: {file.file_name}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <time>{formatTime(item.created_at)}</time>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedConversation.status === "completed" ? (
                <div className="completed-notice">
                  Percakapan ini sudah selesai dan tidak dapat dibalas.
                </div>
              ) : (
                <form className="reply-form" onSubmit={handleSend}>
                  <textarea
                    value={messageInput}
                    onChange={(event) =>
                      setMessageInput(event.target.value)
                    }
                    placeholder="Tulis balasan untuk pelanggan..."
                    maxLength={2000}
                    rows={2}
                    disabled={sending}
                  />

                  <div className="reply-footer">
                    <span>{messageInput.length}/2000</span>
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sending}
                    >
                      {sending ? "Mengirim..." : "Kirim Balasan"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </section>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .page {
    min-height: 100vh;
    padding: 28px 22px 110px;
    background: #F1ECE6;
    color: #214D32;
    font-family: Arial, sans-serif;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto 24px;
  }

  .eyebrow {
    margin: 0 0 7px;
    color: #8A6A4A;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 2px;
  }

  h1 {
    margin: 0;
    font-size: 27px;
    letter-spacing: -0.8px;
  }

  .subtitle {
    margin: 7px 0 0;
    color: #77776F;
    font-size: 13px;
  }

  .refresh-button {
    padding: 10px 14px;
    border: 1px solid #DCD5CA;
    border-radius: 10px;
    background: #fff;
    color: #214D32;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    max-width: 1200px;
    margin: 0 auto 18px;
  }

  .stat-card {
    padding: 17px;
    border: 1px solid #E7E0D6;
    border-radius: 14px;
    background: #fff;
  }

  .stat-card span {
    display: block;
    color: #85877F;
    font-size: 11px;
  }

  .stat-card strong {
    display: block;
    margin-top: 8px;
    font-size: 25px;
  }

  .workspace {
    display: grid;
    grid-template-columns: 340px minmax(0, 1fr);
    gap: 16px;
    max-width: 1200px;
    height: min(680px, calc(100vh - 260px));
    min-height: 450px;
    margin: 0 auto;
  }

  .conversation-panel,
  .chat-panel {
    display: flex;
    min-width: 0;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #E7E0D6;
    border-radius: 16px;
    background: #fff;
  }

  .conversation-panel {
    padding: 15px;
  }

  .panel-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .panel-heading h2 {
    margin: 0;
    font-size: 15px;
  }

  .panel-heading span {
    display: grid;
    width: 25px;
    height: 25px;
    place-items: center;
    border-radius: 50%;
    background: #EDF3EB;
    font-size: 11px;
    font-weight: 700;
  }

  .search-input,
  .filter-select {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 9px;
    padding: 11px;
    border: 1px solid #E8E5DF;
    border-radius: 9px;
    background: #FAFAF8;
    color: #333;
    font-size: 12px;
    outline-color: #2F6B45;
  }

  .conversation-list {
    flex: 1;
    overflow-y: auto;
  }

  .conversation-item {
    display: block;
    width: 100%;
    margin-bottom: 7px;
    padding: 12px;
    border: 1px solid transparent;
    border-radius: 11px;
    background: #FAFAF8;
    color: #333;
    text-align: left;
    cursor: pointer;
  }

  .conversation-item.selected {
    border-color: #B9D0BC;
    background: #EDF3EB;
  }

  .conversation-top,
  .conversation-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .conversation-top strong {
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .conversation-top > span,
  .conversation-bottom {
    color: #85877F;
    font-size: 10px;
  }

  .conversation-bottom {
    margin-top: 8px;
  }

  .unread-badge {
    display: grid;
    min-width: 18px;
    height: 18px;
    place-items: center;
    padding: 0 4px;
    border-radius: 20px;
    background: #B45E48;
    color: white;
    font-size: 10px;
    font-weight: 700;
  }

  .status {
    display: inline-block;
    margin-top: 8px;
    padding: 4px 7px;
    border-radius: 20px;
    background: #F0F0EC;
    color: #666;
    font-size: 9px;
    font-weight: 700;
  }

  .status-new {
    background: #FFF0D8;
    color: #94601B;
  }

  .status-waiting {
    background: #FCE9E5;
    color: #A34C3D;
  }

  .status-replied {
    background: #E8F1E8;
    color: #326943;
  }

  .status-completed {
    background: #EEEEEE;
    color: #666;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 17px;
    border-bottom: 1px solid #EEEAE4;
  }

  .chat-header h2 {
    margin: 0;
    font-size: 15px;
  }

  .chat-header p {
    margin: 5px 0 0;
    color: #85877F;
    font-size: 10px;
  }

  .chat-header .status {
    flex-shrink: 0;
    margin: 0;
  }

  .message-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 13px;
    overflow-y: auto;
    padding: 18px;
    background: #FCFBF9;
  }

  .message-row {
    display: flex;
    width: 100%;
  }

  .message-admin {
    justify-content: flex-end;
  }

  .message-visitor {
    justify-content: flex-start;
  }

  .message-bubble {
    max-width: min(78%, 470px);
    padding: 11px 13px;
    border-radius: 13px;
    overflow-wrap: anywhere;
  }

  .message-visitor .message-bubble {
    border: 1px solid #EAE5DC;
    border-bottom-left-radius: 4px;
    background: #fff;
  }

  .message-admin .message-bubble {
    border-bottom-right-radius: 4px;
    background: #EAF2E9;
  }

  .message-sender {
    display: block;
    margin-bottom: 6px;
    color: #66806B;
    font-size: 9px;
    font-weight: 800;
  }

  .message-bubble p {
    margin: 0;
    color: #333;
    font-size: 13px;
    line-height: 1.55;
    white-space: pre-wrap;
  }

  .message-bubble time {
    display: block;
    margin-top: 7px;
    color: #92928B;
    font-size: 9px;
    text-align: right;
  }

  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
    margin-top: 9px;
  }

  .attachment-item {
    max-width: 100%;
  }

  .attachment-image-link {
    display: block;
    overflow: hidden;
    border: 1px solid #EAE5DC;
    border-radius: 10px;
  }

  .attachment-image {
    display: block;
    width: 100%;
    max-width: 300px;
    max-height: 280px;
    object-fit: contain;
    background: #F5F3EF;
  }

  .attachment-pdf {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 280px;
    padding: 11px;
    border: 1px solid #E5E1DA;
    border-radius: 10px;
    background: #FAFAF8;
    color: #214D32;
    text-decoration: none;
  }

  .pdf-icon {
    display: grid;
    width: 38px;
    height: 42px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 7px;
    background: #FCE9E5;
    color: #A34C3D;
    font-size: 10px;
    font-weight: 800;
  }

  .attachment-pdf strong,
  .attachment-pdf small {
    display: block;
    overflow-wrap: anywhere;
  }

  .attachment-pdf strong {
    font-size: 11px;
  }

  .attachment-pdf small {
    margin-top: 4px;
    color: #85877F;
    font-size: 10px;
  }

  .attachment-unavailable {
    color: #A34C3D;
    font-size: 11px;
  }

  .reply-form {
    padding: 13px;
    border-top: 1px solid #EEEAE4;
  }

  .reply-form textarea {
    display: block;
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    padding: 12px;
    border: 1px solid #E5E1DA;
    border-radius: 10px;
    color: #333;
    font: inherit;
    font-size: 12px;
    outline-color: #2F6B45;
  }

  .reply-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 9px;
  }

  .reply-footer span {
    color: #92928B;
    font-size: 10px;
  }

  .reply-footer button {
    padding: 11px 16px;
    border: 0;
    border-radius: 9px;
    background: #214D32;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  .reply-footer button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .completed-notice {
    padding: 17px;
    background: #F5F3EF;
    color: #777;
    font-size: 12px;
    text-align: center;
  }

  .empty-state {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 25px;
    color: #85877F;
    text-align: center;
  }

  .empty-state h2 {
    margin: 12px 0 6px;
    color: #214D32;
    font-size: 17px;
  }

  .empty-state p {
    max-width: 280px;
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
  }

  .empty-icon {
    font-size: 30px;
  }

  .list-empty {
    padding: 25px 10px;
    color: #85877F;
    font-size: 12px;
    text-align: center;
  }

  .center {
    margin: auto;
    color: #85877F;
    font-size: 12px;
    text-align: center;
  }

  .alert {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    max-width: 1168px;
    margin: 0 auto 12px;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 12px;
  }

  .alert button {
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 18px;
    cursor: pointer;
  }

  .error {
    background: #FCE9E5;
    color: #A34C3D;
  }

  .success {
    background: #E8F1E8;
    color: #326943;
  }

  @media (max-width: 760px) {
    .page {
      padding: 22px 12px 105px;
    }

    .header {
      align-items: flex-start;
    }

    h1 {
      font-size: 23px;
    }

    .subtitle {
      max-width: 230px;
      line-height: 1.5;
    }

    .refresh-button {
      padding: 9px;
      font-size: 10px;
    }

    .workspace {
      grid-template-columns: minmax(0, 1fr);
      height: auto;
      min-height: 0;
    }

    .conversation-panel {
      max-height: 330px;
    }

    .chat-panel {
      min-height: 520px;
    }

    .message-bubble {
      max-width: 88%;
    }
  }

  @media (max-width: 380px) {
    .stats {
      gap: 8px;
    }

    .stat-card {
      padding: 13px;
    }

    .chat-header {
      padding: 13px;
    }
  }
`;
