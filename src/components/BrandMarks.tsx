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
          className="h-12 w-12 sm:h-16 sm:w-16"
        />
      )}
      {only !== "cobra" && (
        <Image
          src="/brand/informace-mark.png"
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 sm:h-16 sm:w-16"
        />
      )}
    </span>
  );
}
