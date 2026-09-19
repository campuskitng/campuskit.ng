import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export function PageEnding() {
  return (
    <section aria-labelledby="ending-heading" className="shell pb-16 pt-14 sm:pb-20 sm:pt-16">
      <div className="border-t border-hairline pt-8">
        <h2 id="ending-heading" className="text-title font-semibold text-ink">
          Explore CampusKit
        </h2>
        <p className="mt-1 max-w-[42ch] text-body text-muted">
          Tools, opportunities and things worth checking out.
        </p>
        <ButtonLink href="/tools" variant="secondary" className="group mt-4">
          Explore tools
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </ButtonLink>
      </div>
    </section>
  );
}
