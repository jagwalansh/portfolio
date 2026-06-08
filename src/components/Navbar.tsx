type NavbarProps = {
  isVisible: boolean
}

function Navbar({ isVisible }: NavbarProps) {
  return (
    <header
      className={`absolute inset-x-0 top-0 z-20 px-4 py-4 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] sm:px-6 lg:px-8 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between border border-[#171411]/10 bg-[#fffaf1]/72 px-4 py-3 shadow-2xl shadow-[#171411]/8 backdrop-blur-2xl sm:px-5">
        <a href="#" className="text-sm font-bold uppercase tracking-tight text-[#171411]">
          JA
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#5e574d] md:flex">
          <a className="transition hover:text-[#171411]" href="#about">
            About
          </a>
          <a className="transition hover:text-[#171411]" href="#work">
            Work
          </a>
          <a className="transition hover:text-[#171411]" href="#services">
            Services
          </a>
          <a className="transition hover:text-[#171411]" href="#contact">
            Contact
          </a>
        </nav>
        <a
          href="mailto:hello@example.com"
          className="rounded-full border border-[#171411]/70 px-4 py-2 text-sm font-semibold transition hover:bg-[#171411] hover:text-[#f6f1e8]"
        >
          Book a call
        </a>
      </div>
    </header>
  )
}

export default Navbar
