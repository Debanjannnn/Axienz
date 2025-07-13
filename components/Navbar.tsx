// "use client"
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Menu, X, ChevronDown, User } from "lucide-react";

// export default function Navbar() {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const toggleDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   const navLinks = [
//     { href: "/how-it-works", label: "How It Works" },
//     { href: "/pricing", label: "Pricing" },
//     { href: "/about", label: "About" },
//     { href: "/contact", label: "Contact" },
//   ];

//   return (
//     <header 
//       className={`fixed top-0 w-full z-50 transition-all duration-300 ${
//         scrolled 
//           ? "bg-black/70 backdrop-blur-lg shadow-lg" 
//           : "bg-black/50 backdrop-blur-md"
//       } border-b border-white/10`}
//     >
//       <div className="container mx-auto px-4 h-16 flex items-center justify-between">
//         {/* Logo */}
//         <div className="flex items-center space-x-2">
//           <Link href="/" className="flex items-center space-x-2">
//             <span className="font-semibold text-3xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
//               Inherify
//             </span>
//           </Link>
//         </div>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center space-x-8">
//           {navLinks.map((link) => (
//             <Link
//               key={link.href}
//               href={link.href}
//               className="text-sm text-gray-300 hover:text-white transition-colors"
//             >
//               {link.label}
//             </Link>
//           ))}
//         </nav>

//         {/* Desktop Actions */}
//         <div className="hidden md:flex items-center space-x-4 relative">
//           <div className="relative group">
//             <button
//               className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm transition-colors flex items-center space-x-1"
//               onClick={toggleDropdown}
//             >
//               <span>Create Will</span>
//               <ChevronDown className="w-4 h-4" />
//             </button>
//             {dropdownOpen && (
//               <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
//                 <Link
//                   href="/create-will/simple"
//                   className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                 >
//                   Simple Will
//                 </Link>
//                 <Link
//                   href="/create-will/customized"
//                   className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                 >
//                   Customized Will
//                 </Link>
//               </div>
//             )}
//           </div>
//           <Link href="/check-my-will">
//             <button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-full text-sm transition-colors">
//               Check My Wills
//             </button>
//           </Link>
//           <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
//             <User className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Mobile Menu Button */}
//         <button
//           className="md:hidden p-2 hover:bg-gray-800 rounded-full transition-colors"
//           onClick={toggleMobileMenu}
//         >
//           {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10">
//           <div className="container mx-auto px-4 py-4">
//             <nav className="flex flex-col space-y-4">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className="text-sm text-gray-300 hover:text-white transition-colors py-2"
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//               <hr className="border-white/10" />
//               <Link
//                 href="/create-will/simple"
//                 className="text-sm text-gray-300 hover:text-white transition-colors py-2"
//               >
//                 Create Simple Will
//               </Link>
//               <Link
//                 href="/create-will/customized"
//                 className="text-sm text-gray-300 hover:text-white transition-colors py-2"
//               >
//                 Create Customized Will
//               </Link>
//               <Link
//                 href="/check-my-will"
//                 className="text-sm text-gray-300 hover:text-white transition-colors py-2"
//               >
//                 Check My Will
//               </Link>
//             </nav>
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }
"use client";
import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";
export default function FloatingNavDemo() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "About",
      link: "/about",
      icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: (
        <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />
      ),
    },
    
      
    
  ];
  return (
    <div className="relative  w-full">
      <FloatingNav navItems={navItems} />

    </div>
  );
}
