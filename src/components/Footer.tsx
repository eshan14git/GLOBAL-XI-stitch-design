import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-outline-variant bg-surface-container-lowest mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop w-full max-w-container-max mx-auto gap-4">
        {/* Footer Brand */}
        <div className="flex items-center gap-2 font-title text-title-md text-on-surface font-bold">
          GLOBAL XI
        </div>

        {/* Footer Copyright */}
        <div className="font-body text-body-md text-primary text-center">
          © 2024 Global XI Intelligence. An NLP-driven research initiative.
        </div>

        {/* Footer Links */}
        <div className="flex gap-6 font-mono text-label-sm">
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            Academic Documentation
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            Methodology
          </Link>
        </div>
      </div>
    </footer>
  );
}
