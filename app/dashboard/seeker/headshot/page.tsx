"use client";

import { useState, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Download, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  X,
  ChevronRight,
  Star,
  Clock,
  Loader2,
  Shield,
  Zap,
  Award,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface GeneratedImage {
  image_url: string;
  style: string;
  created_at?: string;
}

interface HeadshotResult {
  id?: string;
  original_image_url?: string;
  generated_images: GeneratedImage[] | null;
  style_used?: string;
  processing_time?: number;
  created_at?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STYLE = "Professional"; // Fixed style - only Professional

export default function HeadshotPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeadshotResult | null>(null);
  const [error, setError] = useState("");
  const [quotaError, setQuotaError] = useState<{ message: string; resetTime: Date | null } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState<HeadshotResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Fetch history on page load (GET request)
  useEffect(() => {
    fetchHeadshotHistory();
  }, []);

  // Timer for quota reset countdown
  useEffect(() => {
    if (quotaError?.resetTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const resetTime = quotaError.resetTime!;
        
        if (now >= resetTime) {
          setQuotaError(null);
          setTimeRemaining("");
          clearInterval(interval);
        } else {
          const diffMs = resetTime.getTime() - now.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          if (diffHours > 0) {
            setTimeRemaining(`${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
          } else if (diffMinutes > 0) {
            setTimeRemaining(`${diffMinutes}m ${diffSeconds}s`);
          } else {
            setTimeRemaining(`${diffSeconds}s`);
          }
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [quotaError]);

  const fetchHeadshotHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token found, skipping history fetch");
        return;
      }

      const response = await fetch(`${API_URL}/api/headshot`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Sort history by created_at descending (newest first)
        const sortedHistory = [...data.data].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setHistory(sortedHistory);
        // Show the latest generation
        setResult(sortedHistory[0]);
      }
    } catch (err) {
      console.error("Error fetching headshot history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      validateAndSetImage(file);
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const validateAndSetImage = (file: File) => {
    // Validate file size (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maximum image size is 10 MB");
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload JPG, PNG or WEBP image.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
    setQuotaError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetImage(file);
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
    setError("");
    setQuotaError(null);
  };

  const handleGenerate = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setQuotaError(null);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("image", image);
      formData.append("style", STYLE); // Always use "Professional"

      const response = await fetch(`${API_URL}/api/headshot`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        toast.success("Professional headshot generated successfully!");
        await fetchHeadshotHistory();
      } else {
        // Check if it's a quota/rate limit error (429)
        if (response.status === 429 || data.message?.toLowerCase().includes('quota') || data.message?.toLowerCase().includes('rate limit')) {
          // Calculate reset time (tomorrow at midnight local time)
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          
          setQuotaError({
            message: "You have exceeded the free tier limit for today.",
            resetTime: tomorrow
          });
          toast.error("Daily limit exceeded. Please try again tomorrow.");
        } else {
          setError(data.message || "Generation failed. Please try again.");
          toast.error(data.message || "Generation failed");
        }
      }
    } catch (error) {
      console.error("Headshot generation error:", error);
      // Check if error is quota related
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('429')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        setQuotaError({
          message: "You have exceeded the free tier limit for today.",
          resetTime: tomorrow
        });
        toast.error("Daily limit exceeded. Please try again tomorrow.");
      } else {
        setError("Something went wrong. Please try again.");
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HeadshotResult) => {
    setResult(item);
    toast.info(`Loaded ${item.style_used || "Professional"} headshot`);
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      setDownloadingIndex(index);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `professional_headshot_${timestamp}.png`;
      document.body.appendChild(a);
      a.href = url;
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    } finally {
      setDownloadingIndex(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Safe function to get generated images (handles null)
  const getGeneratedImages = (result: HeadshotResult | null) => {
    return result?.generated_images || [];
  };

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
            <div className="h-8 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen ">
      <div className="p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200/50">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Headshot Generator
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Professional
                </Badge>
                <Badge variant="outline" className="border-indigo-200 text-indigo-600">
                  <Shield className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-gray-600 ml-[60px] max-w-2xl">
            Upload your photo and generate a professional AI headshot suitable for LinkedIn, resumes, and job applications.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            {/* Upload Card */}
            <Card className="border-0 shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Upload className="w-5 h-5 text-indigo-600" />
                  </div>
                  Upload Your Photo
                </CardTitle>
                <CardDescription>
                  Upload a clear front-facing photo for best results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!preview && (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                      dragActive
                        ? "border-indigo-400 bg-indigo-50/50 shadow-lg shadow-indigo-100"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-10 h-10 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          Click or drag & drop to upload
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          JPG, PNG, or WEBP (Max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {preview && (
                  <div className="space-y-3 mt-2">
                    <div className="relative inline-block group">
                      <img
                        referrerPolicy="no-referrer"
                        src={preview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-2xl border-2 border-indigo-200 shadow-lg shadow-indigo-100/50 group-hover:border-indigo-400 transition-all"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full hover:scale-110 transition-all shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-emerald-600 flex items-center gap-2 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Photo selected successfully!
                    </p>
                  </div>
                )}

                {/* Upload Instructions */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                  <p className="text-xs text-blue-700 font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    For best results:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-blue-600">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      <span>One person only</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      <span>Face clearly visible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      <span>No sunglasses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      <span>Good lighting</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      <span>Neutral background</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      <span>JPG or PNG, max 10 MB</span>
                    </div>
                  </div>
                </div>

                {/* Regular Error Message */}
                {error && !quotaError && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {/* Quota Error Message */}
                {quotaError && (
                  <div className="mt-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-amber-100 rounded-xl">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-800 mb-1">
                          Daily Limit Reached
                        </p>
                        <p className="text-sm text-amber-700">
                          {quotaError.message}
                        </p>
                        <p className="text-sm text-amber-700 mt-2 font-medium">
                          Please try again in: <span className="font-mono bg-amber-100 px-3 py-1 rounded-lg">{timeRemaining || "Calculating..."}</span>
                        </p>
                        <p className="text-xs text-amber-600 mt-2">
                          ⏰ Resets at midnight (12:00 AM)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !image || !!quotaError}
              className="w-full py-7 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-indigo-200/50 hover:shadow-2xl hover:shadow-indigo-300/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Creating your professional headshot...
                </>
              ) : quotaError ? (
                <>
                  <Clock className="w-5 h-5 mr-3" />
                  Try Again Tomorrow
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3 group-hover:animate-spin" />
                  Generate Professional Headshot
                </>
              )}
            </Button>

            {/* Pro Tips */}
            <Card className="border-0 shadow-xl shadow-amber-100/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {[
                    "Upload a clear front-facing photo",
                    "Avoid sunglasses and face masks",
                    "Use a high-resolution image",
                    "Neutral background gives the best results",
                    "AI preserves your identity while improving lighting and clothing"
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 bg-white/50 rounded-xl hover:bg-white/80 transition-all">
                      <div className="p-1 bg-emerald-100 rounded-full mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-sm text-amber-800 font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results & History */}
          <div className="space-y-6">
            {/* Results Section */}
            {result && (getGeneratedImages(result).length > 0) && (
              <Card className="border-0 shadow-xl shadow-purple-100/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    Your Professional Headshot
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                      Professional
                    </Badge>
                    {result.created_at && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(result.created_at)}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* AI Generated Images */}
                  {getGeneratedImages(result).length > 0 && (
                    <div>
                      {loading ? (
                        <SkeletonLoader />
                      ) : (
                        <div className="flex flex-wrap justify-center gap-6">
                          {getGeneratedImages(result).map((item, index) => (
                            <div 
                              key={index} 
                              className="space-y-3 group w-[220px]"
                              onMouseEnter={() => setHoveredImage(index)}
                              onMouseLeave={() => setHoveredImage(null)}
                            >
                              <div className="relative overflow-hidden rounded-2xl shadow-lg shadow-gray-200/50 group-hover:shadow-xl group-hover:shadow-indigo-200/50 transition-all duration-300">
                                <img
                                  referrerPolicy="no-referrer"
                                  src={item.image_url}
                                  alt={`Professional Headshot ${index + 1}`}
                                  className="w-full h-[280px] object-cover rounded-2xl border-2 border-gray-100 group-hover:border-indigo-300 transition-all duration-300 hover:scale-105"
                                />
                                {/* Overlay with actions */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 flex items-center justify-center ${
                                  hoveredImage === index ? 'opacity-100' : 'opacity-0'
                                }`}>
                                  <Button
                                    size="lg"
                                    onClick={() => downloadImage(item.image_url, index)}
                                    disabled={downloadingIndex === index}
                                    className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all"
                                  >
                                    {downloadingIndex === index ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4 mr-2" />
                                    )}
                                    Download
                                  </Button>
                                </div>
                              </div>
                              <Badge variant="secondary" className="w-full justify-center py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-700 border-0">
                                Professional
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-4 text-center flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        AI-generated professional headshot
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* History Section */}
            <Card className="border-0 shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  Generation History
                </CardTitle>
                <CardDescription>
                  Your previously generated headshots
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">Loading history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No headshot history yet</p>
                    <p className="text-sm text-gray-400">Generate your first headshot above</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {history.map((item, idx) => {
                      const generatedImages = getGeneratedImages(item);
                      const isActive = result?.id === item.id;
                      return (
                        <button
                          key={idx}
                          onClick={() => loadHistoryItem(item)}
                          className={`w-full text-left p-4 border-2 rounded-2xl transition-all ${
                            isActive
                              ? "border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md shadow-indigo-100/50"
                              : "border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {generatedImages.length > 0 && generatedImages[0] && (
                              <div className="relative flex-shrink-0">
                                <img
                                  referrerPolicy="no-referrer"
                                  src={generatedImages[0].image_url}
                                  alt="Thumbnail"
                                  className="w-16 h-16 object-cover rounded-xl border-2 border-gray-100"
                                />
                                {isActive && (
                                  <div className="absolute -top-1 -right-1">
                                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-1.5 py-0.5 border-0">
                                      Current
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  Professional Headshot
                                </p>
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {formatDate(item.created_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs bg-gray-100 border-0">
                                  Professional
                                </Badge>
                                {item.id === result?.id && (
                                  <Badge className="bg-emerald-100 text-emerald-700 text-xs border-0">
                                    Loaded
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              isActive ? "text-indigo-600" : "text-gray-400"
                            }`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>         
        </div>
      </div>
    </div>
  );
}