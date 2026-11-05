
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Languages,
  User,
  Award,
  Layers,
  Clock,
  Users,
  Video,
  CalendarCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoachAvatar } from "@/components/seeker/coaches/CoachCard";
import BookDemoDialog from "@/components/seeker/coaches/Bookdemodialog";

import {
  Coach,
  CoachService,
  CreateBookingPayload,
  formatPrice,
  formatSessionType,
  isGroupSession,
} from "@/types/seeker/coach-types";

// --------------------------------------------------
// SERVICE CARD
// --------------------------------------------------

function ServiceCard({
  service,
  onBookDemo,
}: {
  service: CoachService;
  onBookDemo: (service: CoachService) => void;
}) {
  const group = isGroupSession(service.sessionType);
  const price = formatPrice(service);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(108,92,231,0.07)] backdrop-blur-xl transition-shadow hover:shadow-[0_14px_40px_rgba(108,92,231,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
          {group ? <Users size={18} /> : <Video size={18} />}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            price === "Free"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-[#AC5D00]/10 text-[#AC5D00]"
          }`}
        >
          {price}
        </span>
      </div>

      <h3 className="mt-4 break-words text-base font-bold text-slate-900">
        {service.name}
      </h3>

      <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-6 text-[#787680]">
        {service.description || "No description provided for this service."}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[#787680]">
        <span className="inline-flex items-center gap-1.5">
          {group ? <Users size={13} /> : <Video size={13} />}
          {formatSessionType(service.sessionType)}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} />
          {service.durationMinutes} min
        </span>
      </div>

      <Button
        type="button"
        onClick={() => onBookDemo(service)}
        className="mt-5 w-full gap-2 rounded-xl bg-[#6C5CE7] text-white hover:bg-[#5b4bd6]"
      >
        <CalendarCheck size={16} />
        Book demo session
      </Button>
    </div>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const MESH_STYLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(at 15% 20%, rgba(108,92,231,0.35) 0, transparent 55%), radial-gradient(at 85% 25%, rgba(172,93,0,0.18) 0, transparent 55%), radial-gradient(at 50% 110%, rgba(118,112,171,0.30) 0, transparent 60%)",
};

// --------------------------------------------------
// PROPS
// --------------------------------------------------

interface CoachDetailPanelProps {
  coach: Coach;
  onBack: () => void;
  onBookDemo: (payload: CreateBookingPayload) => Promise<void>;
}

// --------------------------------------------------
// INFO CARD
// --------------------------------------------------

function InfoCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(108,92,231,0.07)] backdrop-blur-xl ${className}`}
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="text-[#6C5CE7]">{icon}</span>
        {title}
      </h3>

      {children}
    </section>
  );
}

// --------------------------------------------------
// COACH DETAIL PANEL
// --------------------------------------------------

export default function CoachDetailPanel({
  coach,
  onBack,
  onBookDemo,
}: CoachDetailPanelProps) {
  const [selectedService, setSelectedService] =
    useState<CoachService | null>(null);

  const profile = coach.profile;
  const services = coach.services || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="-ml-2 h-8 gap-2 text-[#787680]"
      >
        <ArrowLeft size={16} />
        All coaches
      </Button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-[0_12px_40px_rgba(108,92,231,0.12)] backdrop-blur-xl">
        <div className="h-12 md:h-14" style={MESH_STYLE} />

        <div className="-mt-8 flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end md:justify-between md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <CoachAvatar
              name={coach.name}
              src={profile?.profileImageUrl}
              className="h-20 w-20 text-2xl"
            />

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                {coach.name}
              </h1>

              <p className="mt-1 max-w-xl text-sm text-[#787680]">
                {profile?.headline || "Professional Coach"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {!!profile?.experienceYears && (
                  <Badge variant="secondary" className="rounded-full">
                    {profile.experienceYears}{" "}
                    {profile.experienceYears === 1 ? "year" : "years"}{" "}
                    experience
                  </Badge>
                )}

                <Badge variant="outline" className="rounded-full">
                  {services.length}{" "}
                  {services.length === 1 ? "service" : "services"}
                </Badge>
              </div>
            </div>
          </div>

          {profile?.linkedinUrl && (
            <Button
              asChild
              variant="outline"
              className="gap-2 self-start rounded-xl md:self-auto"
            >
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <User size={16} />
                LinkedIn
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Bento info */}
      <div className="grid gap-5 md:grid-cols-3">
        <InfoCard
          icon={<BookOpen size={16} />}
          title="About"
          className="md:col-span-2"
        >
          <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
            {profile?.bio || "This coach has not added a biography yet."}
          </p>
        </InfoCard>

        <div className="space-y-5">
          <InfoCard
            icon={<BriefcaseBusiness size={16} />}
            title="Specialization"
          >
            <p className="text-sm font-medium text-slate-800">
              {profile?.specialization || "Not specified"}
            </p>
          </InfoCard>

          {profile?.qualifications && (
            <InfoCard
              icon={<GraduationCap size={16} />}
              title="Qualifications"
            >
              <p className="text-sm text-slate-600">
                {profile.qualifications}
              </p>
            </InfoCard>
          )}

          {!!profile?.languages?.length && (
            <InfoCard icon={<Languages size={16} />} title="Languages">
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((language) => (
                  <Badge
                    key={language}
                    variant="outline"
                    className="rounded-full"
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Layers size={18} className="text-[#6C5CE7]" />

          <h2 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
            Available <span className="text-[#6C5CE7]">Services</span>
          </h2>
        </div>

        {services.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-white/60 p-10 text-center">
            <Award size={26} className="mx-auto mb-3 text-[#787680]" />

            <p className="text-sm text-[#787680]">
              This coach has no active services yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBookDemo={setSelectedService}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking dialog uses the backend availability and booking APIs */}
      <BookDemoDialog
        coach={coach}
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onConfirm={onBookDemo}
      />
    </motion.div>
  );
}
