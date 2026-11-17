"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

function PostJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const isEditing = Boolean(jobId);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    jobType: "Full Time",
    basicSalary: "",
    requiredSkills: "",
    experience: "",
    qualifications: "",
    description: "",
    applicationDeadline: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (isEditing) {
      async function fetchJobDetails() {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          });
          if (res.ok) {
            const data = await res.json();
            setFormData({
              title: data.title || "",
              companyName: data.companyName || "",
              location: data.location || "",
              jobType: data.jobType || "Full Time",
              basicSalary: data.basicSalary || data.salaryMin || "",
              requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills.join(", ") : data.requiredSkills || "",
              experience: data.experience || "",
              qualifications: data.qualifications || "",
              description: data.description || "",
              applicationDeadline: data.applicationDeadline ? data.applicationDeadline.split("T")[0] : "",
            });
          }
        } catch (err) {
          console.error("Fetch error:", err);
          toast.error("Failed to load job details");
        } finally {
          setFetching(false);
        }
      }
      fetchJobDetails();
    }
  }, [jobId, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        basicSalary: Number(formData.basicSalary),
      };

      const url = isEditing ? `http://localhost:5000/api/jobs/${jobId}` : "http://localhost:5000/api/jobs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to save job");
        setLoading(false);
        return;
      }

      toast.success(isEditing ? "Job updated successfully!" : "Job posted successfully!");
      router.push("/employer/dashboard");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Something went wrong connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="min-h-screen flex items-center justify-center font-medium">Loading job details...</div>;
  }

  return (
    <div className="bg-white min-h-screen text-slate-800 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            {isEditing ? "Edit Job Listing" : "Post a New Job"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Job Type *</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm">
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Basic Salary (₹) *</label>
                <input 
                  type="number" 
                  name="basicSalary" 
                  value={formData.basicSalary} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 45000"
                  className="w-full px-4 py-2 border rounded-lg text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Required Skills (Comma separated) *</label>
              <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} required placeholder="React, Node.js" className="w-full px-4 py-2 border rounded-lg text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Experience Level *</label>
                <input type="text" name="experience" value={formData.experience} onChange={handleChange} required placeholder="2-4 Years" className="w-full px-4 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Deadline *</label>
                <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Qualifications *</label>
              <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Job Description *</label>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg text-sm"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold py-3 rounded-xl transition text-sm cursor-pointer">
              {loading ? "Saving..." : isEditing ? "Update Job" : "Publish Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PostJobForm />
    </Suspense>
  );
}