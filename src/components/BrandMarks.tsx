import Image from "next/image";

/**
 * Cobra + Informace logo lockup — sits inline next to the H1, sized to match it.
 * Pass `only` on pages that concern a single venue (e.g. the Cobra-only inquiry page).
 */
export function BrandMarks({ only }: { only?: "cobra" | "informace" }) {
  return (
    <span className="inline-flex items-center gap-2 shrink-0" aria-hidden>
      {only !== "informace" && (
        <Image
          src="/brand/cobra-mark.png"
          alt=""
          width={48}
          height={48}
          className="h-9 w-9 sm:h-12 sm:w-12"
        />
      )}
      {only !== "cobra" && (
        <Image
          src="/brand/informace-mark.png"
          alt=""
          width={48}
          height={48}
          className="h-9 w-9 sm:h-12 sm:w-12"
        />
      )}
    </span>
  );
}
