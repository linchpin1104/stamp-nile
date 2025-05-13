import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/80 py-8 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4">
          <Link href="/about" className="hover:text-accent transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} STAMP. All rights reserved.</p>
        <p className="mt-1">Nurturing families, one step at a time.</p>
      </div>
    </footer>
  );
}
