import Image from "next/image";
import { ayvBrand } from "@/config/brands";

export function HeroSculpture() {
  return (
    <div className="hero-frame mx-auto flex h-[320px] w-full max-w-[420px] items-center justify-center sm:h-[460px]">
      <Image
        src={ayvBrand.icon}
        alt={ayvBrand.name}
        width={320}
        height={320}
        className="h-56 w-56 object-contain sm:h-72 sm:w-72"
        priority
      />
    </div>
  );
}
