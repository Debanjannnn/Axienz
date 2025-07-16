"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { PlusIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Poppins } from "next/font/google"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
})

const faqData = [
  {
    id: "1",
    question: "How does BNB Chain ensure my will's security?",
    answer:
      "BNB Chain provides immutable, transparent records of your will. Its high-speed performance and EVM compatibility ensure your wishes are securely stored and executed exactly as intended, with minimal risk of tampering or fraud.",
  },
  {
    id: "2",
    question: "What are the advantages of creating a will on BNB?",
    answer:
      "BNB offers fast transaction speeds, low costs, and eco-friendly operations. This means your will can be created, updated, and executed quickly and efficiently, with minimal environmental impact and transaction fees.",
  },
  {
    id: "3",
    question: "Can I update my will after it's been created on BNB?",
    answer:
      "Yes, our platform allows you to update your will at any time. Changes are recorded on the BNB Chain, ensuring a clear audit trail while maintaining the flexibility to adapt to life changes.",
  },
  {
    id: "4",
    question: "How does asset distribution work with a BNB-based will?",
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
    <div className={cn("max-w-4xl mx-auto p-10", poppins.className)}>
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-thin tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#2e3192] via-white to-[#1b1e4b]">Frequently Asked Questions</h2>
        <p className="text-lg md:text-xl text-gray-400 font-thin">Everything you need to know about creating secure digital wills on the Aptos blockchain and how our platform protects your legacy.</p>
      </div>
      <Accordion type="single" collapsible className="w-full text-lg md:text-xl">
        {faqData.map((item) => (
          <AccordionItem key={item.id} value={`item-${item.id}`}>
            <AccordionTrigger className={cn(
              "text-2xl font-thin mb-4 text-gray-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#C0C0C0] transition-colors duration-300",
              poppins.className
            )}>{item.question}</AccordionTrigger>
            <AccordionContent className="text-lg text-gray-400 md:text-xl font-thin">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}