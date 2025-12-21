import Image from "next/image";
import Arrow from "@/components/svg/Arrow";
import SplittingSpan from "@/components/SplittingSpan"

export default function FrontEndEngineer() {
  return (
        <div className="accordion careers-accordion group" id="front-end-enginner">
          <div className="careers-accordion-title accordion-trigger js-pc-accordion pre:hover:text-ketchup splitting-hover" data-target="front-end-enginner">
            <h3 className="pre:text-[18px] pr:font-gt pre:font-light">
              <span className="splitting-hover__inner">
                <SplittingSpan text="Front End Engineer" />
                <SplittingSpan text="Front End Engineer" />
              </span>
            </h3>
            <div className="careers-accordion-icon">
              <div className="pre:absolute pre:bg-black pre:h-0.5 pre:w-full center-xy sm:center-xy"></div>
              <div className="pre:absolute pre:bg-black pre:h-full pre:w-0.5 center-xy sm:center-xy"></div>
            </div>
          </div>
          <div className="accordion__inner careers-accordion__inner">
            <div className="accordion__inner-content careers-accordion__inner-content">
              <div className="careers-accordion-box">
                <div className="pre:w-[142px]">
                  <h4>Intro</h4>
                  <h5>イントロ</h5>
                </div>
                <div className="pre:w-[calc(100%-142px-15px)]">
                  <p className="pre:text-[14px] pre:leading-[180%]">
                    ディレクターは、クライアントと制作チームをつなぎ、プロジェクトの進行を支える中心的なポジションです。スケジュール管理や情報整理、画面構成案の作成など、制作の土台となる業務から担当していただきます。コミュニケーション力と、真摯にものづくりに取り組む姿勢を重視しています。情報を整理し、本質を見極め、最適な形へ導く。そのプロセス自体が、ものづくりの一部だと考えています。まずは進行管理や構成案づくりからはじまり、やがて企画・コンセプトの段階にも関わりながら、魅せ方を一緒に創り、問題を解決していくポジションです。
                  </p>
                </div>
              </div>
              <div className="careers-accordion-box">
                <div className="pre:w-[142px]">
                  <h4>Job Desc.</h4>
                  <h5>職務内容</h5>
                </div>
                <div className="pre:w-[calc(100%-142px-15px)]">
                  <p className="pre:text-[14px] pre:leading-[180%] pre:mb-10">
                    Web領域における、企画立案・制作・運用といったプロジェクトの全体統括
                  </p>
                  <ul className="pre:[&>li]:text-[12px] pre:[&>li]:pb-3 pre:[&>li]:mb-3 pre:[&>li:last-child]:mb-0 pre:[&>li:last-child]:border-b-0 pre:[&>li]:border-b pre:[&>li]:border-lightGray pre:[&>li]:border-solid">
                    <li>
                      クライアントの要望のヒアリングや要件定義
                    </li>
                    <li>
                      プロジェクトの成功に必要なコンセプト、コンテンツ、サービスの企画・提案
                    </li>
                    <li>
                      プロジェクトを円滑に進めるため、各メンバーの作業調整
                    </li>
                    <li>
                      全体のスケジュールを作成し、各工程の進捗を管理
                    </li>
                    <li>
                      社内外メンバーとのコラボレーション
                    </li>
                  </ul>
                </div>
              </div>
              <div className="careers-accordion-box">
                <div className="pre:w-[142px]">
                  <h4>Tools</h4>
                  <h5>使用するツール</h5>
                </div>
                <div className="pre:w-[calc(100%-142px-15px)]">
                  <p className="pre:text-[14px] pre:leading-[180%] pre:mb-10">
                    Excel, Word, Powerpoint, Slack, ChatGPT, Adobe Illustrator, Figma
                  </p>
                </div>
              </div>
              <div className="careers-accordion-box">
                <div className="pre:w-[142px]">
                  <h4>Application<br/>
                  Conditions</h4>
                  <h5>応募条件</h5>
                </div>
                <div className="pre:w-[calc(100%-142px-15px)]">
                  <p className="pre:text-[14px] pre:leading-[180%] pre:mb-10">
                    必須要件
                  </p>
                  <ul className="pre:[&>li]:text-[12px] pre:[&>li]:pb-3 pre:[&>li]:mb-3 pre:[&>li:last-child]:mb-0 pre:[&>li:last-child]:border-b-0 pre:[&>li]:border-b pre:[&>li]:border-lightGray pre:[&>li]:border-solid">
                    <li>
                      プロジェクトの提案資料作成やプレゼンテーション経験
                    </li>
                    <li>
                      社内チームメンバーとの円滑なコミュニケーションスキル
                    </li>
                  </ul>
                  <p className="pre:text-[14px] pre:leading-[180%] pre:mb-10">
                    歓迎要件
                  </p>
                  <ul className="pre:[&>li]:text-[12px] pre:[&>li]:pb-3 pre:[&>li]:mb-3 pre:[&>li:last-child]:mb-0 pre:[&>li:last-child]:border-b-0 pre:[&>li]:border-b pre:[&>li]:border-lightGray pre:[&>li]:border-solid">
                    <li>
                      Webディレクターとしての実務経験
                    </li>
                    <li>
                      ︎Photoshop / Illustrator/figmaなどのアプリケーション操作に精通している方
                    </li>
                    <li>
                      基本的なHTML / XHTML・CSSレイアウト・PHP・JavaScriptへの知識のある方
                    </li>
                    <li>
                      PowerPoint / Excelなどのオフィスツールに精通している方
                    </li>
                  </ul>
                </div>
              </div>
              <div className="careers-accordion-box">
                <div className="pre:w-[142px]">
                  <h4>Salary</h4>
                  <h5>給与</h5>
                </div>
                <div className="pre:w-[calc(100%-142px-15px)]">
                  <p className="pre:text-[14px] pre:leading-[180%] pre:mb-2.5">
                    年給 : 3,000,000円～6,000,000円
                  </p>
                  <p className="pre:text-[12px]">※金額はあくまでも目安であり、ご経験や選考の評価により最終的に決定します。</p>
                </div>
              </div>
              <div className="careers-accordion-box">
                <div className="pre:w-[142px]">
                  <h4>Flow</h4>
                  <h5>選考フロー</h5>
                </div>
                <div className="pre:w-[calc(100%-142px-15px)]">
                  <ul className="pre:[&>li]:text-[12px] pre:[&>li]:pb-3 pre:[&>li]:mb-3 pre:[&>li:last-child]:mb-0 pre:[&>li:last-child]:border-b-0 pre:[&>li]:border-b pre:[&>li]:border-lightGray pre:[&>li]:border-solid pre:[&>li]:flex pre:[&>li]:items-center">
                    <li>
                      <div className="pre:w-[calc(71/496*100%)]">
                        <p className="pre:text-[20px] pre:font-gt pre:font-light">01</p>
                      </div>
                      <div className="pre:w-[calc(106/496*100%)]">
                        <p className="pre:text-[14px] pre:font-dnp pre:font-light">書類選考</p>
                      </div>
                      <div className="pre:w-[calc(319/496*100%)]">
                        <p className="pre:text-[12px] pre:leading-[180%] pre:font-dnp pre:font-light">応募フォームより書類をお送りください。 書類通過者のみ、面接のご連絡をいたします。</p>
                      </div>
                    </li>
                    <li>
                      <div className="pre:w-[calc(71/496*100%)]">
                        <p className="pre:text-[20px] pre:font-gt pre:font-light">02</p>
                      </div>
                      <div className="pre:w-[calc(106/496*100%)]">
                        <p className="pre:text-[14px] pre:font-dnp pre:font-light">一次面接</p>
                      </div>
                      <div className="pre:w-[calc(319/496*100%)]">
                        <p className="pre:text-[12px] pre:leading-[180%] pre:font-dnp pre:font-light">希望職種担当社員</p>
                      </div>
                    </li>
                    <li>
                      <div className="pre:w-[calc(71/496*100%)]">
                        <p className="pre:text-[20px] pre:font-gt pre:font-light">03</p>
                      </div>
                      <div className="pre:w-[calc(106/496*100%)]">
                        <p className="pre:text-[14px] pre:font-dnp pre:font-light">二次面接</p>
                      </div>
                      <div className="pre:w-[calc(319/496*100%)]">
                        <p className="pre:text-[12px] pre:leading-[180%] pre:font-dnp pre:font-light">役員及びマネージャー職</p>
                      </div>
                    </li>
                    <li>
                      <div className="pre:w-[calc(71/496*100%)]">
                        <p className="pre:text-[20px] pre:font-gt pre:font-light">04</p>
                      </div>
                      <div className="pre:w-[calc(106/496*100%)]">
                        <p className="pre:text-[14px] pre:font-dnp pre:font-light">オファー面談</p>
                      </div>
                      <div className="pre:w-[calc(319/496*100%)]">
                        <p className="pre:text-[12px] pre:leading-[180%] pre:font-dnp pre:font-light"></p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <a className="btn-submit pre:mt-[30px] pre:mx-auto splitting-hover icon-hover pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white">
                <span className="splitting-hover__inner">
                  <SplittingSpan text="APPLY NOW" />
                  <SplittingSpan text="APPLY NOW" />
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
              </a>
            </div>
          </div>
        </div>
  );
}