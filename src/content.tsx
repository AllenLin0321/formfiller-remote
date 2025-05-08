import cssText from "data-text:~style.css"
import { useMemo, useState } from "react"

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
  const [tab, setTab] = useState<"view" | "settings">("view")
  const [viewName] = useState("Alice Yang")
  const [viewDate] = useState(new Date().toISOString().slice(0, 10))
  const [timeOption, setTimeOption] = useState<
    "morning" | "afternoon" | "full"
  >("morning")
  const [editName, setEditName] = useState("")
  const [dateMode, setDateMode] = useState<"today" | "tomorrow" | "manual">(
    "today"
  )
  const [manualDate, setManualDate] = useState("")
  const [ranges, setRanges] = useState({
    morning: { start: "09:00", end: "12:00" },
    afternoon: { start: "13:00", end: "17:00" },
    full: { start: "09:00", end: "17:00" }
  })

  // Memoize tab options to avoid re-creating the array on every render
  const periodOptions = useMemo(
    () =>
      [
        ["morning", "上午"],
        ["afternoon", "下午"],
        ["full", "整天"]
      ] as const,
    []
  )

  const renderView = () => (
    <div className="space-y-4">
      {/* Display-only fields */}
      <div>
        <label className="block plasmo-text-sm plasmo-font-medium">姓名</label>
        <input
          value={viewName}
          disabled
          className="plasmo-mt-1 plasmo-w-full plasmo-border plasmo-rounded plasmo-p-2 plasmo-bg-gray-100"
        />
      </div>
      <div>
        <label className="block plasmo-text-sm plasmo-font-medium">日期</label>
        <input
          type="date"
          value={viewDate}
          disabled
          className="plasmo-mt-1 plasmo-w-full plasmo-border plasmo-rounded plasmo-p-2 plasmo-bg-gray-100"
        />
      </div>
      {/* Period selection buttons */}
      <div>
        <label className="block plasmo-text-sm plasmo-font-medium plasmo-mb-1">
          請假時段
        </label>
        <div className="plasmo-flex plasmo-space-x-2">
          {periodOptions.map(([opt, label]) => (
            <button
              key={opt}
              className={`plasmo-px-3 plasmo-py-1 plasmo-rounded ${
                timeOption === opt
                  ? "plasmo-bg-blue-600 plasmo-text-white"
                  : "plasmo-bg-gray-200 plasmo-text-gray-700"
              }`}
              onClick={() => setTimeOption(opt)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block plasmo-text-sm plasmo-font-medium">姓名</label>
        <input
          value={editName}
          onChange={(e) => setEditName(e.currentTarget.value)}
          placeholder="請輸入姓名"
          className="plasmo-mt-1 plasmo-w-full plasmo-border plasmo-rounded plasmo-p-2"
        />
      </div>
      <div>
        <label className="block plasmo-text-sm plasmo-font-medium">日期</label>
        <div className="plasmo-mt-1 plasmo-flex plasmo-items-center plasmo-space-x-3">
          {/* Date mode radio buttons */}
          {(["today", "tomorrow", "manual"] as const).map((mode) => (
            <label key={mode}>
              <input
                type="radio"
                name="dateMode"
                value={mode}
                checked={dateMode === mode}
                onChange={() => setDateMode(mode)}
                className="plasmo-mr-1"
              />
              {mode === "today"
                ? "今日"
                : mode === "tomorrow"
                  ? "明日"
                  : "手動"}
            </label>
          ))}
        </div>
        {dateMode === "manual" && (
          <input
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.currentTarget.value)}
            className="plasmo-mt-2 plasmo-w-full plasmo-border plasmo-rounded plasmo-p-2"
          />
        )}
      </div>
      {/* Time range inputs */}
      {(["morning", "afternoon", "full"] as const).map((opt) => (
        <div key={opt}>
          <label className="block plasmo-text-sm plasmo-font-medium">
            {opt === "morning"
              ? "上午 (從–到)"
              : opt === "afternoon"
                ? "下午 (從–到)"
                : "整天 (從–到)"}
          </label>
          <div className="plasmo-mt-1 plasmo-flex plasmo-space-x-2">
            <input
              type="time"
              value={ranges[opt].start}
              onChange={(e) =>
                setRanges((r) => ({
                  ...r,
                  [opt]: { ...r[opt], start: e.currentTarget.value }
                }))
              }
              className="plasmo-flex-1 plasmo-border plasmo-rounded plasmo-p-1"
            />
            <span className="plasmo-self-center">至</span>
            <input
              type="time"
              value={ranges[opt].end}
              onChange={(e) =>
                setRanges((r) => ({
                  ...r,
                  [opt]: { ...r[opt], end: e.currentTarget.value }
                }))
              }
              className="plasmo-flex-1 plasmo-border plasmo-rounded plasmo-p-1"
            />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="plasmo-fixed plasmo-top-4 plasmo-right-4 plasmo-z-[9999] plasmo-w-96 plasmo-bg-white plasmo-rounded-lg plasmo-shadow-lg plasmo-p-4">
      <div className="plasmo-flex plasmo-border-b plasmo-mb-4">
        {(["view", "settings"] as const).map((t) => (
          <button
            key={t}
            className={`plasmo-flex-1 plasmo-py-2 ${
              tab === t
                ? "plasmo-border-b-2 plasmo-border-blue-600 plasmo-text-blue-600"
                : "plasmo-text-gray-600"
            }`}
            onClick={() => setTab(t)}>
            {t === "view" ? "檢視" : "設定"}
          </button>
        ))}
      </div>
      {tab === "view" ? renderView() : renderSettings()}
    </div>
  )
}

export default PlasmoOverlay
