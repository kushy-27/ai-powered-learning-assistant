import React, { useEffect, useState } from "react";
import Spinner from "../../components/common/spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  Variable,
} from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("FULL DASHBOARD RESPONSE:", data);
        console.log("data.data:", data?.data);
        console.log("data.data.data:", data?.data?.data);

        setDashboardData(data.data);
      } catch (error) {
        toast.error("Failed to fetch dashboard data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Spinner/>
    );
  }
  if(!dashboardData || !dashboardData.overview){
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-6 text-slate-400"/>
          </div>
          <p className="text-slate-600 text-sm">No dashboard data available</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: 'from-emerald-400 to-teal-500',
      shadowColor: 'shadow-emerald-500/25'
    },
    
  ]

  return (
    <div className="relative min-h-screen p-6 md:p-8 bg-linear-to-br from-slate-50 via-white to-slate-50">
    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-position-[16px_16px] opacity-30 pointer-events-none" />

        <div className="relative">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track your learning progress and activity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </span>

                    <div
                      className={`w-11 h-11 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                  </div>

                  <div className="text-3xl font-semibold text-slate-900 tracking-tight">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600" strokeWidth={2} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Recent Activity
              </h3>
            </div>

            <div className="space-y-3">
              {dashboardData?.recentActivity?.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle
                        className="w-5 h-5 text-emerald-600"
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {activity.title || activity.message || "Activity completed"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {activity.time || activity.createdAt || "Recently"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Clock className="w-7 h-7 text-slate-400" strokeWidth={2} />
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    No recent activity yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Your learning activity will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );

}
export default DashboardPage