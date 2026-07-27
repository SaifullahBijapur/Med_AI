import { useState } from "react"
import axios from "axios"

function Reports() {

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!file) {
      alert("Please select a file")
      return
    }

    try {

      setLoading(true)

      const formData = new FormData()

      formData.append("report", file)

      const response = await axios.post(
        "http://localhost:5000/api/report/aisummary",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      console.log(response.data)
      // backend response handle
      if (response.data.success) {
        
        setResult(response.data.aiAnalysis)
        
      } else {

        alert(response.data.message)
      }

    } catch (error) {

      console.log(error)

      // detailed error handling
      if (error.response) {

        console.log(error.response.data)

        alert(error.response.data.message)

      } else {

        alert("Network Error")
      }

    } finally {

      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-6 rounded-2xl shadow-lg w-[500px]">

        <h1 className="text-2xl font-bold mb-5">
          Upload Medical Report
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
            className="w-full border p-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded-lg"
          >
            {
              loading
                ? "Uploading..."
                : "Submit Report"
            }
          </button>

        </form>

        {/* RESULT */}

        {
          result && (

            <div className="mt-6">

              <h2 className="text-xl font-semibold mb-2">
                Extracted Text
              </h2>

              <div className="bg-slate-100 p-4 rounded-lg whitespace-pre-wrap">
                {result}
              </div>
              
              
              

            </div>
          )
        }

      </div>

    </div>
  )
}

export default Reports