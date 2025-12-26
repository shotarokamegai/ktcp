"use client";

import { useState } from "react";
import FMLink from "@/components/FMLink";
import Arrow from "@/components/svg/Arrow";
import SplittingSpan from "@/components/SplittingSpan";

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
    <div className="pre:mb-[50px] pre:sm:sp-mb-[50]">
      <label
        htmlFor={htmlFor}
        className="font-dnp pre:text-[12px] pre:font-light pre:block pre:mt-[-3px] pre:sm:sp-fs-[12]"
      >
        {label}{" "}
        {required && (
          <span className="pre:ml-[6px] pre:text-ketchup">※</span>
        )}
      </label>

      {children}

      {error && (
        <p className="pre:mt-[6px] pre:text-ketchup pre:text-[12px]">
          {error}
        </p>
      )}

      <div className="pre:mt-[6px] pre:border-b pre:border-solid pre:border-[#222]" />
    </div>
  );
}

export default function ContactForm() {
  const [company, setCompany] = useState("");
  const [personName, setPersonName] = useState("");
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

  // 共通 input 見た目（style={ipt} を全廃）
  const iptClass =
    "pre:mt-[12px] pre:w-full pre:text-[16px] pre:text-[#adadad] pre:bg-transparent pre:outline-none " +
    "pre:placeholder:text-[#adadad] " +
    "pre:focus-visible:outline-none " +
    "pre:focus-visible:ring-0 " +
    "pre:sm:sp-fs-[16]";

  // エラー時の input 表現（必要なら）
  const iptErrorClass = "pre:text-ketchup pre:placeholder:text-ketchup";

  if (sent) {
    return (
      <div>
        <h2 className="pre:text-[24px] pre:text-center pre:font-gt pre:font-light pre:mb-[50px]">
          Message Sent
        </h2>
        <h3 className="pre:text-[16px] pre:font-bold pre:mb-5 pre:text-center">
          応募受付完了
        </h3>
        <p className="pre:text-center pre:text-[16px] pre:leading-[180%]">
          このたびはご応募いただき、誠にありがとうございます。
          <br />
          入力内容を確認し、選考に進む場合は担当者よりご連絡いたします。
        </p>

        <FMLink
          href="/"
          className="btn-submit pre:mt-[30px] pre:mx-auto splitting-hover icon-hover pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white pre:sm:sp-mt-[12]"
        >
          <span className="splitting-hover__inner">
            <SplittingSpan text="BACK TO TOP" />
            <SplittingSpan text="BACK TO TOP" />
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
        </FMLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="slide-in">
      <Row label="貴社名" htmlFor="company">
        <input
          id="company"
          name="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="株式会社Ketchup"
          className={[iptClass, "pre:sm:sp-mt-[20]"].join(" ")}
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
          className={[iptClass, errors.name ? iptErrorClass : ""].join(" ")}
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
          className={[iptClass, errors.email ? iptErrorClass : ""].join(" ")}
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
          className={[iptClass, errors.tel ? iptErrorClass : ""].join(" ")}
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
          className={iptClass}
        />
      </Row>

      <Row label="お問い合わせ内容" htmlFor="content" required error={errors.content}>
        <textarea
          id="content"
          name="content"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="ご依頼や採用についてなどお問い合わせ内容をご記入ください"
          className={[
            iptClass,
            "pre:h-[180px] pre:resize-y",
            errors.content ? iptErrorClass : "",
          ].join(" ")}
          required
        />
      </Row>

      {errors.submit && (
        <p className="pre:mt-[10px] pre:text-ketchup pre:text-[12px]">
          {errors.submit}
        </p>
      )}

      <input type="text" name="_gotcha" className="pre:hidden" tabIndex={-1} />

      <div>
        <button
          type="submit"
          disabled={sending}
          className={[
            "btn-submit splitting-hover icon-hover",
            "pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white",
            sending ? "pre:opacity-50 pre:pointer-events-none" : "",
          ].join(" ")}
        >
          <span className="splitting-hover__inner">
            <SplittingSpan text="SEND" />
            <SplittingSpan text="SEND" />
          </span>
          <div className="icon-content pre:absolute center-y pre:right-[25px] pre:flex pre:items-center pre:sm:sp-right-[15] sm:center-y">
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
