export function HeroSculpture() {
  return (
    <div className="flex h-[320px] w-full items-center justify-center sm:h-[420px]" aria-hidden="true">
      <div className="hero-cube relative">
        <span className="face-front" />
        <span className="face-back" />
        <span className="face-right" />
        <span className="face-left" />
        <span className="face-top" />
        <span className="face-bottom" />
      </div>
    </div>
  );
}
