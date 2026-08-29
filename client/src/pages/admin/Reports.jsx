import { useEffect, useState } from "react"
import api from "../../services/api"
import {
  Loader2,
  FileText,
  ShieldAlert,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const STATUS_COLORS = {
  pending: "#f59e0b",
  verified: "#22c55e",
  rejected: "#ef4444",
}

const RISK_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
}

const TYPE_COLORS = ["#0f172a", "#3b82f6", "#8b5cf6", "#ec4899"]

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const ChartCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <div className="flex items-center gap-2 mb-5">
      <Icon size={18} className="text-slate-400" />
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
    </div>
    {children}
  </div>
)

const Reports = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const response = await api.get("/documents/admin/reports")
        setData(response.data)
      } catch (err) {
        setError("Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        {error}
      </div>
    )
  }

  const statusData = data.statusBreakdown.map((item) => ({
    name: capitalize(item._id),
    value: item.count,
    key: item._id,
  }))

  const typeData = data.typeBreakdown.map((item) => ({
    name: capitalize(item._id),
    count: item.count,
  }))

  const riskData = data.riskBreakdown.map((item) => ({
    name: capitalize(item._id),
    value: item.count,
    key: item._id,
  }))

  const uploadsData = data.uploadsOverTime.map((item) => ({
    date: item._id,
    count: item.count,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of document verification activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Status Breakdown" icon={PieChartIcon}>
          {statusData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              No data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={STATUS_COLORS[entry.key] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Document Type Breakdown" icon={FileText}>
          {typeData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              No data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Tampering Risk Breakdown" icon={ShieldAlert}>
          {riskData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              No data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {riskData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={RISK_COLORS[entry.key] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Uploads Over Time" icon={TrendingUp}>
          {uploadsData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              No data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={uploadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

export default Reports