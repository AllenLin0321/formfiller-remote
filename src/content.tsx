import { createRoot } from "react-dom/client"

import "~/tailwind.css"

const FloatingBox = () => {
  return (
    <div className="fixed top-20 right-5 z-[9999] bg-white shadow-xl text-black px-4 py-2 rounded-lg text-sm">
      ✅ Autofill Extension Active
    </div>
  )
}

const container = document.createElement("div")
document.body.appendChild(container)
createRoot(container).render(<FloatingBox />)
