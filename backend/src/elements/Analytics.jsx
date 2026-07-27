import React from 'react'
import PatientTrends from './analytics/PatientTrends'
import AnalyticsInsights from './analytics/AnalyticsInsights'
import DepartmentPerformance from './analytics/DepartmentPerformance'
import EmergencyStatistics from './analytics/EmergencyStatistics'
import ForecastAnalytics from './analytics/ForecastAnalytics'


const Analytics = () => {
  const colorMap = {
  success: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },

  info: {
    bg: "bg-sky-100",
    text: "text-sky-700",
  },

  warning: {
    bg: "bg-amber-100",
    text: "text-amber-700",
  },

  danger: {
    bg: "bg-rose-100",
    text: "text-rose-700",
  },

  purple: {
    bg: "bg-violet-100",
    text: "text-pink-400",
  },
}
  return (
    <>
    <AnalyticsInsights colorMap={colorMap}/>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
      <PatientTrends/>
      <DepartmentPerformance/>
      <EmergencyStatistics/>
      <ForecastAnalytics/>
    </div>
    </>
  )
}

export default Analytics
