"use client";
import Lenis from "lenis"
import { useEffect } from "react";
import WillInfo from "../components/WillInfo";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { FloatingNav } from "@/components/ui/floating-navbar";
import HeroSection from "../components/Hero";
import { Features } from "@/components/Features";
import FooterGlow from "@/components/mvpblocks/footer-glow";

export default function Home() {

  const navItems = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Contact", link: "/contact" },
    { name: "FAQ", link: "/faq" },
  ];
 
    useEffect(() => {
    const lenis = new Lenis({})

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return ( 
  <div className="relative bg-[#120b03] min-h-screen w-full overflow-hidden ">
      <div
      className="relative bg-[#120b03] min-h-screen w-full overflow-hidden "
      style={{
        background: `
      linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 20%, #000000 100%),
      url('/images/CORE.png')
    `,
        backgroundPosition: "top center, top center",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: "100% auto, 100% auto",
        backgroundBlendMode: "normal, normal",
      }}
    >
    {/* <DotBackground> */}
    <div className="absolute top-0 left-0 right-0 z-10 py-4">
        <FloatingNav navItems={navItems} />
      </div>
      
      <div>
        <HeroSection />
      </div>

      <div className="bg-[#0d0f12]">
        <Features />
      </div>

        <WillInfo />

        {/* FAQ section: no special background, make FAQ extra wide and centered */}
        <div className="flex justify-center w-full px-2 bg-[#0d0f12]">
         
            <FAQ />
  
        </div>

        <Footer />
      {/* <FooterGlow/> */}
      {/* </DotBackground> */}
      </div >
    </div>
  );
}
