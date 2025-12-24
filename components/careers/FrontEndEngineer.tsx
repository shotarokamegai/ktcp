import CareersAccordion from "@/components/CareersAccordion";

export default function FrontEndEngineer() {
  return (
    <CareersAccordion
      id="front-end-enginner"
      title="Front End Engineer"
      illustSrc="/illust/engineer.png"
      sections={[
        {
          kind: "text",
          en: "Intro",
          ja: "イントロ",
          text:
            "（ここにフロントエンドエンジニア用のIntro文を入れる）",
        },
        {
          kind: "list",
          en: "Job Desc.",
          ja: "職務内容",
          lead: "Web領域における、企画立案・制作・運用といったプロジェクトの全体統括",
          items: [
            { text: "クライアントの要望のヒアリングや要件定義" },
            { text: "コンセプト、コンテンツ、サービスの企画・提案" },
            { text: "各メンバーの作業調整" },
            { text: "進捗管理・スケジュール管理" },
            { text: "社内外メンバーとのコラボレーション" },
          ],
        },
        {
          kind: "text",
          en: "Tools",
          ja: "使用するツール",
          text: "Excel, Word, Powerpoint, Slack, ChatGPT, Adobe Illustrator, Figma",
        },
        {
          kind: "list",
          en: "Application<br/>\nConditions",
          ja: "応募条件",
          lead: "必須要件",
          items: [
            { text: "提案資料作成やプレゼンテーション経験" },
            { text: "社内メンバーとの円滑なコミュニケーションスキル" },
          ],
        },
        {
          kind: "list",
          en: "Application<br/>\nConditions",
          ja: "応募条件",
          lead: "歓迎要件",
          items: [
            { text: "Webディレクターとしての実務経験" },
            { text: "Photoshop / Illustrator / Figma 操作に精通" },
            { text: "HTML/CSS/JS/PHP への基礎理解" },
            { text: "PowerPoint / Excel などの操作に精通" },
          ],
        },
        {
          kind: "text",
          en: "Salary",
          ja: "給与",
          text: "年給 : 3,000,000円～6,000,000円",
          textNote:
            "※金額はあくまでも目安であり、ご経験や選考の評価により最終的に決定します。",
        },
        {
          kind: "flow",
          en: "Flow",
          ja: "選考フロー",
          items: [
            {
              no: "01",
              title: "書類選考",
              desc: "応募フォームより書類をお送りください。書類通過者のみ、面接のご連絡をいたします。",
            },
            { no: "02", title: "一次面接", desc: "希望職種担当社員" },
            { no: "03", title: "二次面接", desc: "役員及びマネージャー職" },
            { no: "04", title: "オファー面談", desc: "" },
          ],
        },
      ]}
      applyLabel="APPLY NOW"
      applyHref="/careers/apply"
    />
  );
}
