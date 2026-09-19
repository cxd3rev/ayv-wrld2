import Image from "next/image";
import { ayvBrand } from "@/config/brands";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  markOnly,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={ayvBrand.icon}
        alt={markOnly ? ayvBrand.name : ""}
        width={32}
        height={32}
        className="h-8 w-8 rounded-md object-contain"
        priority
      />
      {markOnly ? null : (
        <span className="font-mono text-sm uppercase tracking-[0.2em] text-foreground">
          {ayvBrand.name}
        </span>
      )}
    </span>
  );
}
