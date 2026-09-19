"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ImageIcon, Link2, Lock, Minus, Plus } from "lucide-react";
import type { AnonymousMessage } from "@/lib/types";

const steps = [
  { icon: Link2, text: "You get a link like campuskit.ng/anonymous/robin." },
  { icon: ImageIcon, text: "Anyone with the link can send text and one photo." },
  { icon: Lock, text: "Their name is hidden from you in the inbox." },
];

export function AnonymousShowcase({ messages }: { messages: AnonymousMessage[] }) {
  const [showHow, setShowHow] = useState(false);
  const [featured, ...rest] = messages;

  return (
    <section aria-labelledby="anonymous-heading" className="shell pt-14 sm:pt-16">
      <div className="overflow-hidden rounded-panel bg-[#171334] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
          <div>
            <p className="eyebrow text-violet-accent">New</p>
            <h2
              id="anonymous-heading"
              className="mt-2 text-display font-semibold tracking-tight text-white"
            >
              Try anonymous.
            </h2>
            <p className="mt-3 max-w-[46ch] text-body text-white/70">
              Create your personal CampusKit link and let people send you messages anonymously.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/anonymous/robin"
                className="group inline-flex h-11 items-center gap-2 rounded-control bg-brand px-4 text-body
                  font-medium text-white transition-colors hover:bg-brand-600 active:translate-y-px"
              >
                Create my link
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>

              <button
                type="button"
                onClick={() => setShowHow((open) => !open)}
                aria-expanded={showHow}
                aria-controls="anonymous-how"
                className="inline-flex h-11 items-center gap-2 rounded-control border border-white/20 px-4
                  text-body font-medium text-white/85 transition-colors hover:bg-white/10 active:translate-y-px"
              >
                {showHow ? (
                  <Minus className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
                See how it works
              </button>
            </div>

            <ul
              id="anonymous-how"
              hidden={!showHow}
              className="mt-6 space-y-2.5 border-t border-white/10 pt-5"
            >
              {steps.map((step) => (
                <li key={step.text} className="flex items-start gap-3 text-label text-white/70">
                  <step.icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-accent" aria-hidden="true" />
                  {step.text}
                </li>
              ))}
            </ul>
          </div>

          {/* The visual carries the message: a note with a real photo attached. */}
          <div className="relative mx-auto w-full max-w-[420px] pb-10 lg:pb-14">
            {rest[0] ? (
              <div
                aria-hidden="true"
                className="absolute -right-1 -top-4 w-[88%] rotate-[2.5deg] rounded-card bg-white/10 p-4 backdrop-blur-sm"
              >
                <p className="text-meta font-medium text-white/50">Anonymous</p>
                <p className="mt-1 line-clamp-2 text-label text-white/60">{rest[0].body}</p>
              </div>
            ) : null}

            <figure className="relative rounded-card bg-white p-4 shadow-note">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft text-brand-700">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-label font-semibold text-ink">Anonymous</span>
                </div>
                <span className="text-meta text-muted">{featured.receivedAt}</span>
              </div>

              <blockquote className="mt-3 text-body text-ink">{featured.body}</blockquote>

              {featured.image ? (
                <div className="mt-3 overflow-hidden rounded-control border border-hairline">
                  <Image
                    src={featured.image.src}
                    alt={featured.image.alt}
                    width={800}
                    height={600}
                    sizes="(max-width: 1024px) 90vw, 420px"
                    className="h-44 w-full object-cover sm:h-52"
                  />
                </div>
              ) : null}

              <figcaption className="mt-3 flex items-center gap-1.5 text-meta text-muted">
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                1 photo attached
              </figcaption>
            </figure>

            {rest[1] ? (
              <div className="absolute -bottom-2 left-2 w-[84%] -rotate-[1.5deg] rounded-card bg-white/95 p-4 shadow-lift">
                <p className="text-meta font-medium text-muted">Anonymous</p>
                <p className="mt-1 line-clamp-2 text-label text-ink">{rest[1].body}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
