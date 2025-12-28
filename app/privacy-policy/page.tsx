import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { fetchPageBySlug, strip } from "@/lib/wp";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("privacy-policy");
  const title = page ? strip(page.title?.rendered ?? "") : "Privacy Policy";

  return {
    title: `${title} | Ketchup Inc. | 株式会社 Ketchup`,
    description: "プライバシーポリシーページ",
    openGraph: { title: `${title} | Ketchup Inc. | 株式会社 Ketchup` },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await fetchPageBySlug("privacy-policy");

  // WP側に無い時でも落ちないように最低限のフォールバック
  const html =
    page?.content?.rendered ??
    "<p>プライバシーポリシーの内容がまだ用意されていません。</p>";

  return (
    <main className="container pre:pt-[307px] slide-out pre:sm:sp-pt-[110]">
      <section className="pre:w-[calc(100%-40px)] pre:text-center pre:mb-[98px] pre:sm:sp-mb-[100] pre:sm:w-full">
        <h1 className="pre:text-[24px] pre:font-gt pre:font-light slide-in pre:mb-[60px] pre:sm:sp-fs-[24] pre:sm:sp-mb-[90]">
          Privacy Policy
        </h1>

        <div
          className="pre:w-[530px] pre:mx-auto pre:font-normal slide-in pre:[&_p]:pre:leading-[180%] pre:[&_a]:pre:underline pre:sm:sp-w-[339]"
        >
          <p className="pre:font-normal slide-in pre:text-[16] pre:text-center pre:sm:sp-fs-[16] pre:sm:text-left">
              株式会社Ketchup（以下、「当社」といいます。）は、本ウェブサイトを通じてお問い合わせいただいたお客様および求職者の個人情報について、以下のとおりプライバシーポリシーを定めます。<br/><br/>
第1条（個人情報）「個人情報」とは、個人情報保護法における「個人情報」を指し、氏名、生年月日、住所、電話番号、メールアドレス、勤務先、職歴、学歴その他の記述等により特定の個人を識別できる情報をいいます。<br/><br/>
第2条（個人情報の収集方法）当社は、以下の方法で個人情報を取得します。<br/>
・仕事依頼・お問い合わせフォーム<br/>・求人・採用に関する応募フォーム<br/>・メール・電話での問い合わせ<br/>・履歴書・職務経歴書等、応募者より直接提供される情報<br/>
取得項目の例：氏名、性別、年齢、住所、電話番号、メールアドレス、会社名、職種、学歴、職歴など。<br/><br/>
第3条（個人情報の利用目的）<br/>当社が個人情報を収集・利用する目的は以下のとおりです。<br/>
・当社業務の提供・運営のため<br/>・お問い合わせへの回答のため<br/>・仕事依頼・見積もりに必要な連絡のため<br/>・採用・選考活動のため<br/>・採用後の連絡や入社手続きのため<br/>
目的外利用は行いません。目的外利用が必要な場合は、事前に本人の同意を得ます。<br/><br/>
第4条（利用目的の変更）利用目的が変更前と相当の関連性を有すると合理的に認められる場合に限り、目的を変更することがあります。変更後の目的は、当社所定の方法により通知または公表します。<br/><br/>
第5条（個人情報の第三者提供）当社は、以下の場合を除き、利用者の同意なく個人情報を第三者に提供しません。<br/>
・人の生命、身体または財産の保護のために必要な場合<br/>・法令に基づく場合<br/>・国または地方公共団体への協力が必要な場合<br/>・共同利用の場合（事前に通知または容易に知り得る状態にしたもの）<br/>・委託先への提供（利用目的達成に必要な範囲）<br/>・事業承継に伴う提供<br/><br/>
第6条（個人情報の開示）本人の請求があった場合、法令に基づき個人情報を開示します。ただし、以下の場合は開示しないことがあります。<br/>
・本人または第三者の権利・利益を害するおそれがある場合<br/>・業務の適正な実施に著しい支障を及ぼすおそれがある場合<br/>・法令に違反する場合<br/>
個人情報以外のデータ（履歴情報・特性情報など）は原則として開示しません。<br/><br/>
第7条（個人情報の利用停止等）本人から利用停止・消去を求められた場合、<br/>
調査のうえ必要な措置を講じます。対応内容は本人に通知します。<br/><br/>
第8条（プライバシーポリシーの変更）本ポリシーは、特別な定めがある場合を除き、利用者への通知なく変更することができます。変更後は本ウェブサイトに掲載した時点から効力を生じます。<br/><br/>
第9条（お問い合わせ窓口）株式会社Ketchup<br/>住所：〒152-0003 東京都目黒区碑文谷5-15-6<br/>
ダイナシティ碑文谷 416<br/>
Eメール：admin@ktcp.jp
            </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
