import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import { fetchPageBySlug } from "@/lib/wp";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About | Ketchup Inc. | 株式会社 Ketchup",
  description: "会社概要ページ",
  openGraph: { title: "About | Ketchup Inc. | 株式会社 Ketchup" },
};

// export async function generateMetadata(): Promise<Metadata> {
//   const page = await fetchPageBySlug("about");
//   const title = page ? strip(page.title.rendered) : "About";
//   return { title, openGraph: { title } };
// }

export default async function AboutPage() {
  const page = await fetchPageBySlug("about");
  if (!page) {
    return (
      <main className="container pre:pt-[307px] slide-out pre:sm:sp-pt-[110]">
        <section className="pre:flex pre:justify-justify-between pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[98px] pre:sm:block pre:sm:sp-w-[375] pre:sm:sp-mb-[110]">
          <div className="pre:w-[calc(517/1400*100%)] pre:sm:w-full pre:sm:sp-mb-[40]">
            <h1 className="pre:text-[24px] pre:font-gt pre:font-light slide-in pre:mb-[180px] pre:sm:sp-fs-[24] pre:sm:sp-mb-[50]">About</h1>
            <Image src="/illust/about.png" alt="" width={372} height={279} className="pre:w-[calc(372/450*100%)] pre:max-w-[372px] slide-in pre:sm:w-full pre:sm:sp-mb-[30]" />
            <h2 className="pre:text-[24px] pre:leading-[130%] pre:font-gt pre:font-light pre:sm:sp-fs-[24]">
              <span className="pre:inline-block slide-in">
                Transforming Your Content Like Ketchup 
              </span><br/>
              <span className="pre:inline-block slide-in">
                Transforms a Meal, The Perfect Condiment
              </span><br/>
              <span className="pre:inline-block slide-in">
                for Your Business
              </span>
            </h2>
          </div>
          <div className="pre:w-[calc(375/1400*100%)] pre:mr-[calc(15/1400*100%)] pre:sm:sp-w-[250] pre:sm:mr-0 pre:sm:ml-auto pre:sm:sp-mb-[110]">
            <div>
              <p className="pre:text-[15px] pre:leading-[180%] pre:font-shuei pre:sm:sp-fs-[14]">
                <span className="pre:inline-block slide-in">
                  トマトソースはトマトをベースに作られました。その後トマトソースをいつでも楽しめるようにケチャップが開発され、世界中で味わえるような調味料として普及しました。
                </span>
                <br/><br/>
                <span className="pre:inline-block slide-in">
                  世の中には素晴らしいアイディア、コンテンツが無数に広がっています。私たちの力で少し味付けをして、さらにより良い形で届けられるように。
                </span><br/><br/>
                <span className="pre:inline-block slide-in">
                  Ketchupはそんな想いで設立された、<br/>クリエイティブカンパニーです。
                </span>
              </p>
            </div>
          </div>
          <div className="pre:w-[calc(375/1400*100%)] pre:mt-0.5 pre:sm:w-full pre:sm:mt-0">
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-28 pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px] pre:[&_div:last-child]:mb-0">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[12] pre:sm:leading-[130%]">Company Name</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in pre:sm:sp-fs-[12] pre:sm:leading-[180%]">株式会社Ketchup</p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-28 pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px] pre:[&_div:last-child]:mb-0">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[12] pre:sm:leading-[130%]">Year Established</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in pre:sm:sp-fs-[12] pre:sm:leading-[180%]">2022年7月1日</p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-28 pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[12] pre:sm:leading-[130%]">CEO</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in pre:sm:sp-fs-[12] pre:sm:leading-[180%]">亀谷 晶太郎</p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-28 pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[12] pre:sm:leading-[130%]">Office</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in pre:sm:sp-fs-[12] pre:sm:leading-[180%]">〒152-0003 東京都目黒区<br/>
                碑文谷5-15-6 <br/>
                ダイナシティ碑文谷 416
                </p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-28 pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[12] pre:sm:leading-[130%]">Tel</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in pre:sm:sp-fs-[12] pre:sm:leading-[180%]">03-5936-6477</p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-28 pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[12] pre:sm:leading-[130%]">Capital</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in pre:sm:sp-fs-[12] pre:sm:leading-[180%]">1,000,000円
                </p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-28 pre:[&_div:nth-child(2)]:w-[calc(100%-112px)]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in pre:sm:sp-fs-[12] pre:sm:leading-[130%]">Field of<br/>
                Activities</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in pre:sm:sp-fs-[12] pre:sm:leading-[180%]">Web制作（コーポレートサイト・ブランドサイト・EC サイト・オウンドメディア・LP 他） ブランド戦略・デジタルブランディング（コミュニケーション戦略・カスタマーエクスペリエンス・CI/VI開発 他） グラフィック制作（広告・会社案内・入社案内・パンフレット・ポスター 他） WEBシステム・アプリケーション開発（CMS開発・EC開発・フロントエンド開発・アニメーション 他） WEBサイトの保守・運用支援（取材・ライティング・更新支援・デジタルマーケティング）
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer/>
      </main>
    );
  }
}
