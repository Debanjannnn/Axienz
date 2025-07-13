"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DotBackground } from '@/components/animateddots'

const Page = () => {
  const [hasSimpleWill, setHasSimpleWill] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Logic to check if the user has a simple will (for example, checking from a context, API, etc.)
    const userHasSimpleWill = true  // This would be dynamic based on user data.
    setHasSimpleWill(userHasSimpleWill)
  }, [])

  const handleRedirect = () => {
    router.push('/check-my-will/simple')
  }

  return (
    <DotBackground>
      <div className="flex items-center justify-center min-h-screen p-4">

        <div className="w-full max-w-md text-center bg-transparent backdrop-blur-0 rounded-xl border p-6 shadow-lg">
          {hasSimpleWill ? (
            <div className="w-full bg-blue-500 " >


              <Button
                onClick={handleRedirect}
                className="w-full  bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-gray-600/40 rounded-lg p-3 text-white dark:text-gray-300 hover:bg-white/30 dark:hover:bg-black/30 transition duration-300"
              >
                Check Your Simple Will
              </Button>


            </div>
          ) : (
            <p className="text-white">You do not have a Simple Will.</p>
          )}
        </div>
      </div>
    </DotBackground>
  )
}

export default Page
