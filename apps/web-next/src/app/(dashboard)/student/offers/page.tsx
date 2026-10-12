'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Award, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  FileCheck2, 
  Sparkles, 
  Download,
  AlertCircle
} from 'lucide-react';

export default function StudentOffersPage() {
  const [offers, setOffers] = useState([
    {
      id: 'off-1',
      company: 'TechNova Solutions',
      role: 'Graduate Data Analyst',
      ctc: '₹8.5 LPA',
      offer_date: 'Oct 10, 2026',
      deadline: 'Oct 30, 2026',
      status: 'pending', // 'pending' | 'accepted' | 'declined'
      joining_date: 'July 01, 2027',
      location: 'Bhubaneswar, Odisha',
      documents: [
        { name: 'Degree Provisional Certificate', submitted: true },
        { name: 'Semester Grade Sheets (1-6)', submitted: true },
        { name: 'Signed Offer Letter Copy', submitted: false },
      ],
    },
  ]);

  const handleAccept = (id: string, company: string) => {
    setOffers(prev => prev.map(o => o.id === id ? ({ ...o, status: 'accepted' }) : o));
    toast.success(`Congratulations! You have accepted the offer from ${company}!`);
  };

  const handleDecline = (id: string, company: string) => {
    if (confirm(`Are you sure you want to decline the offer from ${company}?`)) {
      setOffers(prev => prev.map(o => o.id === id ? ({ ...o, status: 'declined' }) : o));
      toast.info(`Offer from ${company} declined.`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Placement Drive Outcomes & Letters</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Placement Offers</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review formal placement letters, compensation packages, acceptance deadlines, and onboarding documentation.
        </p>
      </div>

      {/* Offers Cards */}
      <div className="space-y-6">
        {offers.map(offer => (
          <div
            key={offer.id}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/15 via-slate-900 to-indigo-950/15 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Award className="h-4 w-4" />
                  <span>Official Campus Placement Offer</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">{offer.company}</h2>
                <div className="text-xs text-slate-300 mt-0.5">{offer.role} • {offer.location}</div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                  {offer.ctc}
                </span>
                <div className="text-xs text-slate-400 mt-0.5">Fixed Annual Compensation</div>
              </div>
            </div>

            {/* Offer Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/3 border border-white/6">
                <span className="text-slate-400 block mb-1">Offered On:</span>
                <span className="font-bold text-white">{offer.offer_date}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/3 border border-white/6">
                <span className="text-slate-400 block mb-1">Decision Deadline:</span>
                <span className="font-bold text-amber-300">{offer.deadline}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/3 border border-white/6">
                <span className="text-slate-400 block mb-1">Expected Joining:</span>
                <span className="font-bold text-white">{offer.joining_date}</span>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Onboarding Checklist</h3>
              <div className="space-y-1.5">
                {offer.documents.map(doc => (
                  <div key={doc.name} className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/4 text-xs">
                    <span className="text-slate-300">{doc.name}</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      doc.submitted ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                    }`}>
                      {doc.submitted ? '✓ Submitted' : 'Pending Upload'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                offer.status === 'accepted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : offer.status === 'declined'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                Status: {offer.status === 'pending' ? 'Decision Pending' : offer.status}
              </span>

              {offer.status === 'pending' && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleDecline(offer.id, offer.company)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-white/8 transition-colors"
                  >
                    Decline Offer
                  </button>
                  <button
                    onClick={() => handleAccept(offer.id, offer.company)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    Accept Offer Letter ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
