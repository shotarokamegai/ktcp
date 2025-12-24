// components/ContactForm.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Arrow from "@/components/svg/Arrow";
import SplittingSpan from "@/components/SplittingSpan"

const GETFORM_ENDPOINT =
  process.env.NEXT_PUBLIC_GETFORM_ENDPOINT ||
  "https://getform.io/f/5e54e38e-f647-4a27-b27a-ea140781df50";

type RowProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

function Row({ label, htmlFor, required, error, children }: RowProps) {
  return (
    <div style={{ marginBottom: 53 }}>
      <label
        htmlFor={htmlFor}
        // tailwindで pre: を使ってないなら消してOK（ビルドエラーの原因にもなりがち）
        className="font-dnp text-[12px] font-light block mt-[-3px]"
      >
        {label} {required && <span style={{ color: "#f55" }}>※</span>}
      </label>

      {children}

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
}

export default function ContactForm() {
  const [company, setCompany] = useState("");
  const [personName, setPersonName] = useState(""); // ← name を避けたいならこう（任意）
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!personName.trim()) e.name = "入力してください";

    if (!email.trim()) e.email = "入力してください";
    else if (
      !/^([a-z0-9+_\-]+)(\.[a-z0-9+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,}$/i.test(
        email
      )
    ) {
      e.email = "メールアドレスをご確認ください";
    }

    if (!tel.trim()) e.tel = "入力してください";
    else if (!/^\(?\d{2,5}\)?[-.\s]?\d{1,4}[-.\s]?\d{3,4}$/.test(tel)) {
      e.tel = "電話番号をご確認ください";
    }

    if (!content.trim()) e.content = "入力してください";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      setSending(true);

      const fd = new FormData();
      fd.append("company", company);
      fd.append("name", personName);
      fd.append("email", email);
      fd.append("tel", tel);
      fd.append("subject", subject);
      fd.append("content", content);
      fd.append("_gotcha", "");

      await fetch(GETFORM_ENDPOINT, {
        method: "POST",
        body: fd,
        mode: "no-cors",
      });

      setSent(true);
      setCompany("");
      setPersonName("");
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
        <p style={{ fontSize: 18, marginBottom: 6 }}>送信ありがとうございました。</p>
        <p>内容を確認のうえ、担当より折り返しご連絡いたします。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Row label="貴社名" htmlFor="company">
        <input
          id="company"
          name="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="株式会社Ketchup"
          style={ipt}
        />
      </Row>

      <Row label="ご担当者名" htmlFor="name" required error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="姓名"
          style={ipt}
          required
        />
      </Row>

      <Row label="メールアドレス" htmlFor="email" required error={errors.email}>
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
      </Row>

      <Row label="電話番号" htmlFor="tel" required error={errors.tel}>
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
      </Row>

      <Row label="件名" htmlFor="subject">
        <input
          id="subject"
          name="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="件名をご記入ください"
          style={ipt}
        />
      </Row>

      <Row
        label="お問い合わせ内容"
        htmlFor="content"
        required
        error={errors.content}
      >
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
      </Row>

      {errors.submit && (
        <p className="error" style={{ color: "#f55", marginTop: 10 }}>
          {errors.submit}
        </p>
      )}

      <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} />

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button type="submit" disabled={sending} className="btn-submit splitting-hover icon-hover pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white">
          {/* {sending ? "Sending..." : "SEND"} */}
          <span className="splitting-hover__inner">
            <SplittingSpan text="SEND" />
            <SplittingSpan text="SEND" />
          </span>
          <div className="icon-content pre:absolute center-y pre:right-[25px] pre:flex pre:items-center">
            <span className="icon-content__inner">
              <div className="pre:p-[5px] icon">
                <Arrow />
              </div>
              <div className="pre:p-[5px] icon">
                <Arrow />
              </div>
            </span>
          </div>
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
