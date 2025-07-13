"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, easeOut } from "framer-motion"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"


const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

const FAQSection = () => {
  const faqData = [
    {
      question: "How does Aptos Chain ensure my will's security?",
      answer:
        "Aptos Chain provides immutable, transparent records of your will. Its high-speed performance and EVM compatibility ensure your wishes are securely stored and executed exactly as intended, with minimal risk of tampering or fraud.",
    },
    {
      question: "What are the advantages of creating a will on Aptos?",
      answer:
        "Aptos offers fast transaction speeds, low costs, and eco-friendly operations. This means your will can be created, updated, and executed quickly and efficiently, with minimal environmental impact and transaction fees.",
    },
    {
      question: "Can I update my will after it's been created on Aptos?",
      answer:
        "Yes, our platform allows you to update your will at any time. Changes are recorded on the Aptos Chain, ensuring a clear audit trail while maintaining the flexibility to adapt to life changes.",
    },
    {
      question: "How does asset distribution work with a Aptos-based will?",
      answer:
        "Assets are distributed according to the conditions set in your will's smart contract. This can include time-based releases, specific event triggers, or instant distribution upon verification of certain conditions.",
    },
  ]

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  }

  return (
    <section className={cn("py-10 sm:py-20 px-2 sm:px-6 lg:px-8 bg-[#0e090200] relative", poppins.className)}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[#0e090200] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 items-start"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Left Column - 40% */}
          <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
            <div>
              <motion.p
                className="text-sm text-white/50 uppercase tracking-wider mb-6 font-light"
                variants={itemVariants}
              >
                FREQUENTLY ASKED QUESTIONS
              </motion.p>
              <motion.h2
                className={cn(
                  "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-thin text-white leading-tight mb-4",
                  poppins.className,
                )}
                variants={itemVariants}
              >
                
                <span className="text-5xl text-white/80 leading-tight">Have questions in mind?</span>
                
              </motion.h2>
              <motion.p className="text-2xl font-light text-white/70" variants={itemVariants}>
                Let us answer it
              </motion.p>
            </div>

            <motion.div className="text-white/60 space-y-2" variants={itemVariants}>
              <p className="font-light">Don't find your question?</p>
              <p className="font-light">
                Contact us at{" "}
                <a
                  href="mailto:contact@startup.com"
                  className="text-[#df500f] hover:text-[#ff6b35] transition-colors duration-300 underline decoration-[#df500f]/50 hover:decoration-[#ff6b35] font-normal"
                >
                  contact@startup.com
                </a>
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - 60% */}
          <motion.div className="lg:col-span-3" variants={itemVariants}>
            <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
              {faqData.map((faq, index) => (
                <motion.div key={index} variants={itemVariants} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <AccordionItem
                    value={`item-${index}`}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-[#df500f]/30 hover:shadow-[0_0_30px_rgba(223,80,15,0.1)] group"
                  >
                    <AccordionTrigger className="px-8 py-6 text-left text-white hover:text-white/90 transition-colors duration-300 hover:no-underline [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-[#df500f] [&[data-state=open]>svg]:scale-110">
                      <span className="text-lg font-thin pr-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#df500f] transition-all duration-300">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-6 text-white/70 leading-relaxed font-light text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQSection
