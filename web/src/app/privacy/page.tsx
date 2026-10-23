import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Lock, MapPin, EyeOff, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DocTimings handles your location, searches and contact details. No accounts, no medical records stored.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-teal-50 border border-teal-100">
              <Image
                src="/icon.svg"
                alt="DocTimings Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">DocTimings</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Privacy Policy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Effective Date: October 18, 2026 · Last updated: October 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>1. Introduction</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              DocTimings (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the DocTimings website, public applications, and partner management systems. Our primary objective is to eliminate queue uncertainty by providing accurate, verified, real-time doctor chamber visiting hours, clinic schedules, and consultation availability across West Bengal and India.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              We are committed to maintaining the highest privacy and transparency standards. This Privacy Policy describes how we handle information across our website and mobile applications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-700" />
              <span>2. No Medical Records or Health Data Collected</span>
            </h2>
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-sm text-teal-950 leading-relaxed">
              <strong>Patient Privacy Guarantee:</strong> DocTimings is strictly a healthcare logistics and timing directory. We do <strong>not</strong> collect, process, store, or sell confidential patient medical charts, prescriptions, diagnostic reports, medical histories, or health insurance information.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>3. Information We Collect</span>
            </h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>Location Data (Optional):</strong> If you grant location permission on your device, we use your approximate geographic coordinates (GPS or network-based) exclusively to display medical chambers and doctors sorted by proximity to your town or subdivision. We do not track your location in the background or store your location history.
              </p>
              <p>
                <strong>Partner &amp; Staff Account Details:</strong> For clinic proprietors, counter staff, and verified doctors accessing our Partner App, we process account credentials including name, business email, mobile phone number, and medical council registration number (e.g., WBMC) to enable verified roster coordination.
              </p>
              <p>
                <strong>Technical Diagnostics:</strong> We may collect standard crash logs, device model information, and operating system versions to ensure app stability and maintain uptime.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-teal-700" />
              <span>4. Public Directory Data</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Doctor profiles, medical qualifications, registration numbers (WBMC), chamber visiting days, shift hours, and consultation fees displayed on the platform are public directory information verified directly with local partner clinics and pharmacies for public health transparency.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>5. Data Sharing &amp; Third Parties</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We never sell, rent, or monetize your personal data. We only share information with trusted infrastructure providers required to operate our services (such as secure cloud databases and application hosting). These providers are legally obligated to protect your data under strict confidentiality agreements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>6. Data Security</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We implement industry-standard encryption protocols (HTTPS/TLS) for data in transit and secure database hashing (bcrypt) for authentication credentials. Authentication tokens expire automatically, and sessions are immediately terminated upon password change or account revocation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>7. User Rights &amp; Account Deletion</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              You have the right to request access, correction, or deletion of your personal or partner account information. To request account deactivation or removal of contact details, please contact us at our dedicated privacy desk.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-700" />
              <span>8. Contact Us</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              If you have any questions or concerns regarding this Privacy Policy or data practices, you can contact our privacy officer:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1">
              <p><strong>DocTimings Healthcare Privacy Desk</strong></p>
              <p>Email: <a href="mailto:support@doctimings.com" className="text-teal-700 font-semibold hover:underline">support@doctimings.com</a> / <a href="mailto:shibudhara147@gmail.com" className="text-teal-700 font-semibold hover:underline">shibudhara147@gmail.com</a></p>
              <p>Region: Paschim Medinipur, West Bengal, India</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} DocTimings. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/privacy" className="text-teal-400 font-medium">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
