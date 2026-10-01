import Image from "next/image";
import { automationBrand } from "@/config/brands";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={automationBrand.logo}
        alt="AYV Automation"
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
        priority
      />
    </span>
  );
}
