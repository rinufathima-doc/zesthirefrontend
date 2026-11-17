"use client";

import { useState } from "react";

export default function ResumeBuilder() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    objective: "",
    education: "",
    skills: "",
    experience: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Resume Form */}
      <div className="p-6 border rounded-lg">
        <h1 className="text-2xl font-bold mb-4">
          Resume Builder
        </h1>

        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
        />

        <textarea
          name="objective"
          placeholder="Career Objective"
          value={formData.objective}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
        />

        <textarea
          name="education"
          placeholder="Education"
          value={formData.education}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
        />

        <textarea
          name="skills"
          placeholder="Skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
        />

        <textarea
          name="experience"
          placeholder="Work Experience"
          value={formData.experience}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
        />

        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Download Resume
        </button>
      </div>

      {/* Live Resume Preview */}
      <div
        id="resume-preview"
        className="bg-white text-black border p-8 rounded-lg"
      >
        <h1 className="text-3xl font-bold text-center">
          {formData.name || "Your Name"}
        </h1>

        <p className="text-center mt-2">
          {formData.email}
          {formData.email && formData.phone ? " | " : ""}
          {formData.phone}
        </p>

        <hr className="my-4" />

        <h2 className="font-bold text-lg">Career Objective</h2>
        <p className="mb-4 whitespace-pre-wrap">
          {formData.objective}
        </p>

        <h2 className="font-bold text-lg">Education</h2>
        <p className="mb-4 whitespace-pre-wrap">
          {formData.education}
        </p>

        <h2 className="font-bold text-lg">Skills</h2>
        <p className="mb-4 whitespace-pre-wrap">
          {formData.skills}
        </p>

        <h2 className="font-bold text-lg">Experience</h2>
        <p className="whitespace-pre-wrap">
          {formData.experience}
        </p>
      </div>
    </div>
  );
}