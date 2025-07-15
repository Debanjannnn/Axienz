"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { PlusIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Poppins } from "next/font/google"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
})

const faqData = [
  {
    id: "1",
    question: "How does Aptos Chain ensure my will's security?",
    answer:
      "Aptos Chain provides immutable, transparent records of your will. Its high-speed performance and EVM compatibility ensure your wishes are securely stored and executed exactly as intended, with minimal risk of tampering or fraud.",
  },
  {
    id: "2",
    question: "What are the advantages of creating a will on Aptos?",
    answer:
      "Aptos offers fast transaction speeds, low costs, and eco-friendly operations. This means your will can be created, updated, and executed quickly and efficiently, with minimal environmental impact and transaction fees.",
  },
  {
    id: "3",
    question: "Can I update my will after it's been created on Aptos?",
    answer:
      "Yes, our platform allows you to update your will at any time. Changes are recorded on the Aptos Chain, ensuring a clear audit trail while maintaining the flexibility to adapt to life changes.",
  },
  {
    id: "4",
    question: "How does asset distribution work with a Aptos-based will?",
    answer:
      "Assets are distributed according to the conditions set in your will's smart contract. This can include time-based releases, specific event triggers, or instant distribution upon verification of certain conditions.",
  },
]

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
      duration: 0.4,
    },
  }),
}

export default function FaqSection() {
  return ( 
    <section className="py-16 md:py-20 ">
      <div className="container mx-auto max-w-8xl px-6 md:px-8">
        <div className="mb-12 text-center">
          <motion.h2
            className={cn(
              "mb-4 text-4xl font-semibold tracking-tight text-black dark:text-white md:text-5xl",
              poppins.className,
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-gray-600 to-black bg-clip-text text-transparent dark:from-gray-300 dark:to-white">
              Questions
            </span>
          </motion.h2>
          <motion.p
            className={cn("mx-auto max-w-3xl text-lg text-gray-700 dark:text-gray-300", poppins.className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to know about creating secure digital wills on the Aptos blockchain and how our platform
            protects your legacy.
          </motion.p>
        </div>

        <motion.div
          className="relative mx-auto max-w-6xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Decorative gradient backgrounds */}
          <div className="absolute -left-8 -top-8 -z-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 -z-10 h-64 w-64 rounded-full bg-gray-100/10 blur-3xl" />

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(255,255,255,0.1),0px_0px_0px_1px_rgba(255,255,255,0.05)]">
            <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="1">
              {faqData.map((item, index) => (
                <motion.div
                  key={item.id}
                  custom={index}
                  variants={fadeInAnimationVariants}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <AccordionItem
                    value={item.id}
                    className={cn(
                      "overflow-hidden rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm shadow-sm transition-all duration-300",
                      "hover:bg-white/10 hover:shadow-md",
                      "data-[state=open]:bg-white/15 data-[state=open]:shadow-lg data-[state=open]:border-white/30",
                    )}
                  >
                    <AccordionPrimitive.Header className="flex">
                      <AccordionPrimitive.Trigger
                        className={cn(
                          "group flex flex-1 items-center justify-between gap-6 px-6 py-5 text-left transition-all duration-300",
                          "outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2",
                          "hover:text-gray-600 dark:hover:text-gray-300",
                          "data-[state=open]:text-black dark:data-[state=open]:text-white",
                          poppins.className,
                        )}
                      >
                        <span className="text-lg font-semibold text-black dark:text-white md:text-xl">
                          {item.question}
                        </span>
                        <PlusIcon
                          size={20}
                          className={cn(
                            "shrink-0 text-gray-500 transition-all duration-300 ease-out",
                            "group-hover:text-gray-700 dark:group-hover:text-gray-300",
                            "group-data-[state=open]:rotate-45 group-data-[state=open]:text-black dark:group-data-[state=open]:text-white",
                          )}
                          aria-hidden="true"
                        />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionContent
                      className={cn(
                        "overflow-hidden transition-all duration-300",
                        "data-[state=open]:animate-accordion-down",
                        "data-[state=closed]:animate-accordion-up",
                      )}
                    >
                      <div className="border-t border-white/10 px-6 pb-5 pt-4">
                        <p
                          className={cn(
                            "text-base font-semibold leading-relaxed text-gray-700 dark:text-gray-300 md:text-lg",
                            poppins.className,
                          )}
                        >
                          {item.answer}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            {/* Bottom CTA */}
          
          </div>
        </motion.div>
      </div>
    </section>
  )
}
