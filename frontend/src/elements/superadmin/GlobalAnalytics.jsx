import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "../../lib/api"

const GlobalAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/api/hospitals/analytics/global")
      if (response.data.success) {
        setAnalytics(response.data.analytics)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Global Analytics</h1>
        <p className="text-muted-foreground">Cross-hospital performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(analytics?.totalExpenses || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Patients per Hospital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalHospitals
                ? Math.round((analytics.totalPatients || 0) / analytics.totalHospitals)
                : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Appointments per Hospital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalHospitals
                ? Math.round((analytics.totalAppointments || 0) / analytics.totalHospitals)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Growth Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.hospitalGrowth?.length > 0 ? (
            <div className="space-y-2">
              {analytics.hospitalGrowth.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                  <span className="font-medium">{g._id}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${Math.min((g.count / (analytics.totalHospitals || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{g.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No growth data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default GlobalAnalytics
