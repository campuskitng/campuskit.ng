"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { FeaturedSlide } from "@/lib/types";

export function FeaturedHero({ slides }: { slides: FeaturedSlide[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  );

  // Arrow keys work when the slider itself has focus, not globally.
  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    }
  }

  function onTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start === null || end === undefined) return;
    const delta = end - start;
    if (Math.abs(delta) > 48) go(delta < 0 ? index + 1 : index - 1);
  }

  // No autoplay by design: this is a product surface, not an ad carousel.
  const active = slides[index];

  return (
    <section aria-label="Featured on CampusKit" className="shell pt-4 sm:pt-6">
      <div
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`Slide ${index + 1} of ${total}: ${active.title}`}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative h-[420px] w-full overflow-hidden rounded-panel bg-ink sm:h-[440px] lg:h-[500px]"
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            aria-hidden={slideIndex !== index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.imageAlt}
              fill
              priority={slideIndex === 0}
              sizes="(max-width: 768px) 100vw, 1180px"
              className="object-cover"
            />
            {/* Gradient only over the lower band, where the text sits. */}
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink/90 via-ink/55 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-9">
              <p className="eyebrow text-white/75">{slide.tag}</p>
              <h1 className="mt-2 max-w-[22ch] text-display font-semibold text-white lg:text-[2.5rem] lg:leading-[1.1]">
                {slide.title}
              </h1>
              <p className="mt-2 max-w-[44ch] text-body text-white/85">{slide.blurb}</p>

              {slide.meta ? (
                <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-white/70">
                  {slide.meta.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              <Link
                href={slide.href}
                tabIndex={slideIndex === index ? 0 : -1}
                className="group mt-5 inline-flex h-11 items-center gap-2 rounded-control bg-white px-4 text-body
                  font-medium text-ink transition-colors hover:bg-white/90 active:translate-y-px"
              >
                {slide.ctaLabel}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        ))}

        {/* Controls sit top-right on desktop so they never cover the copy. */}
        <div className="absolute right-4 top-4 hidden gap-1.5 sm:flex">
          <SliderButton label="Previous slide" onClick={() => go(index - 1)}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </SliderButton>
          <SliderButton label="Next slide" onClick={() => go(index + 1)}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </SliderButton>
        </div>

        <div className="absolute bottom-5 right-5 flex items-center gap-2 sm:bottom-7 sm:right-7">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => go(slideIndex)}
              aria-label={`Show ${slide.title}`}
              aria-current={slideIndex === index}
              className={`h-1.5 rounded-full transition-all ${
                slideIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SliderButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-ink/35 text-white
        backdrop-blur-sm transition-colors hover:bg-ink/55 active:translate-y-px"
    >
      {children}
    </button>
  );
}
