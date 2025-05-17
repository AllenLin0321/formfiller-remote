import cssText from "data-text:~style.css"
import { useEffect, useMemo, useState } from "react"

export const config = {
  matches: ["https://docs.google.com/forms/*"],
  all_frames: false,
  run_at: "document_idle"
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

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${day}`
}

const PlasmoOverlay = () => {
  const [tab, setTab] = useState<"view" | "settings">("view")
  const [persistedName, setPersistedName] = useState("")
  const [tempName, setTempName] = useState("")
  const [dateMode, setDateMode] = useState<"today" | "tomorrow" | "manual">(
    "today"
  )
  const [manualDate, setManualDate] = useState("")
  const [timeOption, setTimeOption] = useState<
    "morning" | "afternoon" | "full"
  >("morning")

  const [ranges, setRanges] = useState({
    morning: { start: "09:00", end: "12:00" },
    afternoon: { start: "13:00", end: "17:00" },
    full: { start: "09:00", end: "17:00" }
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(
      ["name", "dateMode", "manualDate", "timeOption", "ranges"],
      (res) => {
        setPersistedName(res.name || "")
        setTempName(res.name || "")
        setDateMode(res.dateMode || "today")
        setManualDate(res.manualDate || "")
        setTimeOption(res.timeOption || "morning")
        if (res.ranges) setRanges(res.ranges)
      }
    )
  }, [])

  const dateValue = useMemo(() => {
    if (dateMode === "today") return formatLocalDate(new Date())
    if (dateMode === "tomorrow") {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      return formatLocalDate(d)
    }
    return manualDate
  }, [dateMode, manualDate])

  const saveSettings = () => {
    chrome.storage.local.set({
      name: tempName,
      dateMode,
      manualDate,
      timeOption,
      ranges
    })
    setPersistedName(tempName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const periods = [
    ["morning", "上午"],
    ["afternoon", "下午"],
    ["full", "整天"]
  ] as const

  const renderView = () => (
    <div className="plasmo-space-y-4">
      <div>
        <label className="plasmo-block plasmo-text-sm plasmo-font-medium">
          姓名
        </label>
        <input
          value={persistedName}
          disabled
          className="plasmo-mt-1 plasmo-w-full plasmo-border plasmo-rounded plasmo-p-2 plasmo-bg-gray-100"
        />
      </div>
      {dateValue && (
        <div>
          <label className="plasmo-block plasmo-text-sm plasmo-font-medium">
            日期{" "}
            {dateMode === "today"
              ? "(今天)"
              : dateMode === "tomorrow"
                ? "(明天)"
                : ""}
          </label>
          <input
            type="date"
            value={dateValue}
            disabled
            className="plasmo-mt-1 plasmo-w-full plasmo-border plasmo-rounded plasmo-p-2 plasmo-bg-gray-100"
          />
        </div>
      )}
      <div>
        <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-mb-1">
          請假時段
        </label>
        <div className="plasmo-flex plasmo-space-x-2">
          {periods.map(([opt, label]) => (
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
      <div>
        <label className="plasmo-block plasmo-text-sm plasmo-font-medium">
          時間區間
        </label>
        <div className="plasmo-text-sm plasmo-text-gray-700">
          {ranges[timeOption].start} - {ranges[timeOption].end}
        </div>
      </div>
      <div className="plasmo-flex plasmo-justify-between plasmo-mt-4">
        <button
          onClick={() => {
            // TODO: Add logic for applying settings
          }}
          className="plasmo-bg-blue-600 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded">
          套用
        </button>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="plasmo-space-y-4">
      <div>
        <label className="plasmo-block plasmo-text-sm plasmo-font-medium">
          姓名
        </label>
        <input
          value={tempName}
          onChange={(e) => setTempName(e.currentTarget.value)}
          placeholder="請輸入姓名"
          className="plasmo-mt-1 plasmo-w-full plasmo-border plasmo-rounded plasmo-p-2"
        />
      </div>
      <div>
        <label className="plasmo-block plasmo-text-sm plasmo-font-medium">
          日期
        </label>
        <div className="plasmo-mt-1 plasmo-flex plasmo-items-center plasmo-space-x-3">
          {(["today", "tomorrow", "manual"] as const).map((mode) => (
            <label
              key={mode}
              className="plasmo-flex plasmo-items-center plasmo-space-x-1">
              <input
                type="radio"
                checked={dateMode === mode}
                onChange={() => setDateMode(mode)}
                className="plasmo-mr-1"
              />
              <span className="plasmo-text-sm">
                {mode === "today"
                  ? "當日"
                  : mode === "tomorrow"
                    ? "明日"
                    : "手動"}
              </span>
            </label>
          ))}
        </div>
      </div>
      {saved && (
        <div className="plasmo-text-green-600 plasmo-text-sm">儲存成功</div>
      )}
      <div className="plasmo-flex plasmo-justify-end plasmo-mt-2">
        <button
          onClick={saveSettings}
          className="plasmo-bg-green-600 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded">
          儲存
        </button>
      </div>
    </div>
  )

  return (
    <div className="plasmo-fixed plasmo-top-4 plasmo-right-4 plasmo-z-[9999] plasmo-w-96 plasmo-bg-white plasmo-rounded-lg plasmo-shadow-lg plasmo-p-4 plasmo-font-sans">
      <div className="plasmo-flex plasmo-border-b plasmo-mb-4">
        {(["view", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`plasmo-flex-1 plasmo-py-2 ${
              tab === t
                ? "plasmo-border-b-2 plasmo-border-blue-600 plasmo-text-blue-600"
                : "plasmo-text-gray-600"
            }`}>
            {t === "view" ? "檢視" : "偏好設定"}
          </button>
        ))}
      </div>
      {tab === "view" ? renderView() : renderSettings()}
    </div>
  )
}

export default PlasmoOverlay
