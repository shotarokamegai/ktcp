export default function Accordion() {
  return (
    <div className="accordion" id="">
      <div className="pre:relative pre:h-[54px] accordion-trigger js-pc-accordion pre:group pre:border-b pre:border-black pre:border-solid pre:cursor-pointer" data-target="">
        <h3 className="pre:text-[18px] pr:font-gt pre:font-light">Front End Engineer</h3>
        <div className="pre:h-[22px] pre:w-[22px] pre:absolute pre:right-0 center-y sm:center-y">
          <div className="pre:absolute pre:bg-black pre:h-0.5 pre:w-full center-xy sm:center-xy"></div>
          <div className="pre:absolute pre:bg-black pre:h-full pre:w-0.5 center-xy sm:center-xy"></div>
        </div>
      </div>
      <div className="accordion__inner pre:relative pre:overflow-hidden pre:flex pre:justify-end">
        <div className="accordion__inner-content pre:pt-[60px] pre:w-[calc(693/1440*100%)]">
          <div className="pre:flex pre:pl-5 pre:pb-10 pre:border-b pre:border-lightGray pre:border-solid">
            <div className="pre:w-[142px]">
              <h4 className="pre:text-[20px] pre:font-gt pre:font-light pre:mb-2.5">Intro</h4>
              <h4 className="pre:text-[12px] pre:font-dnp pre:font-light">イントロ</h4>
            </div>
            <div className="pre:w-[calc(100%-142px-15px)]">
              <p className="pre:text-[14px] pre:leading-[180%]">
                ディレクターは、クライアントと制作チームをつなぎ、プロジェクトの進行を支える中心的なポジションです。スケジュール管理や情報整理、画面構成案の作成など、制作の土台となる業務から担当していただきます。コミュニケーション力と、真摯にものづくりに取り組む姿勢を重視しています。情報を整理し、本質を見極め、最適な形へ導く。そのプロセス自体が、ものづくりの一部だと考えています。まずは進行管理や構成案づくりからはじまり、やがて企画・コンセプトの段階にも関わりながら、魅せ方を一緒に創り、問題を解決していくポジションです。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}