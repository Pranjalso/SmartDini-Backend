import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
            {/* Company Info */}
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-3xl smartdiniFont">Smartdini</h3>
              <p className="text-white/80 leading-relaxed max-w-md mx-auto md:mx-0">
                Revolutionizing cafe operations with smart QR ordering technology. 
                Serving over 500 cafes worldwide.
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#home" className="text-white/80 hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-white/80 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-white/80 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-white/80 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/company" className="text-white/80 hover:text-white transition-colors">
                    Company
                  </a>
                </li>
              </ul>
            </div>

            {/* Products */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Products</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    QR Ordering System
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    Admin Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    Analytics Suite
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    Payment Integration
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    AI Recommendations
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="h-5 w-5 mr-3 text-white/60" />
                  <span className="text-white/80">hello@smartdini.com</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="h-5 w-5 mr-3 text-white/60" />
                  <span className="text-white/80">+1 (555) 123-4567</span>
                </div>
              </div>
              
              {/* Newsletter - Fixed width to prevent overflow */}
              <div className="mt-6 max-w-xs mx-auto md:mx-0">
                <h5 className="font-semibold mb-3 text-center md:text-left">Stay Updated</h5>
                <div className="flex w-full">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 min-w-0 px-4 py-2 rounded-l-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                  />
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/90 rounded-r-lg transition-colors">
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/20 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/60 text-sm">
              © 2024 Smartdini All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;