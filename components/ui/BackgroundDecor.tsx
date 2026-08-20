export default function BackgroundDecor() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Subtle Ambient Monochrome Gradient Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,0,0,0.02),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.04),transparent)]" />

      {/* 2. Soft Ambient Neutral Aura Orbs */}
      <div className="absolute -top-32 -left-32 w-72 sm:w-[450px] h-72 sm:h-[450px] rounded-full bg-zinc-200/40 dark:bg-zinc-800/20 blur-[90px] sm:blur-[130px] animate-pulse-slow" />
      <div className="absolute top-1/3 -right-28 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full bg-zinc-300/30 dark:bg-zinc-800/15 blur-[100px] sm:blur-[140px] animate-pulse-slow delay-1000" />
      <div className="absolute bottom-10 left-1/4 w-72 sm:w-[450px] h-72 sm:h-[450px] rounded-full bg-zinc-200/40 dark:bg-zinc-800/20 blur-[90px] sm:blur-[130px] animate-pulse-slow delay-2000" />

      {/* 3. Minimalist Coordinate Dot Matrix Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* 4. Floating Academic Mathematical Formulations */}
      <div className="absolute inset-0 overflow-hidden font-mono">
        {/* Top Left */}
        <div className="absolute top-16 left-[5%] sm:left-[8%] text-zinc-400/20 dark:text-zinc-500/20 text-lg sm:text-2xl font-medium animate-float-slow">
          ∫ f(x) dx
        </div>
        <div className="absolute top-44 left-[18%] text-zinc-400/20 dark:text-zinc-500/20 text-sm sm:text-lg font-semibold animate-float-reverse hidden xs:block">
          π ≈ 3.14159
        </div>
        <div className="absolute top-28 left-[32%] text-zinc-400/20 dark:text-zinc-500/20 text-base sm:text-xl animate-float-slow delay-1000 hidden sm:block">
          ∑ i=1..n
        </div>

        {/* Top Right */}
        <div className="absolute top-20 right-[6%] sm:right-[12%] text-zinc-400/20 dark:text-zinc-500/20 text-base sm:text-xl font-medium animate-float-reverse delay-500">
          Δ = b² - 4ac
        </div>
        <div className="absolute top-48 right-[22%] text-zinc-400/20 dark:text-zinc-500/20 text-sm sm:text-lg animate-float-slow delay-1500 hidden sm:block">
          a² + b² = c²
        </div>
        <div className="absolute top-32 right-[6%] text-zinc-400/20 dark:text-zinc-500/20 text-xl sm:text-2xl animate-float-reverse hidden xs:block">
          ∞
        </div>

        {/* Middle */}
        <div className="absolute top-1/2 left-[5%] text-zinc-400/15 dark:text-zinc-500/15 text-sm sm:text-xl animate-float-slow delay-2000 hidden md:block">
          sin²θ + cos²θ = 1
        </div>
        <div className="absolute top-1/2 right-[6%] text-zinc-400/15 dark:text-zinc-500/15 text-sm sm:text-xl animate-float-reverse delay-1000 hidden md:block">
          e^(iπ) + 1 = 0
        </div>
        <div className="absolute top-[42%] left-[24%] text-zinc-400/15 dark:text-zinc-500/15 text-2xl sm:text-3xl animate-float-slow hidden lg:block">
          √x
        </div>
        <div className="absolute top-[45%] right-[20%] text-zinc-400/15 dark:text-zinc-500/15 text-xl sm:text-2xl animate-float-reverse delay-700 hidden lg:block">
          lim(x→0)
        </div>

        {/* Bottom */}
        <div className="absolute bottom-28 left-[6%] sm:left-[10%] text-zinc-400/20 dark:text-zinc-500/20 text-sm sm:text-xl font-medium animate-float-reverse delay-1500 hidden xs:block">
          f&apos;(x) = dy/dx
        </div>
        <div className="absolute bottom-16 left-[28%] text-zinc-400/20 dark:text-zinc-500/20 text-lg sm:text-2xl animate-float-slow delay-500 hidden sm:block">
          θ · λ · Ω
        </div>
        <div className="absolute bottom-24 right-[8%] sm:right-[14%] text-zinc-400/20 dark:text-zinc-500/20 text-sm sm:text-xl font-medium animate-float-slow">
          P(A ∩ B)
        </div>
        <div className="absolute bottom-10 right-[30%] text-zinc-400/15 dark:text-zinc-500/15 text-xs sm:text-lg animate-float-reverse delay-2000 hidden md:block">
          x = (-b ± √Δ) / 2a
        </div>
      </div>
    </div>
  );
}
