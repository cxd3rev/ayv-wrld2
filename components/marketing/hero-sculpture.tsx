import Image from "next/image";
import { ayvBrand } from "@/config/brands";

export function HeroSculpture() {
  return (
    <div className="mx-auto flex h-[320px] w-full max-w-[420px] items-center justify-center sm:h-[460px]">
      <div className="mark-glow flex items-center justify-center">
        <Image
          src={ayvBrand.logo}
          alt={ayvBrand.name}
          width={420}
          height={420}
          className="mark-invert relative z-10 h-64 w-64 object-contain sm:h-80 sm:w-80"
          priority
        />
      </div>
    </div>
  );
}
