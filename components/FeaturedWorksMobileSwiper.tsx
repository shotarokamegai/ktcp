"use client";

import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

type ImageMeta = { url: string; width?: number; height?: number };

export type FeaturedCard = {
  id: number;
  slug: string;
  titleHtml: string;
  catLabel: string;
  pc: ImageMeta;
  sp?: ImageMeta;
  placeholder_color?: string;
};

export default function FeaturedWorksMobileSwiper({
  items,
}: {
  items: FeaturedCard[];
}) {
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
        {items.map((it) => (
          <SwiperSlide key={it.id} className="pre:!w-[160px]">
            <FMLink
              href={`/works/${it.slug}`}
              className={[
                "pre:block",
                "pre:hover:text-ketchup",
                "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
                "pre:hover:[&_.responsive-image]:[clip-path:polygon(10px_10px,calc(100%-10px)_10px,calc(100%-10px)_calc(100%-10px),10px_calc(100%-10px))]",
                "pre:[&_img]:transform-[scale(1)]",
                "pre:hover:[&_img]:transform-[scale(1.05)]",
              ].join(" ")}
            >
              {/* sp画像があれば sp を渡したい場合は、ResponsiveImage 側の Props に sp を追加して使ってね */}
              <ResponsiveImage
                pc={it.pc}
                alt={it.titleHtml}
                placeholder_color={it.placeholder_color}
                fallbackRatio="4 / 3"
              />

              <header className="pre:mt-[6px]">
                <h2
                  className="pre:text-[14px] pre:font-gt pre:font-light pre:leading-[130%] pre:mb-[5px]"
                  dangerouslySetInnerHTML={{ __html: it.titleHtml }}
                />
                <p className="pre:text-[10px] pre:leading-[130%] pre:font-gt pre:font-light">
                  {it.catLabel}
                </p>
              </header>
            </FMLink>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Prev / Next（デザインの右下） */}
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
