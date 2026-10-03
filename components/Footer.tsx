export default function Footer() {
  return (
    <footer className="rule relative overflow-hidden">
      <div
        aria-hidden="true"
        className="glow-violet pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 opacity-60"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="label text-muted">
          © {new Date().getFullYear()} Manea Abdullah Al-Awbathani
        </p>
        <p className="label text-muted">
          Riyadh, Saudi Arabia · UTC+3 ·{" "}
          <span className="text-gradient">Next.js × Motion</span>
        </p>
      </div>
    </footer>
  );
}
