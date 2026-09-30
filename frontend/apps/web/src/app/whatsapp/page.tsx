"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { whatsappApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  MessageSquare,
  Send,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Activity,
} from "lucide-react";

interface WhatsAppDashboardStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  activeConversations: number;
  pendingMessages: number;
  activeCampaigns: number;
  templatesCount: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function WhatsAppDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WhatsAppDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await whatsappApi.getDashboard();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError("Failed to load WhatsApp dashboard data");
      }
    } catch (err) {
      console.error("Error fetching WhatsApp dashboard data:", err);
      setError("Failed to load WhatsApp dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const deliveryRate = stats?.totalSent 
    ? ((stats.totalDelivered / stats.totalSent) * 100).toFixed(1) 
    : '0';
  const readRate = stats?.totalDelivered 
    ? ((stats.totalRead / stats.totalDelivered) * 100).toFixed(1) 
    : '0';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                WhatsApp Communication Hub
              </h1>
              <p className="page-description">
                Premium WhatsApp integration with AI-powered features and real-time analytics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="btn btn-secondary"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                className="btn btn-primary"
                onClick={() => (window.location.href = "/whatsapp/chat/new")}
              >
                <Plus className="h-4 w-4" />
                New Message
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle className="alert-icon" />
              <div className="alert-content">
                <div className="alert-title">Error</div>
                <div className="alert-message">{error}</div>
              </div>
            </div>
          )}

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Sent */}
            <div className="glass-card group hover:shadow-lg transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(stats?.totalSent || 0)}
                    </p>
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5% from last week
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivered */}
            <div className="glass-card group hover:shadow-lg transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(stats?.totalDelivered || 0)}
                    </p>
                    <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      {deliveryRate}% delivery rate
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Read */}
            <div className="glass-card group hover:shadow-lg transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(stats?.totalRead || 0)}
                    </p>
                    <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                      {readRate}% read rate
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Conversations */}
            <div className="glass-card group hover:shadow-lg transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Conversations</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(stats?.activeConversations || 0)}
                    </p>
                    <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                      {stats?.pendingMessages || 0} pending responses
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => (window.location.href = "/whatsapp/chat")}
              className="glass-card group hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Live Chat</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Real-time conversations</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </button>

            <button
              onClick={() => (window.location.href = "/whatsapp/templates")}
              className="glass-card group hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Templates</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stats?.templatesCount || 0} templates</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-green-500 transition-colors" />
                </div>
              </div>
            </button>

            <button
              onClick={() => (window.location.href = "/whatsapp/campaigns")}
              className="glass-card group hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Campaigns</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stats?.activeCampaigns || 0} active</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            </button>

            <button
              onClick={() => (window.location.href = "/whatsapp/analytics")}
              className="glass-card group hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Analytics</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Performance insights</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="glass-card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
              <button
                onClick={() => (window.location.href = "/whatsapp/analytics")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="card-body">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {activity.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Message Performance */}
            <div className="glass-card">
              <div className="card-header">
                <h3 className="card-title">Message Performance</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{deliveryRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${deliveryRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Read Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{readRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${readRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Failed Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats?.totalSent ? ((stats.totalFailed / stats.totalSent) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                        style={{ width: `${stats?.totalSent ? ((stats.totalFailed / stats.totalSent) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Features Status */}
            <div className="glass-card">
              <div className="card-header">
                <h3 className="card-title">AI-Powered Features</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Smart Auto-Responses</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered replies</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Sentiment Analysis</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Customer mood tracking</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Predictive Engagement</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Optimal timing suggestions</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}