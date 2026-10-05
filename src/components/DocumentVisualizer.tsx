'use client';

import React from 'react';
import { FileText, ShieldAlert, Stamp, AlertOctagon } from 'lucide-react';

interface DocumentVisualizerProps {
  letterId: string;
  onClose: () => void;
}

export function DocumentVisualizer({ letterId, onClose }: DocumentVisualizerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header bar */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Original Scanned Letter Facsimile</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            ✕ Close Preview
          </button>
        </div>

        {/* Paper Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-amber-50/30 font-serif text-slate-800 text-xs sm:text-sm leading-relaxed border-8 border-slate-100/80 m-3 rounded-lg shadow-inner">
          {letterId === 'eviction' && (
            <div className="space-y-4">
              {/* Header Letterhead */}
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-sans font-black text-base text-slate-900 tracking-tight">GREENFIELD PROPERTY MANAGEMENT</h3>
                  <p className="text-[10px] font-sans text-slate-500">1200 Congress Avenue, Suite 400 · Austin, TX 78701 · (512) 555-0147</p>
                </div>
                <div className="border-2 border-red-600 text-red-600 px-2 py-1 text-[11px] font-sans font-black rotate-[-4deg] uppercase tracking-widest">
                  3-Day Demand
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500 font-sans">September 28, 2026</div>

              <div className="bg-slate-100 p-2.5 rounded font-sans text-[11px] text-slate-700 space-y-0.5">
                <p><strong>TO:</strong> Resident(s) of Apt 4B, 2847 Riverside Drive, Austin, TX 78741</p>
                <p><strong>FROM:</strong> Riverside Apartments Management, LLC / Greenfield Property Management</p>
                <p><strong>RE:</strong> NOTICE TO VACATE PREMISES — NONPAYMENT OF RENT</p>
              </div>

              <div className="text-center py-2">
                <h2 className="font-sans font-black text-red-700 text-base tracking-wider uppercase underline">
                  NOTICE TO VACATE
                </h2>
                <p className="text-[10px] font-sans text-slate-500 uppercase">Texas Property Code § 24.005</p>
              </div>

              <p>
                PLEASE TAKE NOTICE that pursuant to Texas Property Code § 24.005, your right of possession to the above described premises is hereby terminated due to failure to pay rent in accordance with your residential lease contract.
              </p>

              <div className="border border-slate-300 p-3 bg-white space-y-1 font-sans text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span>September 2026 Base Rent:</span>
                  <span className="font-mono font-bold">$1,450.00</span>
                </div>
                <div className="flex justify-between border-b py-1 text-slate-600">
                  <span>Late Fee Assessment (Sept 5):</span>
                  <span className="font-mono">$125.00</span>
                </div>
                <div className="flex justify-between border-b py-1 text-slate-600">
                  <span>Notice Delivery Fee:</span>
                  <span className="font-mono">$50.00</span>
                </div>
                <div className="flex justify-between pt-1 font-black text-red-700 text-sm">
                  <span>TOTAL IMMEDIATE BALANCE:</span>
                  <span className="font-mono">$1,625.00</span>
                </div>
              </div>

              <p>
                You are hereby required to vacate and surrender possession of the premises to management within <strong>THREE (3) DAYS</strong> of the delivery of this notice. Failure to vacate will result in an immediate Forcible Detainer suit filed in the <strong>Justice of the Peace Court, Precinct 3, Travis County, Texas</strong>.
              </p>

              <div className="pt-4 flex justify-between items-end border-t border-slate-300 font-sans text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Method of Service: [X] Hand-Delivered</p>
                  <p className="font-bold text-slate-800">Rachel Torres, CAM</p>
                  <p className="text-[10px] text-slate-500">Property Manager, Greenfield PM</p>
                </div>
                <div className="border border-slate-400 px-3 py-1 text-[10px] text-center font-mono">
                  COURT ID: JP3-2026-NT
                </div>
              </div>
            </div>
          )}

          {letterId === 'utility' && (
            <div className="space-y-4">
              <div className="border-b-2 border-blue-900 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-sans font-black text-lg text-blue-900 tracking-tight">AUSTIN ENERGY</h3>
                  <p className="text-[10px] font-sans text-slate-500">City of Austin Electric Utility · P.O. Box 2267 · Austin, TX 78768</p>
                </div>
                <div className="bg-red-600 text-white font-sans text-[10px] font-bold px-2 py-1 rounded">
                  FINAL NOTICE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-2.5 rounded font-sans text-[11px]">
                <div>
                  <p className="text-slate-500 text-[10px]">ACCOUNT NUMBER</p>
                  <p className="font-mono font-bold">AE-7829-4451-03</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">SERVICE ADDRESS</p>
                  <p className="font-bold">5612 Manor Rd, Apt 12</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">NOTICE ISSUE DATE</p>
                  <p className="font-bold">September 30, 2026</p>
                </div>
                <div className="text-red-700">
                  <p className="text-[10px] font-bold">DISCONNECTION DATE</p>
                  <p className="font-black font-mono text-xs">OCTOBER 7, 2026</p>
                </div>
              </div>

              <div className="text-center py-1">
                <h2 className="font-sans font-black text-red-700 text-sm tracking-wide uppercase">
                  DISCONNECTION OF SERVICE WARNING
                </h2>
              </div>

              <p>
                Our records indicate that your utility account is past due. To prevent interruption of electrical service, the total past-due balance of <strong>$340.10</strong> must be received prior to 8:00 AM on <strong>October 7, 2026</strong>.
              </p>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded font-sans text-xs space-y-1">
                <p className="font-bold text-amber-900">Assistance Programs Available:</p>
                <p className="text-amber-800 text-[11px]">
                  If you are unable to pay, call (512) 494-9400 immediately to inquire about payment arrangements, the Customer Assistance Program (CAP) discount, or Plus-1 emergency funds.
                </p>
              </div>

              <p className="text-[11px] text-slate-500">
                Notice: Disconnected accounts are subject to a $45.00 reconnection fee and may require an additional security deposit before service is restored.
              </p>
            </div>
          )}

          {letterId === 'benefits' && (
            <div className="space-y-4">
              <div className="border-b-2 border-emerald-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-sans font-black text-base text-emerald-900 tracking-tight">TEXAS HEALTH AND HUMAN SERVICES</h3>
                  <p className="text-[10px] font-sans text-slate-500">Access and Eligibility Services · 4900 N. Lamar Blvd · Austin, TX 78751</p>
                </div>
                <div className="bg-emerald-100 text-emerald-800 font-sans text-[10px] font-bold px-2 py-1 rounded">
                  CASE: TX-2026-847291
                </div>
              </div>

              <div className="text-center py-2 bg-red-50 border border-red-200 rounded">
                <h2 className="font-sans font-black text-red-800 text-sm uppercase">
                  ACTION REQUIRED: YOUR BENEFITS ARE EXPIRING
                </h2>
                <p className="text-[11px] font-sans text-red-700">SNAP & Medicaid Recertification Notice</p>
              </div>

              <p>
                Dear <strong>Maria Santos</strong>: Your certification period for Supplemental Nutrition Assistance Program (SNAP) benefits ($485/mo) and Medicaid coverage will expire on <strong>October 31, 2026</strong>.
              </p>

              <div className="border border-slate-300 p-3 bg-white font-sans text-xs space-y-2">
                <p className="font-bold text-slate-800">Required Deadlines:</p>
                <div className="space-y-1 text-[11px]">
                  <p>1. <strong>Mandatory Phone Interview:</strong> October 10, 2026 at 2:30 PM (We will call you)</p>
                  <p>2. <strong>Paperwork Due Date:</strong> October 15, 2026 (Submit pay stubs & residence proof)</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-600">
                Failure to complete your renewal by October 15, 2026 will result in permanent case closure on November 1, 2026. Submit documents online at <strong>YourTexasBenefits.com</strong> or call <strong>2-1-1</strong>.
              </p>
            </div>
          )}

          {letterId === 'medical' && (
            <div className="space-y-4">
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-sans font-black text-base text-slate-900 tracking-tight">ST. DAVID&apos;S HEALTHCARE</h3>
                  <p className="text-[10px] font-sans text-slate-500">Patient Financial Services · P.O. Box 90422 · Austin, TX 78709</p>
                </div>
                <div className="text-right font-sans text-[11px]">
                  <p className="text-slate-400">STATEMENT DATE</p>
                  <p className="font-bold">09/20/2026</p>
                </div>
              </div>

              <div className="bg-slate-100 p-2.5 rounded font-sans text-[11px] flex justify-between">
                <div>
                  <p className="text-slate-500 text-[10px]">PATIENT NAME</p>
                  <p className="font-bold">James R. Nguyen</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">ACCOUNT / CLAIM</p>
                  <p className="font-mono">SDM-2026-09-41872</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">PAYMENT DUE</p>
                  <p className="font-bold text-red-700">10/20/2026</p>
                </div>
              </div>

              <table className="w-full font-sans text-[11px] border border-slate-200">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-1.5">Description</th>
                    <th className="text-right p-1.5">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-1.5">Emergency Department Evaluation</td>
                    <td className="text-right p-1.5 font-mono">$3,847.00</td>
                  </tr>
                  <tr className="bg-red-50 text-red-900">
                    <td className="p-1.5 font-bold">CT Scan Abdomen w/ Contrast (Denied: Prior Auth)</td>
                    <td className="text-right p-1.5 font-mono font-bold">$2,215.00</td>
                  </tr>
                  <tr>
                    <td className="p-1.5">Physician & Lab Services</td>
                    <td className="text-right p-1.5 font-mono">$1,673.00</td>
                  </tr>
                  <tr className="font-bold border-t-2">
                    <td className="p-1.5">Insurance Adjustments & Payments</td>
                    <td className="text-right p-1.5 font-mono text-emerald-700">-$5,550.00</td>
                  </tr>
                  <tr className="font-black text-sm bg-slate-50 border-t">
                    <td className="p-1.5">TOTAL PATIENT RESPONSIBILITY</td>
                    <td className="text-right p-1.5 font-mono text-red-700">$2,185.00</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-[11px] text-slate-500 italic">
                Notice: Emergency room services cannot legally be denied for prior authorization under the Emergency Medical Treatment & Labor Act (EMTALA). You have the right to appeal this denial with Blue Cross Blue Shield.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
          <span>Austin, Texas Community Archive</span>
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-800 font-bold"
          >
            Done Viewing Document
          </button>
        </div>
      </div>
    </div>
  );
}
