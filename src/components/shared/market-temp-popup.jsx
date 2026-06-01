"use client"

import { useApp, KOSPI_STATUS } from '@/lib/app-context'

export function MarketTempPopup() {
  const {  marketTempOpen,
  setMarketTempOpen,
  currentKospiStatus,
  economicWeather, } = useApp()
  
  if (!marketTempOpen) return null
  
  const status = KOSPI_STATUS[currentKospiStatus]

  return (
    <div 
      className="absolute inset-0 bg-[rgba(10,10,30,0.6)] z-[300] flex items-center justify-center"
      onClick={() => setMarketTempOpen(false)}
    >
      <div 
        className="bg-white rounded-[24px] p-6 mx-5 w-full max-w-[340px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[48px] text-center my-3">{economicWeather?.emoji || status.icon}</div>
        <div className="text-[16px] font-black text-[#7C3AED] text-center mb-2">{economicWeather?.weatherLabel || status.name}</div>
        <div className="text-sm text-[#4a4a6a] leading-[1.7] mb-4 text-center">{economicWeather?.description || status.desc}</div>
        <div className="bg-[rgba(124,58,237,0.06)] rounded-xl p-3 text-[13px] text-[#4a4a6a] leading-[1.7] mb-4">
          <strong>📊 코스피 기준 시장 동향</strong>
          <br /><br />
          {economicWeather?.detailReasonLines
  ? economicWeather.detailReasonLines.map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ))
  : status.reason.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ))}
        </div>
        <button 
          className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#3CBBA2] text-white border-none rounded-xl text-[15px] font-black cursor-pointer"
          onClick={() => setMarketTempOpen(false)}
        >
          확인
        </button>
      </div>
    </div>
  )
}
