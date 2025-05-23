"use client";
 
import React, { useCallback, useEffect, useRef } from "react";
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
 
import { NextButton, PrevButton, useCarouselButtons } from "./carousel-button";
import { CarouselIndicator, useCarouselIndicator } from "./carousel-indicator";
 
type EmblaCarouselPropType = {
  className?: string;
  slides: React.ReactNode[];
  options?: EmblaOptionsType;
  maxRotateX?: number;
  maxRotateY?: number;
  maxScale?: number;
  tweenFactorBase?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
};
 
const TWEEN_FACTOR_BASE = 0.7;
const MAX_ROTATE_X = 35;
const MAX_ROTATE_Y = 15;
const MAX_SCALE = 0.9;
 
const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);
 
const EmblaCarousel: React.FC<EmblaCarouselPropType> = (props) => {
  const {
    slides,
    options,
    className,
    autoplay = true,
    autoplayDelay = 2000,
    maxRotateX = MAX_ROTATE_X,
    maxRotateY = MAX_ROTATE_Y,
    maxScale = MAX_SCALE,
    tweenFactorBase = TWEEN_FACTOR_BASE,
    showIndicators = true,
    showArrows = true,
  } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    options,
    autoplay
      ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
      : [],
  );
 
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
 
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = useCarouselButtons(emblaApi);
 
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useCarouselIndicator(emblaApi);
 
  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode: HTMLElement) => {
      return slideNode.querySelector(".embla__slide__number") as HTMLElement;
    });
  }, []);
 
  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = tweenFactorBase * emblaApi.scrollSnapList().length;
  }, []);
 
  const tweenTranslate = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";
 
      emblaApi
        .scrollSnapList()
        .forEach((scrollSnap: number, snapIndex: number) => {
          let diffToTarget = scrollSnap - scrollProgress;
          const slidesInSnap = engine.slideRegistry[snapIndex];
 
          slidesInSnap.forEach((slideIndex: number) => {
            if (isScrollEvent && !slidesInView.includes(slideIndex)) return;
 
            if (engine.options.loop) {
              engine.slideLooper.loopPoints.forEach((loopItem: any) => {
                const target = loopItem.target();
 
                if (slideIndex === loopItem.index && target !== 0) {
                  const sign = Math.sign(target);
 
                  if (sign === -1) {
                    diffToTarget = scrollSnap - (1 + scrollProgress);
                  }
                  if (sign === 1) {
                    diffToTarget = scrollSnap + (1 - scrollProgress);
                  }
                }
              });
            }
 
            const tweenValue = Math.abs(diffToTarget * tweenFactor.current);
            const rotateX = numberWithinRange(
              tweenValue * maxRotateX,
              0,
              maxRotateX,
            );
            const rotateY = numberWithinRange(
              tweenValue * maxRotateY * Math.sign(diffToTarget),
              -maxRotateY,
              maxRotateY,
            );
            const scale = numberWithinRange(1 - tweenValue * 0.1, maxScale, 1);
 
            const tweenNode = tweenNodes.current[slideIndex];
            tweenNode.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
            tweenNode.style.zIndex = Math.round(
              (1 - tweenValue) * 100,
            ).toString();
          });
        });
    },
    [],
  );
 
  useEffect(() => {
    if (!emblaApi) return;
 
    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenTranslate(emblaApi);
 
    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenTranslate)
      .on("scroll", tweenTranslate);
  }, [emblaApi, setTweenFactor, setTweenNodes, tweenTranslate]);
 
  return (
    <div className="">
      <div className="py-10 overflow-visible" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              className="max-[350px]:[flex:0_0_18rem] [flex:0_0_20rem] flex pl-4"
              key={index}
            >
              <div
                className={`embla__slide__number w-full flex items-center justify-center h-full ${
                  className || ""
                }`}
                style={{
                  transition: "transform 0.3s ease-out, z-index 0.3s step-end",
                }}
              >
                <div className="h-full w-full">
                  <div className="group relative z-0 h-full w-full overflow-hidden rounded">
                    <div className="overflow-hidden rounded h-full w-full">
                      {slide}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showArrows && (
        <div className="flex items-center justify-center gap-4 py-10">
          <PrevButton
            className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700 rounded-full"
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
          />
          <NextButton
            className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700 rounded-full"
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
          />
        </div>
      )}
      {showIndicators && (
        <div className="flex items-center justify-center mt-5">
          <div className="flex items-center justify-center gap-3">
            {scrollSnaps.map((_, index) => (
              <CarouselIndicator
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={"bg-transparent relative touch-manipulation inline-flex no-underline cursor-pointer border-0 p-0 m-0 w-[1.5rem] h-5 items-center justify-center rounded-md [-webkit-tap-highlight-color:rgba(255,255,255,0)] [-webkit-appearance:none] after:bg-neutral-200 dark:after:bg-neutral-800 after:w-full after:h-0.5 after:flex after:items-center after:justify-center after:content-['']".concat(
                  index === selectedIndex
                    ? "embla__dot--selected before:absolute before:left-0 before:bg-neutral-800 dark:before:bg-neutral-200 before:h-0.5 before:top-1/2 before:-translate-y-1/2 before:transition-all before:duration-300 before:ease-out before:w-full"
                    : "before:absolute before:left-0 before:bg-neutral-200 dark:before:bg-neutral-800 before:h-0.5 before:top-1/2 before:-translate-y-1/2 before:transition-all before:duration-300 before:ease-out before:w-0",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
 
const CarouselSlidesData = [
  {
    id: 1,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1675432656807-216d786dd468?q=80&w=1980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1669725687221-6fe12c2da6b1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1669725687150-15c603ac6a73?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1pbi1zYW1lLXNlcmllc3w1fHx8ZW58MHx8fHx8",
  },
  {
    id: 4,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1669740462444-ba6e0c316b59?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D",
  },
  {
    id: 5,
    text: "The Sky-Dweller is a compelling timepiece of contemporary design.",
    name: "John Doe",
    role: "CEO, Company Name",
    image:
      "https://plus.unsplash.com/premium_photo-1669725687221-6fe12c2da6b1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];
 
export function EmblaCarousel2() {
  const OPTIONS: EmblaOptionsType = { loop: true };
  const slides = CarouselSlidesData.map((testimonial) => (
    <div
      key={testimonial.id}
      className="w-full h-full flex relative cursor-grab border rounded-xl select-none"
    >
      <div className="w-full h-full z-[1]">
        <div className="w-full h-full p-3.5 flex flex-col md:flex-row gap-x-10 items-start md:items-end justify-end md:justify-between text-content">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-full h-full object-cover absolute top-0 left-0 rounded-xl -z-10"
          />
          <div className="flex flex-col gap-y-2 w-full h-fit backdrop-blur-sm border border-neutral-200/50 rounded-xl p-5 text-white">
            <h2 className="text-base text-balance font-medium leading-6 text-left">
              {testimonial.text}
            </h2>
            <div className="flex flex-col gap-y-0.5">
              <p className="text-balance text-sm font-semibold text-left">
                {testimonial.name}
              </p>
              <p className="text-balance text-xs font-medium text-left">
                {testimonial.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
 
  return (
    <section className="flex flex-col items-center justify-center w-full">
      <div className="max-w-7xl mx-auto overflow-hidden p-5 pt-10 md:py-20 pb-28 flex items-center justify-center w-full">
        <EmblaCarousel
          slides={slides}
          options={OPTIONS}
          autoplay={false}
          showIndicators={true}
          showArrows={false}
          className="w-full min-h-[25rem] h-full"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-1/5 bg-gradient-to-r from-white dark:from-black md:block"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/5 bg-gradient-to-l from-white dark:from-black md:block"></div>
      </div>
    </section>
  );
}