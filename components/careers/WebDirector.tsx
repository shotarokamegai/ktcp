import CareersAccordion from "@/components/CareersAccordion";

export default function WebDirector() {
  return (
    <CareersAccordion
      id="web-director"
      title="Web Director"
      illustSrc="/illust/web-director.png"
      illustClassName="pre:block pre:w-[302px] pre:h-auto pre:sm:sp-w-[149]"
      sections={[
        {
          kind: "text",
          en: "Intro",
          ja: "イントロ",
          text:
            "ディレクターは、クライアントと制作チームをつなぎ、プロジェクトの進行を支える中心的なポジションです。スケジュール管理や情報整理、画面構成案の作成など、制作の土台となる業務から担当していただきます。コミュニケーション力と、真摯にものづくりに取り組む姿勢を重視しています。情報を整理し、本質を見極め、最適な形へ導く。そのプロセス自体が、ものづくりの一部だと考えています。まずは進行管理や構成案づくりからはじまり、やがて企画・コンセプトの段階にも関わりながら、魅せ方を一緒に創り、問題を解決していくポジションです。",
        },
        {
          kind: "list",
          en: "Job Desc.",
          ja: "職務内容",
          lead: "Web領域における、企画立案・制作・運用といったプロジェクトの全体統括",
          items: [
            { text: "クライアントの要望のヒアリングや要件定義" },
            { text: "プロジェクトの成功に必要なコンセプト、コンテンツ、サービスの企画・提案" },
            { text: "プロジェクトを円滑に進めるため、各メンバーの作業調整" },
            { text: "全体のスケジュールを作成し、各工程の進捗を管理" },
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
          lead: "歓迎要件",
          items: [
            { text: "Webディレクターとしての実務経験" },
            { text: "Photoshop / Illustrator / Figma などのアプリケーション操作に精通している方" },
            { text: "基本的なHTML / XHTML・CSSレイアウト・PHP・JavaScriptへの知識のある方" },
            { text: "PowerPoint / Excelなどのオフィスツールに精通している方" },
          ],
        },
        {
          kind: "text",
          en: "Salary",
          ja: "給与",
          text: "年給 : 3,000,000円～6,000,000円",
          textNote: "※金額はあくまでも目安であり、ご経験や選考の評価により最終的に決定します。",
        },
        {
          kind: "flow",
          en: "Flow",
          ja: "選考フロー",
          items: [
            {
              no: "01",
              title: "書類選考",
              desc: "応募フォームより書類をお送りください。 書類通過者のみ、面接のご連絡をいたします。",
            },
            { no: "02", title: "一次面接", desc: "希望職種担当社員" },
            { no: "03", title: "二次面接", desc: "役員及びマネージャー職" },
            { no: "04", title: "オファー面談", desc: "" },
          ],
        },
      ]}
      applyLabel="APPLY NOW"
      applyHref="/application#web_director"
    />
  );
}
