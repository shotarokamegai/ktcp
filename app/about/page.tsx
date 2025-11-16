import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import { fetchPageBySlug } from "@/lib/wp";
import { strip } from "@/lib/wp";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("about");
  const title = page ? strip(page.title.rendered) : "About";
  return { title, openGraph: { title } };
}

export default async function AboutPage() {
  const page = await fetchPageBySlug("about");
  if (!page) {
    return (
      <main className="container pre:pt-[307px]">
        <section className="pre:flex pre:justify-justify-between pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px] pre:mb-[98px]">
          <div className="pre:w-[calc(517/1400*100%)]">
            <h1 className="pre:text-[24px] pre:font-gt pre:font-light pre:text-ketchup slide-in slide-out">About</h1>
            <Image src="/illust.png" alt="" width={372} height={279} className="pre:w-[calc(372/450*100%)] pre:max-w-[372px] slide-in slide-out" />
            <h2 className="pre:text-[24px] pre:leading-[130%] pre:font-gt pre:font-light">
              <span className="pre:inline-block slide-in slide-out">
                Transforming Your Content Like Ketchup 
              </span><br/>
              <span className="pre:inline-block slide-in slide-out">
                Transforms a Meal, The Perfect Condiment
              </span><br/>
              <span className="pre:inline-block slide-in slide-out">
                for Your Business
              </span>
            </h2>
          </div>
          <div className="pre:w-[calc(1/4*100%)] pre:mr-[calc(15/1400*100%)]">
            <div>
              <p className="pre:text-[15px] pre:leading-[180%] pre:font-shuei">
                <span className="pre:inline-block slide-in slide-out">
                  トマトソースはトマトをベースに作られました。その後トマトソースをいつでも楽しめるようにケチャップが開発され、世界中で味わえるような調味料として普及しました。
                </span>
                <br/><br/>
                <span className="pre:inline-block slide-in slide-out">
                  世の中には素晴らしいアイディア、コンテンツが無数に広がっています。私たちの力で少し味付けをして、さらにより良い形で届けられるように。
                </span><br/><br/>
                <span className="pre:inline-block slide-in slide-out">
                  Ketchupはそんな想いで設立された、クリエイティブカンパニーです。
                </span>
              </p>
            </div>
          </div>
          <div className="pre:w-[calc(1/4*100%)] pre:mt-[2px]">
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-[112px] pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px] pre:[&_div:last-child]:mb-0">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in slide-out">Company Name</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in slide-out">株式会社Ketchup</p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-[112px] pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px] pre:[&_div:last-child]:mb-0">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in slide-out">Year Established</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in slide-out">2022年7月1日</p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-[112px] pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in slide-out">CEO</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in slide-out">亀谷 晶太郎</p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-[112px] pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in slide-out">Office</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in slide-out">〒152-0003 東京都目黒区<br/>
                碑文谷5-15-6 <br/>
                ダイナシティ碑文谷 416
                </p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-[112px] pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in slide-out">Tel</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in slide-out">03-5936-6477</p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-[112px] pre:[&_div:nth-child(2)]:w-[calc(100%-112px)] pre:[&_div]:mb-[30px]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in slide-out">Capital</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in slide-out">1,000,000円
                </p>
              </div>
            </div>
            <div className="pre:flex pre:flex-wrap pre:[&_div:nth-child(1)]:w-[112px] pre:[&_div:nth-child(2)]:w-[calc(100%-112px)]">
              <div>
                <p className="pre:text-[12px] pre:font-gt pre:font-light slide-in slide-out">Field of<br/>
                Activities</p>
              </div>
              <div>
                <p className="pre:text-[12px] pre:font-shuei slide-in slide-out">Web制作（コーポレートサイト・ブランドサイト・EC サイト・オウンドメディア・LP 他） ブランド戦略・デジタルブランディング（コミュニケーション戦略・カスタマーエクスペリエンス・CI/VI開発 他） グラフィック制作（広告・会社案内・入社案内・パンフレット・ポスター 他） WEBシステム・アプリケーション開発（CMS開発・EC開発・フロントエンド開発・アニメーション 他） WEBサイトの保守・運用支援（取材・ライティング・更新支援・デジタルマーケティング）
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
