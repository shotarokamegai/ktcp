import CareersAccordion from "@/components/CareersAccordion";

export default function FrontEndEngineer() {
  return (
    <CareersAccordion
      id="front-end-engineer"
      title="Front End Engineer"
      illustSrc="/illust/engineer.png"
      illustClassName="pre:block pre:w-[387px] pre:h-auto pre:sm:sp-w-[190]"
      sections={[
        {
          kind: "text",
          en: "Introduction",
          ja: "イントロダクション",
          text:
            "フロントエンドエンジニアは、デザインやコンセプトをブラウザ上で体験として成立させるポジションです。ディレクターやデザイナーと連携しながら、画面設計やインタラクションの実装を通して、意図を正確に、そして魅力的に届けていきます。単にコードを書くのではなく、「なぜこの表現なのか」「どうすれば伝わるか」を考えながら、表現と構造の両面から最適な形を探っていくことを大切にしています。まずは実装業務から関わり、徐々に設計や表現の提案にも踏み込みながら、チームと一緒に魅せ方をつくっていくポジションです。",
        },

        {
          kind: "list",
          en: "Job<br/>Description",
          ja: "職務内容",
          lead:
            "Webサイト・Webアプリのフロントエンド実装を中心に、体験の質を担保しながら開発を進めます。",
          items: [
            { text: "デザインをもとにしたUI実装（HTML/CSS/JavaScript/TypeScript）" },
            { text: "アニメーション／インタラクション実装（要件に応じて設計含む）" },
            { text: "コンポーネント設計・保守（再利用性／拡張性の担保）" },
            { text: "表示速度・アクセシビリティ・レスポンシブの改善" },
            { text: "ディレクター／デザイナーとの仕様調整、実装観点での提案" },
          ],
        },

        {
          kind: "text",
          en: "Tools",
          ja: "使用するツール",
          text:
            "Figma, Illustrator, (Project depending on) Next.js / React / WordPress / Shopify",
        },

        {
          kind: "list",
          en: "Application<br/>Conditions",
          ja: "応募条件",
          lead: "必須要件",
          items: [
            { text: "HTML / CSS / JavaScript の基礎理解と実務レベルのコーディング経験" },
            { text: "デザイン意図を読み取り、実装に落とし込めるコミュニケーション力" },
          ],
        },

        {
          kind: "list",
          en: "",
          ja: "",
          lead: "歓迎要件",
          items: [
            { text: "React / Next.js などモダンフレームワークでの開発経験" },
            { text: "アニメーション実装（GSAP / Framer Motion など）の経験" },
            { text: "WordPress（テーマ開発）またはShopify（テーマ開発）の経験" },
            { text: "パフォーマンス改善・アクセシビリティ改善の経験" },
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
              desc:
                "応募フォームより、履歴書・職務経歴書（可能であればポートフォリオ/制作実績）をお送りください。",
            },
            { no: "02", title: "一次面接", desc: "希望職種担当社員" },
            { no: "03", title: "二次面接", desc: "役員及びマネージャー職" },
            { no: "04", title: "オファー面談", desc: "" },
          ],
        },
      ]}
      applyLabel="APPLY NOW"
      applyHref="/application#front_end_engineer"
    />
  );
}
