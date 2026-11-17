"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
        );
      }
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((notif) => notif._id !== id));
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-16 pt-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <Link href="/jobseeker/dashboard" className="hover:text-slate-800 transition flex items-center space-x-1">
                <ArrowLeft className="w-3.5 h-3.5 inline" />
                <span>Dashboard</span>
              </Link>
              <span>/</span>
              <span className="text-[#06b6d4] font-medium">Notifications</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <Bell className="w-7 h-7 text-[#06b6d4]" />
              <span>Notifications</span>
            </h1>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-1 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-[#06b6d4]" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* List Content */}
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No notifications yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              You will receive updates regarding your job applications and saved listings here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                className={`p-5 rounded-2xl border transition shadow-sm flex items-start justify-between gap-4 ${
                  notif.isRead
                    ? "bg-white border-slate-200 opacity-80"
                    : "bg-cyan-50/40 border-cyan-200 ring-1 ring-cyan-100"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span>
                    )}
                    <h3 className="font-bold text-slate-900 text-sm">
                      {notif.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-1">
                    {new Date(notif.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition"
                      title="View Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif._id);
                    }}
                    className="p-2 bg-white border border-slate-200 hover:bg-rose-50 text-rose-500 rounded-xl transition cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}