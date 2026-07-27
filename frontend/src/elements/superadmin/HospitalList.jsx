import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import api from "../../lib/api"

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    licenseNumber: "",
    maxDoctors: 10,
  })

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const response = await api.get("/api/hospitals")
      if (response.data.success) {
        setHospitals(response.data.hospitals || [])
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post("/api/hospitals", formData)
      if (response.data.success) {
        setShowForm(false)
        setFormData({ name: "", slug: "", email: "", phone: "", licenseNumber: "", maxDoctors: 10 })
        fetchHospitals()
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create hospital")
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/api/hospitals/${id}/status`, { status })
      fetchHospitals()
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status")
    }
  }

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.slug.toLowerCase().includes(search.toLowerCase()) ||
    h.email.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700"
      case "suspended": return "bg-yellow-100 text-yellow-700"
      case "inactive": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hospitals</h1>
          <p className="text-muted-foreground">Manage all registered hospitals</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Hospital"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Hospital</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Hospital Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="City Hospital"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="city-hospital"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Used for subdomain: slug.medihive.com</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@hospital.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Number</label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="LIC-12345"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Doctors</label>
                <Input
                  type="number"
                  value={formData.maxDoctors}
                  onChange={(e) => setFormData({ ...formData, maxDoctors: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">Create Hospital</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div>
        <Input
          placeholder="Search hospitals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital._id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{hospital.name}</h3>
                    <Badge className={getStatusColor(hospital.status)}>{hospital.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{hospital.email} • {hospital.phone}</p>
                  <p className="text-sm text-muted-foreground">Slug: {hospital.slug}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>👨‍⚕️ {hospital.stats?.doctors || 0} Doctors</span>
                    <span>👤 {hospital.stats?.patients || 0} Patients</span>
                    <span>📅 {hospital.stats?.appointments || 0} Appointments</span>
                    <span>👑 {hospital.stats?.admins || 0} Admins</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {hospital.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(hospital._id, "suspended")}
                    >
                      Suspend
                    </Button>
                  )}
                  {hospital.status === "suspended" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(hospital._id, "active")}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default HospitalList
