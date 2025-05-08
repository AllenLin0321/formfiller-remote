import { useEffect } from "react"

import "~style.css"

const Popup = () => {
  useEffect(() => {
    // 找出當前分頁並替換成 ChatGPT
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        if (tabs[0]?.id != null) {
          chrome.tabs.update(tabs[0].id, {
            url: "https://docs.google.com/forms/d/e/1FAIpQLSf51MQ7zTzo_AMy7JhUHvP0En_y3LJNL4DgSGpNsdCxUC_vLg/viewform?usp=pp_url&entry.1923207762=%E9%81%B8%E9%A0%85+1"
          })
        }
      })
      .finally(() => {
        window.close() // 關閉 popup
      })
  }, [])

  return <div></div>
}

export default Popup
