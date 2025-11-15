// app/page.tsx
import Link from "next/link";
import Footer from "@/components/Footer";
import ResponsiveImage from "@/components/ResponsiveImage";
import { fetchWorks, fetchWorkCategories, pickEyecatchRandom } from "@/lib/wp";

export const revalidate = 60; // /works と同じくISR

export default async function Home() {
  // WPから取得
  const [works, categories] = await Promise.all([fetchWorks(), fetchWorkCategories()]);
  // トップでは最新9件だけ表示（お好みで調整）
  const latest = works.slice(0, 9);

  return (
    <main className="container pre:pt-[580px]">
      {/* ▼ タクソノミー一覧 */}
      <section className="pre:flex pre:justify-end pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px]">
        <Link
          key="all"
          href="/works"
          className="pre:font-gt pre:font-light pre:text-[10px] pre:mr-[25px] pre:last:mr-0 pre:text-black pre:hover:text-black"
        >
          ALL
        </Link>
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/works/category/${cat.slug}`}
            className="pre:font-gt pre:font-light pre:text-[10px] pre:mr-[25px] pre:last:mr-0 pre:text-gray-400 pre:hover:text-black pre:transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </section>

      {/* ▼ 最新Works一覧 */}
<section className="pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto">
  {(() => {
    // 1️⃣ works と illust を混在させた items 配列を作る
    const items: { type: "work" | "illust"; work?: any; key: string }[] = [];

    latest.forEach((w: any, i: number) => {
      // まず work 自体を追加
      items.push({ type: "work", work: w, key: `work-${w.id}` });

      // 3件ごとに1つ illust を差し込む
      if ((i + 1) % 3 === 0) {
        items.push({ type: "illust", key: `illust-${i}` });
      }
    });

    // 2️⃣ 「1列ごとに一回ワイド & 列ごとに位置が交互」のパターンを
    //    毎アクセスごとにちょっとだけランダムにする
    const firstRowBigIndex = Math.random() > 0.5 ? 0 : 1;
    let workIndex = 0; // work だけを数えるインデックス（illustはカウントしない）

    // 3️⃣ items を描画
    return items.map((item) => {
      if (item.type === "illust") {
        // ▼ illust カード（サイズ固定: 1/4）
        return (
          <div
            key={item.key}
            className="pre:w-[calc(1/4*100%)] pre:mb-[20px] pre:px-[calc(7.5/1401*100%)]"
          >
            <ResponsiveImage
              pc={{ url: "/illust.png" }} // public/illust.png 前提
              alt="Ketchup Illustration"
              fallbackRatio="4 / 3"
            />
          </div>
        );
      }

      // ▼ Work カード
      const w = item.work!;
      const picked = pickEyecatchRandom(w, { seed: w.id });
      if (!picked) return null;

      // 「work が何列目の何番目か」を計算（illustは無視）
      const row = Math.floor(workIndex / 3);     // 0,0,0 / 1,1,1 / 2,2,2...
      const indexInRow = workIndex % 3;          // 0,1,2 をループ

      // この row でワイドになる位置
      // 1行目: firstRowBigIndex（0 or 1）をランダムに
      // 2行目: それの反対、3行目: また元に戻る…という交互パターン
      const bigIndexForRow =
        row % 2 === 0 ? firstRowBigIndex : 1 - firstRowBigIndex;

      const isWide = indexInRow === bigIndexForRow;

      // 次の work のためにインクリメント
      workIndex++;

      const widthClass = isWide
        ? "pre:w-[calc(2/4*100%)]" // ワイド：1列に1回だけ
        : "pre:w-[calc(1/4*100%)]"; // それ以外：1/4

      return (
        <Link
          key={item.key}
          href={`/works/${w.slug}`}
          className={`${widthClass} pre:mb-[20px] pre:px-[calc(7.5/1401*100%)] pre:hover:text-ketchup`}
        >
          <ResponsiveImage
            pc={picked.pc}
            sp={picked.sp || undefined}
            alt={w.title.rendered}
            fallbackRatio="4 / 3"
          />

          <header className="pre:flex pre:mt-[10px]">
            <p className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[70px]">
              {w.acf.date}
            </p>

            <h2
              className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[calc(100%-70px-105px)] pre:text-ellipsis pre:overflow-hidden pre:whitespace-nowrap"
              dangerouslySetInnerHTML={{ __html: w.title.rendered }}
            />

            <p className="pre:text-[10px] pre:leading-[130%] pre:font-gt pre:font-light pre:w-[105px] pre:text-right">
              {Array.isArray(w.works_cat) && w.works_cat.length > 0
                ? w.works_cat.map((cat: any) => cat.name).join(" / ")
                : ""}
            </p>
          </header>
        </Link>
      );
    });
  })()}
</section>
<Footer/>
    </main>
  );
}
