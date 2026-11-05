"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  UserRound,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  CalendarCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/utils/apiServices";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import CoachCard, {
  CoachCardSkeleton,
} from "@/components/seeker/coaches/CoachCard";
import CoachDetailPanel from "@/components/seeker/coaches/Coachdetailpanel";
import MyBookings from "@/components/seeker/coaches/MyBookings";

import {
  Coach,
  CoachDirectoryResponse,
  CreateBookingPayload,
  Pagination,
} from "@/types/seeker/coach-types";

const PAGE_SIZE = 12;
const BOOKING_ENDPOINT = "/api/role-seeker/bookings";

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

function unwrapApiResponse<T>(response: any): T {
  const body =
    response?.data && response?.success === undefined
      ? response.data
      : response;

  if (body?.success === false) {
    throw new Error(body.message || "The request failed.");
  }

  return body as T;
}

export default function JobSeekerCoachPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [pagination, setPagination] =
    useState<Pagination>(EMPTY_PAGINATION);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSpecialization, setActiveSpecialization] = useState("All");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showMyBookings, setShowMyBookings] = useState(false);
  const [bookingRefreshKey, setBookingRefreshKey] = useState(0);

  const hasFetched = useRef(false);

  // --------------------------------------------------
  // FETCH COACHES
  // --------------------------------------------------

  const fetchCoaches = useCallback(
    async (pageNumber: number, isRetry = false) => {
      try {
        if (isRetry) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setErrorMessage("");

        const response = await api.get(
          `/api/coaches?page=${pageNumber}&limit=${PAGE_SIZE}`
        );

        const result =
          unwrapApiResponse<CoachDirectoryResponse>(response);

        if (!result?.success) {
          throw new Error(result?.message || "Unable to fetch coaches.");
        }

        setCoaches(Array.isArray(result.data) ? result.data : []);

        setPagination(
          result.pagination || {
            ...EMPTY_PAGINATION,
            page: pageNumber,
          }
        );

        setPage(pageNumber);
      } catch (error: unknown) {
        console.error("Get All Coaches API error:", error);

        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong while loading coaches.";

        setErrorMessage(message);

        if (isRetry) {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;
    void fetchCoaches(1);
  }, [fetchCoaches]);

  const changePage = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === page
    ) {
      return;
    }

    void fetchCoaches(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const retryFetch = () => {
    void fetchCoaches(page, true);
  };

  // --------------------------------------------------
  // CREATE BOOKING
  // --------------------------------------------------

  const handleBookDemo = useCallback(
    async (payload: CreateBookingPayload) => {
      try {
        const response = await api.post(BOOKING_ENDPOINT, payload);

        const result = unwrapApiResponse<{
          success: boolean;
          message?: string;
          data?: unknown;
        }>(response);

        if (!result?.success) {
          throw new Error(
            result?.message || "Unable to create the booking."
          );
        }

        setBookingRefreshKey((current) => current + 1);
      } catch (error: unknown) {
        console.error("Create seeker booking API error:", error);

        throw new Error(
          error instanceof Error
            ? error.message
            : "Unable to create the booking."
        );
      }
    },
    []
  );

  // --------------------------------------------------
  // OPEN COACH DETAILS
  // --------------------------------------------------

  const openCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --------------------------------------------------
  // SPECIALIZATION FILTERS
  // --------------------------------------------------

  const specializations = useMemo(() => {
    const specializationSet = new Set<string>();

    coaches.forEach((coach) => {
      const specialization = coach.profile?.specialization?.trim();

      if (specialization) {
        specializationSet.add(specialization);
      }
    });

    return ["All", ...Array.from(specializationSet).slice(0, 8)];
  }, [coaches]);

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coaches.filter((coach) => {
      if (
        activeSpecialization !== "All" &&
        coach.profile?.specialization?.trim() !== activeSpecialization
      ) {
        return false;
      }

      if (!query) return true;

      const profile = coach.profile;

      const searchableText = [
        coach.name,
        profile?.headline,
        profile?.bio,
        profile?.specialization,
        profile?.qualifications,
        ...(profile?.languages || []),
        ...(coach.services || []).map((service) => service.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [coaches, search, activeSpecialization]);

  const isFiltering =
    !!search.trim() || activeSpecialization !== "All";

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-[60vh] space-y-6 px-4 pb-6 pt-1 md:px-6 md:pt-2 lg:px-8">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <CoachCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (errorMessage && coaches.length === 0) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle size={26} />
          </div>

          <h2 className="text-xl font-semibold">
            Unable to load coaches
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage}
          </p>

          <Button
            onClick={retryFetch}
            disabled={isRefreshing}
            className="mt-5 gap-2 bg-[#6C5CE7] text-white hover:bg-[#5b4bd6]"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-6 pt-1 md:px-6 md:pt-2 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(at_10%_0%,rgba(108,92,231,0.12)_0,transparent_45%),radial-gradient(at_95%_10%,rgba(172,93,0,0.08)_0,transparent_40%),radial-gradient(at_50%_100%,rgba(118,112,171,0.10)_0,transparent_50%)]"
      />

      <AnimatePresence mode="wait">
        {showMyBookings ? (
          // --------------------------------------------------
          // MY BOOKINGS VIEW
          // --------------------------------------------------
          <motion.div
            key="my-bookings-view"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowMyBookings(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="-ml-2 gap-2 rounded-xl text-slate-600 hover:text-[#6C5CE7]"
            >
              <ArrowLeft size={18} />
              Back to coaches
            </Button>

            <MyBookings
              coaches={coaches}
              refreshKey={bookingRefreshKey}
            />
          </motion.div>
        ) : (
          // --------------------------------------------------
          // COACH LIST / DETAIL VIEW
          // --------------------------------------------------
          <motion.div
            key="coach-page-view"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {selectedCoach ? (
              <CoachDetailPanel
                key={`detail-${selectedCoach.id}`}
                coach={selectedCoach}
                onBack={() => setSelectedCoach(null)}
                onBookDemo={handleBookDemo}
              />
            ) : (
              <>
                {/* Header + Search + My Bookings */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Page Heading */}
                  <div className="shrink-0">
                    <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#6C5CE7]/10 px-3 py-1 text-xs font-semibold text-[#6C5CE7]">
                      <Sparkles size={13} />
                      {pagination.total}{" "}
                      {pagination.total === 1 ? "coach" : "coaches"} available
                    </span>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                      Find Your{" "}
                      <span className="text-[#6C5CE7]">Coach</span>
                    </h1>

                    <p className="mt-1.5 max-w-xl text-sm text-[#787680]">
                      Browse coaches, view their services, and book a demo session.
                    </p>
                  </div>

                  {/* Search + My Bookings (same height, vertically centered with heading) */}
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:flex-1 md:justify-end">
                    <div className="relative w-full md:max-w-[340px]">
                      <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787680]"
                      />

                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, skill, language, or service"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:ring-[#6C5CE7]"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        setShowMyBookings(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="h-11 shrink-0 gap-2 whitespace-nowrap rounded-xl bg-[#6C5CE7] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b4bd6]"
                    >
                      <CalendarCheck size={18} />
                      My Bookings
                    </Button>
                  </div>
                </div>

                {/* Specialization Filters */}
                {specializations.length > 2 && (
                  <div className="space-y-3 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_8px_30px_rgba(108,92,231,0.07)] backdrop-blur-xl">
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setActiveSpecialization(item)}
                          className={cn(
                            "max-w-[14rem] truncate rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            activeSpecialization === item
                              ? "border-[#6C5CE7] bg-[#6C5CE7] text-white"
                              : "bg-white text-[#787680] hover:border-[#6C5CE7]/40 hover:text-[#6C5CE7]"
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {errorMessage && coaches.length > 0 && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                    <span>
                      Refresh failed. Showing previously loaded coaches.
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={retryFetch}
                      disabled={isRefreshing}
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Coach Cards */}
                {filteredCoaches.length === 0 ? (
                  <Card className="flex flex-col items-center justify-center rounded-3xl px-5 py-16 text-center">
                    <div className="mb-4 rounded-full bg-[#6C5CE7]/10 p-5 text-[#6C5CE7]">
                      {isFiltering ? (
                        <Search size={30} />
                      ) : (
                        <UserRound size={30} />
                      )}
                    </div>

                    <h2 className="text-lg font-semibold">
                      {isFiltering
                        ? "No coaches match your search"
                        : "No coaches available yet"}
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      {isFiltering
                        ? "Try a different name, skill, language, or service, or clear your filters."
                        : "Coach profiles will appear here once coaches join the platform."}
                    </p>

                    {isFiltering && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearch("");
                          setActiveSpecialization("All");
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </Card>
                ) : (
                  <>
                    <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                      {filteredCoaches.map((coach) => (
                        <CoachCard
                          key={coach.id}
                          coach={coach}
                          onSelect={openCoach}
                        />
                      ))}
                    </div>

                    {pagination.totalPages > 1 && (
                      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white/70 p-4 backdrop-blur-xl sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                          Page{" "}
                          <span className="font-semibold text-foreground">
                            {pagination.page}
                          </span>{" "}
                          of{" "}
                          <span className="font-semibold text-foreground">
                            {pagination.totalPages}
                          </span>
                        </p>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(page - 1)}
                            disabled={page <= 1 || isRefreshing}
                          >
                            <ChevronLeft size={16} />
                            Previous
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(page + 1)}
                            disabled={
                              page >= pagination.totalPages || isRefreshing
                            }
                          >
                            Next
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}