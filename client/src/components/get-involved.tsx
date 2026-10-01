export function GetInvolved() {
  return (
    <section
      id="get-involved"
      aria-labelledby="get-involved-title"
      className="scroll-mt-24 border-y border-border bg-card px-5 py-16 text-center md:py-20"
      data-testid="section-get-involved"
    >
      <div className="mx-auto max-w-2xl">
        <h2
          id="get-involved-title"
          className="font-editorial text-4xl font-light tracking-tight md:text-5xl"
        >
          Get involved
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          If you care about the town and want to be involved, please reach out.
          We’d love to hear your ideas and help you find a way to contribute
          to our community.
        </p>
        <a
          href="mailto:hello@chappaquadaily.com?subject=Get%20involved%20with%20Chappaqua%20Pulse"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#ed7e32] px-10 py-3 text-sm font-medium text-black transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-card"
          data-testid="link-get-involved-contact"
        >
          Reach out
        </a>
        <p className="mt-4 text-xs text-muted-foreground">
          Email us at hello@chappaquadaily.com
        </p>
      </div>
    </section>
  );
}