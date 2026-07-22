import Image from "next/image";
import logo from "../../../../public/brand/logo-clauwi.png";

/**
 * Homepage hero — a full-bleed photo block sitting directly under the solid
 * salmon header. A wide, semi-opaque white box is flush to the top-left with
 * left-aligned "CLAUWI® / SZKOŁA NOSZENIA" and the logo centered below.
 */
export function Hero() {
  return (
    <section
      className="relative min-h-[560px] bg-cover bg-center"
      style={{ backgroundImage: "url('/media/hero.jpg')" }}
      aria-label="CLAUWI® — Szkoła noszenia"
    >
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="w-full max-w-[540px] bg-white/85 px-12 pb-12 pt-10">
          <h1 className="font-heading text-6xl font-semibold text-ink md:text-7xl">CLAUWI®</h1>
          <p className="mt-2 font-heading text-2xl uppercase tracking-[0.35em] text-ink/80">
            Szkoła noszenia
          </p>
          <Image
            src={logo}
            alt="Logo ClauWi®"
            priority
            sizes="150px"
            className="mx-auto mt-8 h-36 w-auto"
          />
        </div>
      </div>
    </section>
  );
}
