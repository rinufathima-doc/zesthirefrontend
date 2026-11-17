import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateApplicationStatusAsync } from '../../redux/slices/employerSlice';

const CandidateResumeModal = ({ application, onClose }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.employerNotes || '');
  const [loading, setLoading] = useState(false);

  if (!application) return null;
  const { applicant, job } = application;

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setLoading(true);
    try {
      await dispatch(updateApplicationStatusAsync({ 
        applicationId: application._id, 
        status: newStatus, 
        employerNotes: notes 
      })).unwrap();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{applicant.name}</h2>
            <p className="text-xs text-gray-300">Applying for: <span className="text-emerald-400 font-medium">{job.title}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl font-bold px-2 py-1"
          >
            &times;
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
          
          {/* Left Column: Candidate Info & Controls */}
          <div className="p-6 bg-gray-50 border-r border-gray-200 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Contact Info</h3>
              <p className="text-sm text-gray-800">📧 {applicant.email}</p>
              <p className="text-sm text-gray-800 mt-1">📞 {applicant.phone || 'Not provided'}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Professional Links</h3>
              <div className="flex flex-col space-y-1 text-sm">
                {applicant.linkedinUrl && <a href={applicant.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a>}
                {applicant.githubUrl && <a href={applicant.githubUrl} target="_blank" rel="noreferrer" className="text-gray-900 hover:underline">GitHub Repository</a>}
                {applicant.portfolioUrl && <a href={applicant.portfolioUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Portfolio Website</a>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Key Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {applicant.skills?.map((skill, idx) => (
                  <span key={idx} className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Hiring Stage */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Hiring Stage</h3>
              <select 
                value={status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview Scheduled</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Right Column: Robust Resume Viewer / Fallback */}
          <div className="lg:col-span-2 bg-gray-100 flex flex-col h-full overflow-hidden p-4">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="text-sm font-semibold text-gray-700">Resume Document Viewer</h3>
              {applicant.resumeUrl && (
                <a 
                  href={applicant.resumeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition"
                >
                  Download / Open PDF ↗
                </a>
              )}
            </div>
            
            <div className="flex-1 bg-white rounded-lg border border-gray-300 overflow-hidden shadow-inner flex flex-col items-center justify-center">
              {applicant.resumeUrl ? (
                // Use object tag or iframe with direct fallback
                <object 
                  data={`${applicant.resumeUrl}#view=FitH`} 
                  type="application/pdf" 
                  className="w-full h-full"
                >
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-gray-600 mb-4">Your browser doesn't support embedded PDF viewing.</p>
                    <a 
                      href={applicant.resumeUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                    >
                      Click here to open resume in a new tab
                    </a>
                  </div>
                </object>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No resume file uploaded by candidate.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CandidateResumeModal;