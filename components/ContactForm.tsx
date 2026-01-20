"use client";

import { init, send } from "emailjs-com";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import FMLink from "@/components/FMLink";
import Arrow from "@/components/svg/Arrow";
import Image from "next/image";
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
        {required && <span className="pre:ml-[6px] pre:text-ketchup">※</span>}
      </label>

      {children}

      {error && (
        <p className="pre:mt-[6px] pre:text-ketchup pre:text-[12px]">{error}</p>
      )}

      <div className="pre:mt-[6px] pre:border-b pre:border-solid pre:border-[#222]" />
    </div>
  );
}

/**
 * ✅ 二度表示防止版 slide-in（Contact用）
 */
function useSlideInArm(
  rootRef: React.RefObject<HTMLElement | null>,
  deps: any[] = [],
  delayMs = 120
) {
  const timerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.style.visibility = "hidden";

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const els = Array.from(root.querySelectorAll<HTMLElement>(".slide-in"));
    if (els.length === 0) return;

    els.forEach((el) => {
      el.style.transition = "none";
      el.classList.remove("is-shown");
      el.setAttribute("data-slidein-rearm", "1");
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    root.offsetHeight;

    els.forEach((el) => {
      el.style.transition = "";
    });

    return () => {
      const r = rootRef.current;
      if (!r) return;

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      r.querySelectorAll<HTMLElement>('.slide-in[data-slidein-rearm="1"]').forEach((el) => {
        el.removeAttribute("data-slidein-rearm");
        el.style.transition = "";
      });

      r.style.visibility = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = window.setTimeout(() => {
      requestAnimationFrame(() => {
        root.style.visibility = "visible";

        root
          .querySelectorAll<HTMLElement>('.slide-in[data-slidein-rearm="1"]')
          .forEach((el) => el.classList.add("is-shown"));
      });
    }, delayMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function ContactForm() {
  const rootRef = useRef<HTMLElement | null>(null);

  const [company, setCompany] = useState("");
  const [personName, setPersonName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // ✅ 初回 & sent切替後に「一度もチラ見えさせず」slide-in
  useSlideInArm(rootRef, [sent], 120);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!personName.trim()) e.name = "入力してください";

    if (!email.trim()) e.email = "入力してください";
    else if (
      !/^([a-z0-9+_\-]+)(\.[a-z0-9+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,}$/i.test(email)
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

  const user_id = process.env.NEXT_PUBLIC_PORTFOLIO_EMAILJS_USER_ID;
  const service_id = process.env.NEXT_PUBLIC_PORTFOLIO_EMAILJS_SERVICE_ID;
  const template_id = process.env.NEXT_PUBLIC_PORTFOLIO_EMAILJS_TEMPLATE_ID;

  if (!user_id || !service_id || !template_id) {
    throw new Error("EmailJS env vars are missing");
  }

  init(user_id);

  const template_param = {
    to_name: "Ketchup Inc.",
    from_name: personName,
    tel,
    email,
    subject,      // ※テンプレで使うなら
    message: content,
  };

  await send(service_id, template_id, template_param);

  window.dispatchEvent(new Event("ktcp:scrollTop"));

  setSent(true);
  setCompany("");
  setPersonName("");
  setEmail("");
  setTel("");
  setSubject("");
  setContent("");
  setErrors({});
} catch (err) {
  console.error(err);
  setErrors({ submit: "送信に失敗しました（EmailJS）。設定をご確認ください。" });
} finally {
  setSending(false);
}
    // try {
    //   setSending(true);

    //   const fd = new FormData();
    //   fd.append("company", company);
    //   fd.append("name", personName);
    //   fd.append("email", email);
    //   fd.append("tel", tel);
    //   fd.append("subject", subject);
    //   fd.append("content", content);
    //   fd.append("_gotcha", "");

    //   await fetch(GETFORM_ENDPOINT, {
    //     method: "POST",
    //     body: fd,
    //     mode: "no-cors",
    //   });

    //   window.dispatchEvent(new Event("ktcp:scrollTop"));

    //   setSent(true);
    //   setCompany("");
    //   setPersonName("");
    //   setEmail("");
    //   setTel("");
    //   setSubject("");
    //   setContent("");
    //   setErrors({});
    // } catch {
    //   setErrors({ submit: "送信に失敗しました。時間をおいて再度お試しください。" });
    // } finally {
    //   setSending(false);
    // }
  };

  const iptClass =
    "pre:mt-[12px] pre:w-full pre:text-[16px] pre:text-[#adadad] pre:bg-transparent pre:outline-none " +
    "pre:placeholder:text-[#adadad] " +
    "pre:focus-visible:outline-none " +
    "pre:focus-visible:ring-0 " +
    "pre:sm:sp-fs-[16]";

  const iptErrorClass = "pre:text-ketchup pre:placeholder:text-[#f55]";

  if (sent) {
    return (
      <section
        ref={rootRef as any}
        style={{ visibility: "hidden" }} // ★初期フレームを確実に隠す
        className="
          pre:mb-[180px]
          pre:w-[calc(100%-40px)]
          pre:mx-auto
          pre:sm:sp-w-[339]
          pre:sm:block
          pre:sm:sp-mb-[110]
        "
      >
        <h2 className="pre:text-[24px] pre:text-center pre:font-gt pre:font-light pre:mb-[50px] slide-in">
          Message Sent
        </h2>

        <Image
          src="/illust/complete.png"
          alt=""
          width={827}
          height={1037}
          className="pre:w-[250px] pre:mx-auto pre:mb-5 slide-in pre:sm:sp-w-[175]"
        />

        <p className="pre:text-center pre:text-[16px] pre:leading-[180%] slide-in">
          送信が完了しました。
        </p>

        <FMLink
          href="/"
          className="btn-submit pre:mt-[30px] pre:mx-auto splitting-hover icon-hover pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white pre:sm:sp-mt-[12] slide-in"
        >
          <span className="splitting-hover__inner">
            <SplittingSpan text="BACK TO TOP" />
            <SplittingSpan text="BACK TO TOP" />
          </span>
          <div className="icon-content pre:absolute center-y pre:right-[25px] pre:flex pre:items-center pre:sm:sp-right-[15] sm:center-y">
            <span className="icon-content__inner">
              <div className="pre:p-[5px] icon pre:sm:p-0">
                <Arrow />
              </div>
              <div className="pre:p-[5px] icon pre:sm:p-0">
                <Arrow />
              </div>
            </span>
          </div>
        </FMLink>
      </section>
    );
  }

  return (
    <section
      ref={rootRef as any}
      style={{ visibility: "hidden" }} // ★初期フレームを確実に隠す
      className="
        pre:grid
        pre:items-start
        pre:grid-cols-[calc(460/1401*100%)_1fr]
        pre:gap-x-[calc(192/1401*100%)]
        pre:mb-[180px]
        pre:w-[calc(100%-40px)]
        pre:mx-auto
        pre:sm:block
        pre:sm:sp-mb-[110]
      "
    >
      <div className="pre:sticky pre:top-24 pre:sm:relative pre:sm:top-auto pre:sm:sp-mb-[40]">
        <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:mb-[106px] slide-in pre:sm:sp-fs-[24] pre:sm:sp-mb-[25]">
          Contact
        </h2>

        <div className="pre:w-[calc(256/460*100%)] pre:mb-2.5 pre:sm:sp-w-[212] pre:sm:sp-mb-[35] pre:sm:mr-0 pre:sm:ml-auto">
          <Image
            src="/illust/contact.png"
            alt=""
            width={256}
            height={222}
            className="pre:w-[220px] slide-in pre:sm:sp-w-[212]"
          />
        </div>

        <p className="pre:text-[clamp(12px,1.666666vw,24px)] pre:leading-[130%] pre:font-gt pre:font-light pre:sm:sp-fs-[24] pre:whitespace-nowrap">
          <span className="pre:inline-block slide-in">
            <span className="pre:hidden pre:sm:block">
              Transforming Your Content Like
            </span>
            <span className="pre:sm:hidden">
              Transforming Your Content Like Ketchup 
            </span>
          </span><br/>
          <span className="pre:inline-block slide-in">
            <span className="pre:hidden pre:sm:block">
              Ketchup Transforms a Meal,
            </span>
            <span className="pre:sm:hidden">
              Transforms a Meal, The Perfect Condiment
            </span>
          </span><br/>
          <span className="pre:inline-block slide-in">
            <span className="pre:hidden pre:sm:block">
              The Perfect Condiment
            </span>
            <span className="pre:sm:hidden">
              for Your Business
            </span>
          </span><br className="pre:hidden pre:sm:block"/>
          <span className="slide-in pre:hidden pre:sm:inline-block">
              for Your Business
          </span>
        </p>
      </div>

      <div className="slide-in">
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
            <p className="pre:mt-[10px] pre:text-[#f55] pre:text-[12px]">{errors.submit}</p>
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
      </div>
    </section>
  );
}
