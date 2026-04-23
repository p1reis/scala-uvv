export function LoginHero() {
  return (
    <section className="relative hidden min-h-dvh overflow-hidden bg-[#3834ed] lg:block">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:112px_112px]" />

      <div className="absolute -left-40 top-2/3 size-[560px] -translate-y-1/2 rounded-full border-[120px] border-white/[0.03]" />
      <div className="absolute -right-36 top-1/2 size-[640px] -translate-y-1/2 rounded-full border-[120px] border-white/[0.03]" />
      <div className="absolute left-[14%] top-0 h-32 w-[34%] bg-white/[0.025]" />
      <div className="absolute right-[14%] top-0 h-32 w-[34%] bg-white/[0.025]" />
      <div className="absolute bottom-0 left-[14%] h-28 w-[34%] bg-white/[0.025]" />
      <div className="absolute bottom-0 right-[14%] h-28 w-[34%] border border-dashed border-white/[0.08]" />

      <div className="relative z-10 flex min-h-dvh items-start justify-center px-20 pt-[20vh]">
        <h2 className="max-w-[520px] font-mono text-[34px] font-semibold leading-[1.16] text-white sm:text-[38px] xl:text-[42px]">
          Gestão e reservas de salas da sua Universidade
        </h2>
      </div>
    </section>
  );
}
