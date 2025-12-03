'use client'
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react";

type version = {
  name: string;
  description: string;
  date: string;
  route: string;
}

const versions: version[] = [
  {
    name: "Fake ID Detection",
    description: "Text updates for renaming \"BCD\" to \"Fake ID Detection\"",
    date: "12/1/2025",
    route: "v2"
  },
  {
    name: "Icon Refresh",
    description: "Initial build to document updated icon designs and status bar text",
    date: "9/30/2025",
    route: "v1"
  }
]

export default function Nav() {
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const router = useRouter()
  const currentRoute = usePathname().split('/').pop() || ''

  const currentVersion = versions.find(version => version.route === currentRoute);

  const handleSelectVersion = (route: string) => {
    setNavOpen(false)
    router.push(route)
  }
  
  return (
    <div className="w-full py-2 px-3 flex flex-row justify-between bg-gray-50 border-b-1">
      <p><span className="text-black">{currentVersion?.name}</span><span className="text-gray-400"> - {currentVersion?.date}</span></p>
      <div
        className="relative"
        onMouseLeave={() => setNavOpen(false)}
      >
        <button
          className="text-gray-800 px-2 border-1 border-gray-400 rounded bg-gray-100"
          onClick={() => setNavOpen(true)}
        >Previous Versions</button>
        {navOpen && (
          <div className="absolute top-[24px] right-0 w-64 bg-white p-2 flex flex-col gap-2 border border-gray-300">
            {versions.map((version, i) => (
              <>
                <div
                  key={i}
                  className="hover:bg-gray-100 p-1"
                  onClick={() => handleSelectVersion(version.route)}
                  >
                    <div className="flex flex-row justify-between items-start gap-2">
                      <p className="text-black">{version.name}</p>
                      <p className="text-xs text-gray-500">{version.date}</p>
                    </div>
                    <p className="text-xs text-gray-500">{version.description}</p>
                </div>
                {i < versions.length - 1 && <div className="w-full h-[1px] bg-gray-300"/>}
              </>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}