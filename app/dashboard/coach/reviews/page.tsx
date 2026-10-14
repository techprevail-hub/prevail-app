
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";

import { getCoachReviews, getCoachReviewsSummary } from "@/services/role-coach/reviews";

import type {
  CoachReview,
  CoachReviewsPagination,
  CoachReviewsSummary,
} from "@/types/role-coach/reviews";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;

const EMPTY_SUMMARY: CoachReviewsSummary = {
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RatingStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const iconSize = size === "md" ? 20 : 16;

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={iconSize}
          className={
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

function RatingDistribution({
  summary,
}: {
  summary: CoachReviewsSummary;
}) {
  const ratings = [5, 4, 3, 2, 1] as const;

  return (
    <div className="space-y-3">
      {ratings.map((rating) => {
        const count = summary.ratingDistribution[rating] ?? 0;

        const percentage =
          summary.totalReviews > 0
            ? (count / summary.totalReviews) * 100
            : 0;

        return (
          <div
            key={rating}
            className="grid grid-cols-[38px_minmax(0,1fr)_32px] items-center gap-3"
          >
            <div className="flex items-center gap-1 text-sm">
              <span>{rating}</span>
              <Star
                size={13}
                className="fill-amber-400 text-amber-400"
              />
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={`${rating} star reviews`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(percentage)}
            >
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="text-right text-sm text-muted-foreground">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CoachReviewsPage() {
  const [reviews, setReviews] = useState<CoachReview[]>([]);
  const [summary, setSummary] =
    useState<CoachReviewsSummary>(EMPTY_SUMMARY);

  const [pagination, setPagination] =
    useState<CoachReviewsPagination>({
      page: 1,
      limit: PAGE_SIZE,
      total: 0,
      totalPages: 0,
    });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search so the API is not called on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Fetch reviews using server-side pagination and filters.
  useEffect(() => {
    let active = true;

    const loadReviews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getCoachReviews({
          page: pagination.page,
          limit: PAGE_SIZE,
          rating:
            rating === "all" ? undefined : Number(rating),
          search: search || undefined,
        });

        if (!response.success) {
          throw new Error(
            response.message || "Unable to fetch reviews"
          );
        }

        if (!active) return;

        setReviews(response.data.reviews ?? []);
        setPagination(response.data.pagination);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching reviews"
        );

        setReviews([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      active = false;
    };
  }, [pagination.page, rating, search, refreshKey]);

  // Fetch summary separately from the list.
  useEffect(() => {
    let active = true;

    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError("");

      try {
        const response = await getCoachReviewsSummary();

        if (!response.success) {
          throw new Error(
            response.message || "Unable to fetch review summary"
          );
        }

        if (active) {
          setSummary(response.data);
        }
      } catch (err) {
        if (active) {
          setSummaryError(
            err instanceof Error
              ? err.message
              : "Unable to load review summary"
          );
        }
      } finally {
        if (active) {
          setSummaryLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  const handleRatingChange = (value: string) => {
    setRating(value);
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const changePage = (nextPage: number) => {
    setPagination((current) => ({
      ...current,
      page: nextPage,
    }));
  };

  const totalPages = pagination.totalPages || 0;
  const currentPage = pagination.page;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reviews
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your client feedback and track your ratings.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading || summaryLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Average Rating
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-semibold">
                  {summaryLoading
                    ? "..."
                    : summary.averageRating.toFixed(1)}
                </span>

                <RatingStars
                  rating={Math.round(summary.averageRating)}
                  size="md"
                />
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Out of 5 stars
              </p>
            </div>

            <div className="rounded-xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Star className="h-6 w-6 fill-current" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Reviews
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {summaryLoading ? "..." : summary.totalReviews}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Reviews received from clients
              </p>
            </div>

            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Rating Distribution
          </CardTitle>
        </CardHeader>

        <CardContent>
          {summaryError ? (
            <p className="text-sm text-destructive">
              {summaryError}
            </p>
          ) : (
            <RatingDistribution summary={summary} />
          )}
        </CardContent>
      </Card>

      {/* Reviews list */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">
                Client Feedback
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Read the feedback clients have shared with you.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search review text..."
                  className="pl-9"
                  aria-label="Search review text"
                />
              </div>

              <Select
                value={rating}
                onValueChange={handleRatingChange}
              >
                <SelectTrigger
                  className="w-full sm:w-40"
                  aria-label="Filter by rating"
                >
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All ratings
                  </SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                  <SelectItem value="4">4 stars</SelectItem>
                  <SelectItem value="3">3 stars</SelectItem>
                  <SelectItem value="2">2 stars</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />

              <div className="flex-1">
                <p className="font-medium">
                  Unable to load reviews
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {error}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                Retry
              </Button>
            </div>
          )}

          {loading && !error ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse space-y-3 border-b pb-5 last:border-0"
                >
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-3 w-28 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : !error && reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="rounded-full bg-muted p-4">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No reviews found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {search || rating !== "all"
                  ? "Try changing your search or rating filter."
                  : "Client reviews will appear here when they are available."}
              </p>

              {(search || rating !== "all") && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setRating("all");
                    setPagination((current) => ({
                      ...current,
                      page: 1,
                    }));
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {(review.client?.name || "C")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {review.client?.name || "Client"}
                        </p>

                        {review.client?.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {review.client.email}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <RatingStars rating={review.rating} />

                          <Badge variant="secondary">
                            {review.rating}/5
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <time
                      dateTime={review.createdAt}
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {formatDate(review.createdAt)}
                    </time>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/80">
                    {review.reviewText?.trim() ||
                      "No written feedback provided."}
                  </p>
                </article>
              ))}
            </div>
          )}

          {/* Server-side pagination */}
          {!error && pagination.total > 0 && (
            <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(
                  currentPage * PAGE_SIZE,
                  pagination.total
                )}{" "}
                of {pagination.total} reviews
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={loading || currentPage <= 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>

                <span className="min-w-20 text-center text-sm">
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={
                    loading ||
                    totalPages === 0 ||
                    currentPage >= totalPages
                  }
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
