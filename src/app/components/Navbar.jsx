"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/upload", label: "Upload" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-md text-white z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="group flex items-center gap-3 text-2xl font-bold"
          >
            <div className="relative w-12 h-12">
              <Image
                src="/assets/logo.png"
                alt="Orbitify Logo"
                fill
                style={
                    {transform: 'scale(1.2)'}
                }
                
                className="object-contain"
              />
            </div>
            
            <span className=" text-white font-light">
              Orbitify
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2 rounded-full font-medium transition-all duration-300
                    ${isActive ? "text-white" : "text-gray-300 hover:text-white"}
                  `}
                >
                  <span className={`relative z-10 px-4 py-2 rounded-full inline-block`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <button className="relative px-6 py-2 rounded-full font-semibold text-sm overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white-500 to-white opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white-500 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <a href="./chat"><span className="relative z-10 text-black">Chat with AI</span></a>
          </button>
        </div>
      </div>
    </nav>
  );
}