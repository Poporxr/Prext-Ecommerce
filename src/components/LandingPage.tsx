import Image from "next/image";


const LandingPage = () => {
  return (
    <section className="relative w-full h-[100vh] mb-10 font-serif">
      <Image
        fill
        className="absolute w-full"
        src="/images/hero-landing.png"
        alt="Hero Image"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/10" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-2xl px-6">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/70">
          New Collection
        </p>

        <h1 className="text-5xl md:text-6xl font-semibold text-white leading-tight">
          Designed for Modern Living
        </h1>

        <p className="mt-4 text-base md:text-lg text-white/80">
          Thoughtfully crafted pieces that blend comfort, style, and everyday
          elegance.
        </p>

        <div className="mt-8">
          <button className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black hover:bg-white/90 transition">
            Shop Collection
          </button>
        </div>
      </div>
    </section>
  );
}
export default LandingPage;