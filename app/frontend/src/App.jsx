import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import "./App.css"

import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import TrustBanner from "./components/TrustBanner"
import ExplainerSection from "./components/ExplainerSection"
import Tabs from "./components/Tabs"
import ForecastChart from "./components/ForecastChart"
import HourlyTable from "./components/HourlyTable"
import ComparePanel from "./components/ComparePanel"
import FooterSignature from "./components/FooterSignature"

import { formatMoney } from "./utils/formatters"
import { getLevel, getBestWindow, getPotentialSaving } from "./utils/insights"
import { useLanguage } from "./context/LanguageContext"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

// 🕐 Get today's date in Edmonton timezone
function getEdmontonToday() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Edmonton" })
  ).toLocaleDateString("en-CA")
}

// 🕐 Get current hour in Edmonton timezone
function getEdmontonHour() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Edmonton" })
  ).getHours()
}

export default function App() {
  const { language } = useLanguage()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [activeTab, setActiveTab] = useState("chart")
  const [showExplainer, setShowExplainer] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getEdmontonToday)

  const fetchData = useCallback(async (date) => {
    try {
      setError(null)

      const today = getEdmontonToday()
      const isTodayRequest = date === today

      const [dataRes, healthRes, infoRes] = await Promise.all([
        isTodayRequest
          ? axios.get(`${API_URL}/latest`)
          : axios.get(`${API_URL}/predict?date=${date}`),
        axios.get(`${API_URL}/health`).catch(() => ({ data: null })),
        axios.get(`${API_URL}/model/info`).catch(() => ({ data: null })),
      ])

      setData(dataRes.data.predictions || [])
      setHealth({
        ...(healthRes?.data || {}),
        ...(infoRes?.data || {}),
      })

      setLastUpdate(
        new Date().toLocaleTimeString("en-CA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    } catch (err) {
      if (err.response?.status === 404) {
        setError("no_data")
      } else if (err.code === "ERR_NETWORK" || !err.response) {
        setError("no_connection")
      } else {
        setError("unknown")
      }
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchData(selectedDate)
  }, [selectedDate, fetchData])

  useEffect(() => {
    const interval = setInterval(() => fetchData(selectedDate), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedDate, fetchData])

  const today = getEdmontonToday()
  const isToday = selectedDate === today
  const currentHour = getEdmontonHour()

  const insights = useMemo(() => {
    if (!data.length) {
      return {
        current: null,
        hasRealCurrentHour: false,
        level: null,
        peakHour: null,
        cheapestHour: null,
        avgPrice: null,
        withActual: [],
        ourMAE: null,
        aesoMAE: null,
        bestWindow: null,
        potentialSaving: null,
      }
    }

    const matchedCurrentRow = isToday
      ? data.find((row) => Number(row.hour_local) === Number(currentHour))
      : null

    const current = matchedCurrentRow || data[0]
    const hasRealCurrentHour = Boolean(matchedCurrentRow)

    const level = getLevel(current.prediction, language)

    const peakHour = data.reduce(
      (max, row) => (row.prediction > max.prediction ? row : max),
      data[0],
    )

    const cheapestHour = data.reduce(
      (min, row) => (row.prediction < min.prediction ? row : min),
      data[0],
    )

    const avgPrice =
      data.reduce((sum, row) => sum + row.prediction, 0) / data.length

    const withActual = data.filter((row) => row.price_actual != null)

    const ourMAE = withActual.length
      ? withActual.reduce(
          (sum, row) => sum + Math.abs(row.prediction - row.price_actual),
          0,
        ) / withActual.length
      : null

    const aesoMAE = withActual.length
      ? withActual.reduce(
          (sum, row) => sum + Math.abs(row.price_forecast - row.price_actual),
          0,
        ) / withActual.length
      : null

    const bestWindow = getBestWindow(data, 3)
    const potentialSaving = getPotentialSaving(
      current.prediction,
      cheapestHour.prediction,
    )

    return {
      current,
      hasRealCurrentHour,
      level,
      peakHour,
      cheapestHour,
      avgPrice,
      withActual,
      ourMAE,
      aesoMAE,
      bestWindow,
      potentialSaving,
    }
  }, [data, isToday, currentHour, language])

  const {
    current,
    hasRealCurrentHour,
    level,
    peakHour,
    cheapestHour,
    avgPrice,
    withActual,
    ourMAE,
    aesoMAE,
    bestWindow,
    potentialSaving,
  } = insights

  const benchmarkOurMae  = health?.mae_overall ?? ourMAE
  const benchmarkAesoMae = health?.mae_aeso_overall ?? aesoMAE

  const handleRefresh = () => {
    setLoading(true)
    fetchData(selectedDate)
  }

  const handleToggleExplainer = () => {
    setShowExplainer((value) => !value)
  }

  const localizedGetLevel = useCallback(
    (price) => getLevel(price, language),
    [language],
  )

  return (
    <div className="app-shell">
      <Header
        lastUpdate={lastUpdate}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onRefresh={handleRefresh}
      />

      <main className="page-wrap">
        {error === "no_connection" && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "28px",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 36, margin: "0 0 10px" }}>🔌</p>
            <p style={{ color: "#dc2626", fontWeight: 700, fontSize: 15, margin: "0 0 6px" }}>
              Cannot connect to the prediction server
            </p>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              The forecast service is temporarily unavailable.
            </p>
          </div>
        )}

        {error === "no_data" && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 12,
              padding: "36px",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 36, margin: "0 0 10px" }}>📅</p>
            <p style={{ color: "#92400e", fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>
              No data available for {selectedDate}
            </p>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>
              We only have predictions for dates that have already been processed.
            </p>
            <button
              onClick={() => setSelectedDate(today)}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "9px 22px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Go back to today
            </button>
          </div>
        )}

        {error === "unknown" && (
          <div className="alert alert--error">
            ❌ Something went wrong. Please refresh the page and try again.
          </div>
        )}

        {loading && (
          <div className="loading-state">Loading predictions…</div>
        )}

        {!loading && !error && level && current && (
          <>
            <HeroSection
              isToday={isToday}
              selectedDate={selectedDate}
              current={current}
              hasRealCurrentHour={hasRealCurrentHour}
              level={level}
              peakHour={peakHour}
              cheapestHour={cheapestHour}
              bestWindow={bestWindow}
              avgPrice={avgPrice}
              ourMAE={ourMAE}
              aesoMAE={aesoMAE}
              potentialSaving={potentialSaving}
            />

            <TrustBanner
              benchmarkOurMae={benchmarkOurMae}
              benchmarkAesoMae={benchmarkAesoMae}
              onToggleExplainer={handleToggleExplainer}
              showExplainer={showExplainer}
              selectedDate={selectedDate}
            />

            {showExplainer && <ExplainerSection />}

            <Tabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "chart" && (
              <ForecastChart
                data={data}
                isToday={isToday}
                currentHour={currentHour}
                withActual={withActual}
                getLevel={localizedGetLevel}
                formatMoney={formatMoney}
                selectedDate={selectedDate}
              />
            )}

            {activeTab === "table" && (
              <HourlyTable
                data={data}
                isToday={isToday}
                currentHour={currentHour}
                getLevel={localizedGetLevel}
                selectedDate={selectedDate}
              />
            )}

            {activeTab === "compare" && (
              <ComparePanel
                withActual={withActual}
                ourMAE={ourMAE}
                aesoMAE={aesoMAE}
                selectedDate={selectedDate}
              />
            )}

            <FooterSignature />
          </>
        )}
      </main>
    </div>
  )
}