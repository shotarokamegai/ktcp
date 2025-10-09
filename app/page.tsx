import Link from "next/link";
import "./../styles/globals.css";

export default function Home() {
  return (
    <main className="container">
      <h1>Ketchup Portfolio</h1>
      <p>Next.js + WordPress ヘッドレス構成のスターターです。</p>
      <p><Link href="/works">→ Works 一覧へ</Link></p>
      <footer>© Ketchup Inc.</footer>
    </main>
  );
}
