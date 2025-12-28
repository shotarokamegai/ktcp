"use client";

import { useEffect, useMemo, useState } from "react";
import FMLink from "@/components/FMLink";
import Arrow from "@/components/svg/Arrow";
import Image from "next/image";
import SplittingSpan from "@/components/SplittingSpan";

const GETFORM_ENDPOINT =
  process.env.NEXT_PUBLIC_GETFORM_APPLICATION_ENDPOINT ||
  process.env.NEXT_PUBLIC_GETFORM_ENDPOINT ||
  "https://getform.io/f/5e54e38e-f647-4a27-b27a-ea140781df50";

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type RowProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;

  // ▼ Rowごとに差し替え可能
  className?: string; // root
  labelClassName?: string;
  bodyClassName?: string;
  errorClassName?: string;
  dividerClassName?: string;
  withDivider?: boolean;
  errorPlacement?: "below" | "inline";
};

function Row({
  label,
  htmlFor,
  required,
  error,
  children,

  className,
  labelClassName,
  bodyClassName,
  errorClassName,
  dividerClassName, // 未使用でもOK（将来復活用）
  withDivider = true, // 今は無効化（将来復活用）
  errorPlacement = "below",
}: RowProps) {
  return (
    <div
      className={cx(
        "pre:flex pre:flex-col pre:gap-[10px]",
        className
      )}
    >
      <label
        htmlFor={htmlFor}
        className={cx(
          "font-dnp pre:text-[12px] pre:font-light pre:block pre:mt-[-3px] pre:sm:sp-fs-[12]",
          labelClassName
        )}
      >
        {label}
        {required && <span className="pre:ml-[6px] pre:text-[#f55]">※</span>}
      </label>

      <div className={cx("pre:min-w-0", bodyClassName)}>
        {children}

        {error && errorPlacement === "below" && (
          <p className={cx("pre:mt-[6px] pre:text-[#f55] pre:text-[12px]", errorClassName)}>
            {error}
          </p>
        )}

        {/* 区切り線（必要なら復活）
        {withDivider && (
          <div
            className={cx(
              "pre:mt-[10px] pre:border-b pre:border-solid pre:border-[#222]",
              dividerClassName
            )}
          />
        )} */}
      </div>

      {error && errorPlacement === "inline" && (
        <p
          className={cx(
            "pre:mt-[6px] pre:text-[#f55] pre:text-[12px]",
            errorClassName
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================
   Field styles
   input / textarea / select を分離
   ========================= */

const fieldBase =
  "pre:w-full pre:text-[16px] pre:text-[#222] " +
  "pre:outline-none " +
  "pre:placeholder:text-[#adadad] " +
  "pre:focus-visible:outline-none pre:focus-visible:ring-0 " +
  "pre:sm:sp-fs-[16]";

const inputClass = cx(fieldBase, "pre:h-[40px] pre:px-[12px] pre:bg-beige pre:sm:sp-h-[40] pre:sm:sp-px-[12] pre:sm:box-border");
const textareaClass = cx(
  fieldBase,
  "pre:min-h-[244px] pre:sm:sp-min-h-[117] pre:px-[12px] pre:sm:sp-px-[12] pre:py-[10px] pre:sm:sp-py-[10] pre:resize-y pre:bg-beige"
);
const selectClass = cx(fieldBase, "pre:h-[40px] pre:px-[12px] pre:border pre:border-solid pre:border-darkGray pre:sp-h-[40] pre:sm:sp-px-[12]");

const fieldErrorClass =
  "pre:border-[#f55] pre:text-[#f55] pre:placeholder:text-[#f55]";

/* =========================
   Options
   ========================= */

const JOB_OPTIONS = [
  { value: "web_director", label: "Webディレクター" },
  { value: "web_designer", label: "Webデザイナー" },
  { value: "front_end_engineer", label: "フロントエンドエンジニア" },
] as const;

const STATUS_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "employed", label: "在職中" },
  { value: "unemployed", label: "離職中" },
  { value: "freelance", label: "フリーランス" },
  { value: "student", label: "学生" },
  { value: "other", label: "その他" },
] as const;

const PREFS = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

/* =========================
   Component
   ========================= */

export default function ApplicationForm() {
  // job
  const [job, setJob] = useState<(typeof JOB_OPTIONS)[number]["value"] | "">("");
  // /application#front_end_engineer などの hash から応募職種を初期選択
  useEffect(() => {
    const applyFromHash = () => {
      const raw = window.location.hash || "";
      const hash = decodeURIComponent(raw).replace(/^#/, "").trim(); // "front_end_engineer"

      if (!hash) return;

      const exists = JOB_OPTIONS.some((o) => o.value === hash);
      if (exists) setJob(hash as any);
    };

    applyFromHash(); // 初回
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  // basic
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");
  const [birthday, setBirthday] = useState(""); // yyyy-mm-dd
  const [gender, setGender] = useState<"" | "male" | "female" | "other">("");

  // address
  const [postal, setPostal] = useState("");
  const [pref, setPref] = useState("");
  const [address1, setAddress1] = useState(""); // 市区町村・番地
  const [address2, setAddress2] = useState(""); // 建物名・部屋番号

  // contact
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");

  // status / pr
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("");
  const [pr, setPr] = useState("");

  // files / url
  const [resume, setResume] = useState<File | null>(null);
  const [workHistory, setWorkHistory] = useState<File | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // privacy
  const [agree, setAgree] = useState(false);

  // ui
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const emailRegex = useMemo(
    () => /^([a-z0-9+_\-]+)(\.[a-z0-9+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,}$/i,
    []
  );
  const telRegex = useMemo(
    () => /^\(?\d{2,5}\)?[-.\s]?\d{1,4}[-.\s]?\d{3,4}$/,
    []
  );

  const validate = () => {
    const e: Record<string, string> = {};

    if (!job) e.job = "選択してください";
    if (!name.trim()) e.name = "入力してください";
    if (!furigana.trim()) e.furigana = "入力してください";
    if (!birthday) e.birthday = "選択してください";
    if (!gender) e.gender = "選択してください";

    if (!postal.trim()) e.postal = "入力してください";
    else if (!/^\d{3}-?\d{4}$/.test(postal)) e.postal = "郵便番号をご確認ください";

    if (!pref) e.pref = "選択してください";
    if (!address1.trim()) e.address1 = "入力してください";
    if (!address2.trim()) e.address2 = "入力してください";

    if (!tel.trim()) e.tel = "入力してください";
    else if (!telRegex.test(tel)) e.tel = "電話番号をご確認ください";

    if (!email.trim()) e.email = "入力してください";
    else if (!emailRegex.test(email)) e.email = "メールアドレスをご確認ください";

    if (!email2.trim()) e.email2 = "入力してください";
    else if (email !== email2) e.email2 = "メールアドレスが一致しません";

    if (!status) e.status = "選択してください";
    if (!pr.trim()) e.pr = "入力してください";

    if (!resume) e.resume = "ファイルを選択してください";
    if (!workHistory) e.workHistory = "ファイルを選択してください";

    if (portfolioUrl.trim()) {
      try {
        // eslint-disable-next-line no-new
        new URL(portfolioUrl);
      } catch {
        e.portfolioUrl = "URLをご確認ください";
      }
    }

    if (!agree) e.agree = "同意が必要です";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      setSending(true);

      const fd = new FormData();

      fd.append("job", job);

      fd.append("name", name);
      fd.append("furigana", furigana);
      fd.append("birthday", birthday);
      fd.append("gender", gender);

      fd.append("postal", postal);
      fd.append("pref", pref);
      fd.append("address1", address1);
      fd.append("address2", address2);

      fd.append("tel", tel);
      fd.append("email", email);
      fd.append("email_confirm", email2);

      fd.append("status", status);
      fd.append("pr", pr);

      if (resume) fd.append("resume", resume);
      if (workHistory) fd.append("work_history", workHistory);
      if (portfolioFile) fd.append("portfolio_file", portfolioFile);
      fd.append("portfolio_url", portfolioUrl);

      fd.append("agree_privacy", agree ? "yes" : "no");
      fd.append("_gotcha", "");

      await fetch(GETFORM_ENDPOINT, {
        method: "POST",
        body: fd,
        mode: "no-cors",
      });

      setSent(true);

      // reset
      setJob("");
      setName("");
      setFurigana("");
      setBirthday("");
      setGender("");
      setPostal("");
      setPref("");
      setAddress1("");
      setAddress2("");
      setTel("");
      setEmail("");
      setEmail2("");
      setStatus("");
      setPr("");
      setResume(null);
      setWorkHistory(null);
      setPortfolioFile(null);
      setPortfolioUrl("");
      setAgree(false);
      setErrors({});
    } catch {
      setErrors({ submit: "送信に失敗しました。時間をおいて再度お試しください。" });
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="pre:mt-5 pre:sm:sp-mt-[30] pre:sm:flex pre:sm:flex-col">
        <Image src="/illust/engineer.png" alt="" width={323} height={177} className="pre:w-[323px] pre:mx-auto slide-in pre:sm:sp-w-[235] pre:sm:order-2" />
        <h2 className="pre:mb-14 pre:sm:sp-mb-[25] pre:text-[24px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[24] pre:text-center pre:sm:order-1">
          Application Sent
        </h2>
        <h3 className="pre:text-[16px] pre:sm:sp-fs-[16] pre:font-bold pre:mb-5 pre:sm:sp-mb-[20] pre:text-center pre:sm:order-3">
          応募受付完了
        </h3>
        <p className="pre:text-center pre:text-[16px] pre:leading-[180%] pre:sm:sp-fs-[16] pre:sm:text-left pre:sm:order-4">
          このたびはご応募いただき、誠にありがとうございます。
          <br />
          入力内容を確認し、選考に進む場合は担当者よりご連絡いたします。
        </p>

        <FMLink
          href="/"
          className="btn-submit pre:mt-[50px] pre:sm:sp-mt-[35] pre:mx-auto splitting-hover icon-hover pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white pre:sm:order-5"
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
    <div className="pre:mt-[70px] pre:sm:sp-mt-[25] pre:sm:flex pre:sm:flex-col">
      <Image src="/illust/engineer.png" alt="" width={323} height={177} className="pre:w-[323px] pre:mx-auto slide-in pre:sm:sp-w-[235] pre:sm:order-2" />
      <h2 className="pre:mb-14 pre:text-[24px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[24] pre:text-center pre:sm:order-1 pre:sm:text-left pre:sm:sp-mb-[60]">
        Application Form
      </h2>
      <form onSubmit={handleSubmit} noValidate className="slide-in pre:sm:order-3 pre:sm:sp-mt-[60]">
        {/* 応募職種 */}
        <Row
          label="応募職種"
          htmlFor="job"
          required
          error={errors.job}
          className="pre:flex pre:items-center pre:pb-10 pre:mb-10 pre:border-b pre:border-solid pre:border-lightGray pre:flex-row pre:sm:sp-mb-[30] pre:sm:sp-pb-[30] pre:sm:block"
          labelClassName="pre:mr-[60px] pre:sm:mr-0 pre:sm:pb-0 pre:sm:sp-mb-[15]"
          withDivider={false}
        >
          <div className="pre:flex pre:flex-wrap pre:gap-[15px] pre:sm:sp-gap-[5]">
            {JOB_OPTIONS.map((opt) => {
              const active = job === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setJob(opt.value)}
                  className={cx(
                    "pre:rounded-[999px] pre:px-5 pre:h-10 pre:border pre:border-solid pre:border-lightGray pre:sm:sp-h-[41] pre:sm:sp-px-[20]",
                    "pre:text-[12px] pre:font-light pre:font-dnp pre:cursor-pointer pre:sm:sp-fs-[14]",
                    active ? "pre:bg-black pre:text-white" : "pre:bg-transparent"
                  )}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Row>

        {/* 2カラム */}
        <div className="pre:grid pre:grid-cols-1 pre:gap-x-[28px] pre:gap-y-[35px] pre:md:grid-cols-2">
          <Row label="名前" htmlFor="name" required error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田 ケチャップ"
              className={cx(inputClass, errors.name && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="ふりがな" htmlFor="furigana" required error={errors.furigana}>
            <input
              id="furigana"
              name="furigana"
              type="text"
              value={furigana}
              onChange={(e) => setFurigana(e.target.value)}
              placeholder="やまだ けちゃっぷ"
              className={cx(inputClass, errors.furigana && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="生年月日" htmlFor="birthday" required error={errors.birthday}>
            <input
              id="birthday"
              name="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className={cx(inputClass, ' pre:border pre:border-solid pre:border-darkGray pre:sm:appearance-none ', errors.birthday && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="性別" htmlFor="gender" required error={errors.gender}>
            <select
              id="gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className={cx(selectClass, errors.gender && fieldErrorClass)}
              required
            >
              <option value="" className="pre:text-[#adadad]">
                選択してください
              </option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </Row>

          <Row label="郵便番号" htmlFor="postal" required error={errors.postal}>
            <input
              id="postal"
              name="postal"
              type="text"
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              placeholder="000-0000"
              className={cx(inputClass, errors.postal && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="都道府県" htmlFor="pref" required error={errors.pref}>
            <select
              id="pref"
              name="pref"
              value={pref}
              onChange={(e) => setPref(e.target.value)}
              className={cx(selectClass, errors.pref && fieldErrorClass)}
              required
            >
              <option value="" className="pre:text-[#adadad]">
                選択してください
              </option>
              {PREFS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Row>

          <Row label="市区町村・番地" htmlFor="address1" required error={errors.address1}>
            <input
              id="address1"
              name="address1"
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="渋谷区..."
              className={cx(inputClass, errors.address1 && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="建物名・部屋番号" htmlFor="address2" required error={errors.address2}>
            <input
              id="address2"
              name="address2"
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="◯◯ビル 101"
              className={cx(inputClass, errors.address2 && fieldErrorClass)}
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
              placeholder="00-0000-0000"
              className={cx(inputClass, errors.tel && fieldErrorClass)}
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
              placeholder="ketchup@ktcp.jp"
              className={cx(inputClass, errors.email && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="メールアドレス（確認）" htmlFor="email2" required error={errors.email2}>
            <input
              id="email2"
              name="email2"
              type="email"
              value={email2}
              onChange={(e) => setEmail2(e.target.value)}
              placeholder="ketchup@ktcp.jp"
              className={cx(inputClass, errors.email2 && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="現在の就業状況" htmlFor="status" required error={errors.status}>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={cx(selectClass, errors.status && fieldErrorClass)}
              required
            >
              {STATUS_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className={!opt.value ? "pre:text-[#adadad]" : undefined}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </Row>
        </div>

        {/* textarea */}
        <Row
          label="自己PR / 志望動機 / 自由記述欄"
          htmlFor="pr"
          required
          error={errors.pr}
          className="pre:mt-[35px]"
        >
          <textarea
            id="pr"
            name="pr"
            rows={7}
            value={pr}
            onChange={(e) => setPr(e.target.value)}
            placeholder="自己PRをご記入ください"
            className={cx(textareaClass, errors.pr && fieldErrorClass)}
            required
          />
        </Row>

        {/* 添付 */}
        <div className="pre:grid pre:grid-cols-1 pre:gap-x-[28px] pre:gap-y-[35px] pre:md:grid-cols-2 pre:mt-[35px]">
          <Row label="履歴書" htmlFor="resume" required error={errors.resume}>
            <input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] ?? null)}
              className={cx(inputClass, "pre:py-[7px] pre:bg-transparent pre:border pre:border-solid pre:border-lightGray", errors.resume && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="職務経歴書" htmlFor="workHistory" required error={errors.workHistory}>
            <input
              id="workHistory"
              name="workHistory"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setWorkHistory(e.target.files?.[0] ?? null)}
              className={cx(inputClass, "pre:py-[7px] pre:bg-transparent pre:border pre:border-solid pre:border-lightGray", errors.workHistory && fieldErrorClass)}
              required
            />
          </Row>

          <Row label="ポートフォリオ" htmlFor="portfolioFile" error={errors.portfolioFile}>
            <input
              id="portfolioFile"
              name="portfolioFile"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.zip"
              onChange={(e) => setPortfolioFile(e.target.files?.[0] ?? null)}
              className={cx(inputClass, "pre:py-[7px] pre:bg-transparent pre:border pre:border-solid pre:border-lightGray")}
            />
          </Row>

          <Row label="URL" htmlFor="portfolioUrl" error={errors.portfolioUrl}>
            <input
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="ポートフォリオサイトURLなど"
              className={cx(inputClass, errors.portfolioUrl && fieldErrorClass)}
            />
          </Row>
        </div>

        {/* privacy */}
        <div className="pre:mt-[100px] pre:mb-[24px]">
          {errors.agree && (
            <p className="pre:mb-[8px] pre:text-[#f55] pre:text-[12px]">{errors.agree}</p>
          )}

          <p className="pre:text-[12px] pre:text-center pre:mb-[15px] pre:sm:sp-text-[12] pre:sm:sp-mb-[15]">プライバシーポリシー同意チェック</p>

          <label className="pre:flex pre:items-center pre:justify-center pre:gap-[10px] pre:sm:sp-gap-[20] pre:cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="pre:cursor-pointer form-checkbox"
            />
            <span className="pre:text-[16px] pre:font-bold pre:text-[#222] pre:sm:sp-fs-[16]">
              プライバシーポリシーに同意します
            </span>
          </label>
        </div>

        {errors.submit && (
          <p className="pre:mt-[10px] pre:text-[#f55] pre:text-[12px]">{errors.submit}</p>
        )}

        <input type="text" name="_gotcha" className="pre:hidden" tabIndex={-1} />

        {/* submit */}
        <div className="pre:mt-[100px] pre:sm:sp-mt-[100]">
          <button
            type="submit"
            disabled={sending}
            className={cx(
              "btn-submit splitting-hover icon-hover pre:mx-auto",
              "pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white",
              sending && "pre:opacity-50 pre:pointer-events-none"
            )}
          >
            <span className="splitting-hover__inner">
              <SplittingSpan text={sending ? "SENDING..." : "APPLY NOW"} />
              <SplittingSpan text={sending ? "SENDING..." : "APPLY NOW"} />
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
          </button>
        </div>
      </form>
    </div>
  );
}
