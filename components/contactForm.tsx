// components/ContactForm.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

const GETFORM_ENDPOINT =
  process.env.NEXT_PUBLIC_GETFORM_ENDPOINT ||
  "https://getform.io/f/5e54e38e-f647-4a27-b27a-ea140781df50"; // ←差し替え可能

export default function ContactForm() {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "入力してください";
    if (!email.trim())
      e.email = "入力してください";
    else if (
      !/^([a-z0-9+_\-]+)(\.[a-z0-9+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,}$/i.test(
        email
      )
    )
      e.email = "メールアドレスをご確認ください";

    if (!tel.trim()) e.tel = "入力してください";
    else if (!/^\(?\d{2,5}\)?[-.\s]?\d{1,4}[-.\s]?\d{3,4}$/.test(tel))
      e.tel = "電話番号をご確認ください";

    if (!content.trim()) e.content = "入力してください";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      setSending(true);

      // Getformに送信（FormData）
      const fd = new FormData();
      fd.append("company", company);
      fd.append("name", name);
      fd.append("email", email);
      fd.append("tel", tel);
      fd.append("subject", subject);
      fd.append("content", content);
      // 迷惑対策（ハニーポット）
      fd.append("_gotcha", "");

      const res = await fetch(GETFORM_ENDPOINT, {
        method: "POST",
        body: fd,
        mode: "no-cors", // Getformはno-corsでOK（レスポンスは読めません）
      });

      // レスポンスは読めないが、送信は完了している前提でサンクス表示
      setSent(true);
      setCompany("");
      setName("");
      setEmail("");
      setTel("");
      setSubject("");
      setContent("");
    } catch (err) {
      setErrors({ submit: "送信に失敗しました。時間をおいて再度お試しください。" });
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 12,
          padding: 24,
          lineHeight: 1.7,
        }}
      >
        <p style={{ fontSize: 18, marginBottom: 6 }}>
          送信ありがとうございました。
        </p>
        <p>内容を確認のうえ、担当より折り返しご連絡いたします。</p>
      </div>
    );
  }

  const Row = ({
    label,
    name,
    required,
    input,
    error,
  }: {
    label: string;
    name: string;
    required?: boolean;
    input: React.ReactNode;
    error?: string;
  }) => (
    <div style={{ marginBottom: 53 }}>
      <label
        htmlFor={name}
        className="pre:font-dnp pre:text-[12px] pre:font-light pre:block pre:mt-[-3px]"
      >
        {label} {required && <span style={{ color: "#f55" }}>※</span>}
      </label>
      {input}
      {error && (
        <p className="error" style={{ color: "#f55", marginTop: 6 }}>
          {error}
        </p>
      )}
      <div
        className="section-line"
        style={{ borderBottom: "1px solid #222", marginTop: 10 }}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Row
        label="貴社名"
        name="company"
        input={
          <input
            id="company"
            name="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="株式会社Ketchup"
            className="red"
            style={ipt}
          />
        }
      />

      <Row
        label="ご担当者名"
        name="name"
        required
        error={errors.name}
        input={
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="姓名"
            style={ipt}
            required
          />
        }
      />

      <Row
        label="メールアドレス"
        name="email"
        required
        error={errors.email}
        input={
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="xxxx@ktcp.jp"
            style={ipt}
            required
          />
        }
      />

      <Row
        label="電話番号"
        name="tel"
        required
        error={errors.tel}
        input={
          <input
            id="tel"
            name="tel"
            type="tel"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="00000000000"
            style={ipt}
            required
          />
        }
      />

      <Row
        label="件名"
        name="subject"
        input={
          <input
            id="subject"
            name="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="件名をご記入ください"
            style={ipt}
          />
        }
      />

      <Row
        label="お問い合わせ内容"
        name="content"
        required
        error={errors.content}
        input={
          <textarea
            id="content"
            name="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="ご依頼や採用についてなどお問い合わせ内容をご記入ください"
            style={{ ...ipt, height: 180, resize: "vertical" }}
            required
          />
        }
      />

      {errors.submit && (
        <p className="error" style={{ color: "#f55", marginTop: 10 }}>
          {errors.submit}
        </p>
      )}

      {/* ハニーポット（bot対策） */}
      <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} />

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button type="submit" disabled={sending} className="btn-submit">
          {sending ? "Sending..." : "SEND"}
          <Image
            src="/arrow.svg"
            alt=""
            width={19}
            height={18}
            className="btn-submit__arrow"
          />
        </button>
      </div>
    </form>
  );
}

const ipt: React.CSSProperties = {
  marginTop: "12px",
  width: "100%",
  color: "#adadad",
  fontSize: "16px",
  outline: "none",
};