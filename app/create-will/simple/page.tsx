"use client"
import { DotBackground } from "@/components/animateddots"
import CreateSimpleWill from "@/components/CreateSimpleWill"


export default function CreateSimpleWillPage() {
  return (
    <DotBackground>
      <div className="min-h-screen">
        <div className="mx-auto px-4 py-8">
          <CreateSimpleWill />
        </div>
      </div>
    </DotBackground>
  )
}

