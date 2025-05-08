import cssText from "data-text:~style.css"

export const config = {
  matches: ["<all_urls>"]
}

/**
 * Generates a style element with adjusted CSS to work correctly within a Shadow DOM.
 *
 * Tailwind CSS relies on `rem` units, which are based on the root font size (typically defined on the <html>
 * or <body> element). However, in a Shadow DOM (as used by Plasmo), there is no native root element, so the
 * rem values would reference the actual page's root font size—often leading to sizing inconsistencies.
 *
 * To address this, we:
 * 1. Replace the `:root` selector with `:host(plasmo-csui)` to properly scope the styles within the Shadow DOM.
 * 2. Convert all `rem` units to pixel values using a fixed base font size, ensuring consistent styling
 *    regardless of the host page's font size.
 */
export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize

    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")

  styleElement.textContent = updatedCssText

  return styleElement
}
const PlasmoOverlay = () => {
  return (
    <div
      id="plasmo-floating-promo"
      className="
      plasmo-fixed plasmo-top-4 plasmo-right-4 plasmo-z-[9999] plasmo-w-80 
      plasmo-bg-white plasmo-rounded-lg plasmo-shadow-lg plasmo-p-4 
      plasmo-flex plasmo-flex-col plasmo-items-center
    ">
      <h4 className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-800 plasmo-mb-2">
        Auto-Fill Application
      </h4>
      <button
        className="
        plasmo-bg-purple-600 plasmo-hover:bg-purple-700 plasmo-text-white 
        plasmo-rounded-full plasmo-px-4 plasmo-py-2 plasmo-w-full plasmo-text-center
      "
        onClick={() => {
          window.location.href =
            "https://docs.google.com/forms/d/e/1FAIpQLSf51MQ7zTzo_AMy7JhUHvP0En_y3LJNL4DgSGpNsdCxUC_vLg/viewform?usp=pp_url&entry.1923207762=%E9%81%B8%E9%A0%85+1"
        }}>
        套用
      </button>
      <button
        className="plasmo-mt-2 plasmo-text-sm plasmo-text-gray-500 plasmo-hover:underline"
        onClick={() => {
          document.getElementById("plasmo-floating-promo")?.remove()
        }}>
        Hide for now
      </button>
    </div>
  )
}

export default PlasmoOverlay
