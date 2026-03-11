"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="bg-white shadow-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 z-50">
            <Link href="/">
              <h1 className="text-3xl text-brand-red smartdiniFont">Smartdini</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/#home"
              className="text-foreground hover:text-primary transition-colors font-medium "
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="text-foreground hover:text-primary transition-colors font-medium "
            >
              Features
            </Link>
            <Link
              href="/company"
              className="text-foreground hover:text-primary transition-colors font-medium "
            >
              Company
            </Link>
            <Link
              href="/#pricing"
              className="text-foreground hover:text-primary transition-colors font-medium "
            >
              Pricing
            </Link>
            <Link
              href="/#contact"
              className="text-foreground hover:text-primary transition-colors font-medium "
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex space-x-4">
            <Link href="/#contact">
              <Button className="bg-primary text-white hover:bg-primary/90 ">
                Demo
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-foreground"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden fixed inset-0 bg-white z-40 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] mt-16 px-4 space-y-6">
            <Link
              href="/#home"
              className="text-2xl text-foreground hover:text-primary font-medium transition-colors py-3 "
              onClick={handleNavClick}
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="text-2xl text-foreground hover:text-primary font-medium transition-colors py-3 "
              onClick={handleNavClick}
            >
              Features
            </Link>
            <Link
              href="/company"
              className="text-2xl text-foreground hover:text-primary font-medium transition-colors py-3 "
              onClick={handleNavClick}
            >
              Company
            </Link>
            <Link
              href="/#pricing"
              className="text-2xl text-foreground hover:text-primary font-medium transition-colors py-3 "
              onClick={handleNavClick}
            >
              Pricing
            </Link>
            <Link
              href="/#contact"
              className="text-2xl text-foreground hover:text-primary font-medium transition-colors py-3 "
              onClick={handleNavClick}
            >
              Contact
            </Link>
            <div className="pt-4 w-full max-w-xs">
              <Link href="/#contact" onClick={handleNavClick}>
                <Button className="w-full bg-primary text-white hover:bg-primary/90 text-lg py-4 ">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;