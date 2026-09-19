"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Send, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_CHARS = 500;

type SendState = "idle" | "sending" | "sent";

export function AnonymousComposer({ username, displayName }: { username: string; displayName: string }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<SendState>("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  // Object URLs are released when the preview changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  function handleFile(file?: File) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("That file type is not supported. Use JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is over 5MB. Pick a smaller one.");
      return;
    }
    setError(null);
    if (preview) URL.revokeObjectURL(preview.url);
    setFile(file);
    setPreview({ url: URL.createObjectURL(file), name: file.name });
  }

  function removeImage() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function send() {
    if (!message.trim() && !file) return;
    setState("sending");
    setError(null);
    try {
      const form = new FormData();
      form.set("username", username);
      form.set("body", message.trim());
      if (file) form.set("image", file);

      const res = await fetch("/api/anonymous/send", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send that message.");
      setState("sent");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function reset() {
    removeImage();
    setMessage("");
    setState("idle");
  }

  if (state === "sent") {
    return (
      <div className="rounded-panel border border-hairline bg-surface p-6 text-center shadow-control">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-success/10 text-success">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-3 text-title font-semibold text-ink">Message sent</p>
        <p className="mx-auto mt-1 max-w-[34ch] text-label text-muted">
          {displayName} will see it in their inbox without your name attached.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="secondary" onClick={reset}>
            Send another
          </Button>
          <Button onClick={() => window.location.assign("/signup")}>
            Get my own link
          </Button>
        </div>
      </div>
    );
  }

  const remaining = MAX_CHARS - message.length;

  return (
    <div className="rounded-panel border border-hairline bg-surface p-4 shadow-control sm:p-5">
      <label className="field-label" htmlFor="anon-message">
        Your message
      </label>
      <textarea
        id="anon-message"
        rows={4}
        value={message}
        maxLength={MAX_CHARS}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={`Say something to ${displayName}…`}
        className="field-input resize-y"
      />
      <p className="mt-1.5 text-meta text-muted">{remaining} characters left</p>

      {preview ? (
        <figure className="mt-4">
          <div className="relative overflow-hidden rounded-control border border-hairline bg-canvas">
            {/* A local object URL, so next/image optimisation is not involved. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.url}
              alt="Image you attached to this message"
              className="max-h-72 w-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove attached image"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/70
                text-white transition-colors hover:bg-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <figcaption className="mt-2 flex items-center justify-between gap-3 text-meta text-muted">
            <span className="truncate">{preview.name}</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 font-medium text-brand hover:text-brand-700"
            >
              Replace image
            </button>
          </figcaption>
        </figure>
      ) : (
        <div className="mt-4">
          <Button variant="secondary" onClick={() => fileRef.current?.click()} className="w-full sm:w-auto">
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Attach an image
          </Button>
          <p className="mt-2 text-meta text-muted">Add one image · JPG, PNG or WebP</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {error ? (
        <p role="alert" className="mt-3 text-label text-[#B42318]">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-hairline pt-4">
        <p className="flex items-start gap-2 text-meta text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          Your identity is hidden from the recipient.
        </p>
        <Button onClick={send} disabled={state === "sending" || (!message.trim() && !preview)}>
          {state === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
