'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/v2')
  }, [router])

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  )
}