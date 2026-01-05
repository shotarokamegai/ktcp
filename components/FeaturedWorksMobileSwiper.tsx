"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import WorksCard from "@/components/WorksCard";

type RatioKey = "1/1" | "3/4" | "4/3";
type Pattern = 1 | 2 | 3;

const RATIOS: readonly RatioKey[] = ["1/1", "3/4", "4/3"] as const;

function ratioToPattern(r: RatioKey): Pattern {
  if (r === "1/1") return 1;
  if (r === "3/4") return 2;
  return 3;
}

function pickRatioKeyForFeatured(workId: number, index: number): RatioKey {
  return RATIOS[(workId + index) % RATIOS.length];
}

export default function FeaturedWorksMobileSwiper({ works }: { works: any[] }) {
  const prevId = "featured-prev";
  const nextId = "featured-next";

  return (
    <div className="pre:sm:block pre:hidden">
      <Swiper
        modules={[Navigation]}
        navigation={{ prevEl: `#${prevId}`, nextEl: `#${nextId}` }}
        slidesPerView="auto"
        spaceBetween={19}
        className="pre:w-full"
      >
        {works.map((w, i) => {
          const ratioKey = pickRatioKeyForFeatured(Number(w?.id ?? 0), i);
          const requiredPattern = ratioToPattern(ratioKey);

          return (
            <SwiperSlide key={w.id} className="pre:!w-[160px]">
              <WorksCard
                work={w}
                isWide={false}
                widthClass="pre:w-full"
                className="pre:!px-0"
                ratioKey={ratioKey}
                requiredPattern={requiredPattern}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="pre:flex pre:justify-end pre:gap-[24px] pre:mt-[22px]">
        <button
          id={prevId}
          type="button"
          className="pre:flex pre:items-center pre:gap-[10px] pre:text-[14px] pre:font-gt pre:font-light"
        >
          <span className="pre:inline-block pre:w-[16px] pre:h-[16px] pre:border-l pre:border-b pre:rotate-45" />
          <span>Prev</span>
        </button>

        <button
          id={nextId}
          type="button"
          className="pre:flex pre:items-center pre:gap-[10px] pre:text-[14px] pre:font-gt pre:font-light"
        >
          <span>Next</span>
          <span className="pre:inline-block pre:w-[16px] pre:h-[16px] pre:border-r pre:border-b pre:-rotate-45" />
        </button>
      </div>
    </div>
  );
}
