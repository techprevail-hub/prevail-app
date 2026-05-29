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
  User,
  ZoomIn,
  Loader2
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

export default function HeadshotPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [style, setStyle] = useState("Professional");
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

  // Available styles
  const STYLES = [
    { name: "Professional", icon: "💼", description: "Corporate and business ready" },
    { name: "Corporate", icon: "🏢", description: "Executive presence" },
    { name: "LinkedIn", icon: "🔗", description: "Optimized for LinkedIn" },
    { name: "Student", icon: "🎓", description: "Fresh and approachable" },
    { name: "Creative", icon: "🎨", description: "Artistic and unique" },
    { name: "Casual", icon: "👕", description: "Relaxed and natural" },
  ];

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
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
      setQuotaError(null);
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
      setQuotaError(null);
    } else {
      setError("Please upload a valid image file.");
    }
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
      formData.append("style", style);

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
        toast.success("Headshots generated successfully!");
        await fetchHeadshotHistory();
        // Don't remove the image - keep it in the selected image box
        // removeImage(); // Removed this line
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
    toast.info(`Loaded ${item.style_used || "headshot"} style`);
  };

  const downloadImage = async (imageUrl: string, index: number, styleName: string) => {
    try {
      setDownloadingIndex(index);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `headshot_${styleName.toLowerCase()}_${timestamp}.png`;
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Headshot Generator</h1>
          </div>
          <p className="text-gray-500 ml-12">
            Upload a selfie and let AI generate professional headshots in your preferred style
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            {/* Upload Card */}
            <Card className="border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
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
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      dragActive
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
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
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        referrerPolicy="no-referrer"
                        src={preview}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-xl border-2 border-indigo-200 shadow-lg"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Photo selected successfully!
                    </p>
                  </div>
                )}

                {/* Regular Error Message */}
                {error && !quotaError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Quota Error Message - Clean & User Friendly */}
                {quotaError && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
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
                          Please try again in: <span className="font-mono bg-amber-100 px-2 py-0.5 rounded">{timeRemaining || "Calculating..."}</span>
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

            {/* Style Selection Card */}
            <Card className="border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Select Style
                </CardTitle>
                <CardDescription>
                  Choose a style that matches your professional needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {STYLES.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setStyle(s.name)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        style === s.name
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{s.icon}</span>
                        <span className="font-semibold text-gray-900">{s.name}</span>
                        {style === s.name && (
                          <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{s.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !image || !!quotaError}
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : quotaError ? (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Try Again Tomorrow
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Headshots
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Results & History */}
          <div className="space-y-6">
            {/* Results Section */}
            {result && (getGeneratedImages(result).length > 0) && (
              <Card className="border-gray-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Your Headshot Results
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {result.style_used || style}
                    </Badge>
                    {result.created_at && (
                      <span className="text-xs text-gray-500">
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
                        <div className="flex flex-wrap justify-center gap-4">
                          {getGeneratedImages(result).map((item, index) => (
                            <div 
                              key={index} 
                              className="space-y-2 group w-[220px]"
                              onMouseEnter={() => setHoveredImage(index)}
                              onMouseLeave={() => setHoveredImage(null)}
                            >
                              <div className="relative overflow-hidden rounded-xl">
                                <img
                                  referrerPolicy="no-referrer"
                                  src={item.image_url}
                                  alt={`AI Headshot ${index + 1}`}
                                  className="w-full h-[260px] object-cover rounded-xl border-2 border-gray-200 group-hover:border-indigo-300 transition-all duration-300 hover:scale-[1.02]"
                                />
                                {/* Overlay with actions */}
                                <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 flex items-center justify-center gap-2 ${
                                  hoveredImage === index ? 'opacity-100' : 'opacity-0'
                                }`}>
                                  <Button
                                    size="sm"
                                    onClick={() => downloadImage(item.image_url, index, item.style || result.style_used || style)}
                                    disabled={downloadingIndex === index}
                                    className="bg-white text-gray-900 hover:bg-gray-100"
                                  >
                                    {downloadingIndex === index ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4 mr-1" />
                                    )}
                                    Download
                                  </Button>
                                </div>
                              </div>
                              <Badge variant="secondary" className="w-full justify-center">
                                {item.style || result.style_used || style}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        ✨ AI-generated inspiration for professional headshots
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* History Section - Improved */}
            <Card className="border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
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
                    <p className="text-gray-500">No headshot history yet</p>
                    <p className="text-sm text-gray-400">Generate your first headshot above</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((item, idx) => {
                      const generatedImages = getGeneratedImages(item);
                      const isActive = result?.id === item.id;
                      return (
                        <button
                          key={idx}
                          onClick={() => loadHistoryItem(item)}
                          className={`w-full text-left p-3 border rounded-xl transition-all ${
                            isActive
                              ? "border-indigo-400 bg-indigo-50 shadow-md"
                              : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {generatedImages.length > 0 && generatedImages[0] && (
                              <div className="relative">
                                <img
                                  referrerPolicy="no-referrer"
                                  src={generatedImages[0].image_url}
                                  alt="Thumbnail"
                                  className="w-14 h-14 object-cover rounded-lg"
                                />
                                {isActive && (
                                  <div className="absolute -top-1 -right-1">
                                    <Badge className="bg-indigo-600 text-white text-[10px] px-1">
                                      Current
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.style_used || "Headshot"} Style
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(item.created_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {generatedImages.length} variation{generatedImages.length !== 1 ? 's' : ''}
                                </Badge>
                                {item.id === result?.id && (
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    Loaded
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-colors ${
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

            {/* Tips Card */}
            <Card className="border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Star className="w-5 h-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    Use a well-lit, front-facing photo
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    Avoid busy backgrounds or sunglasses
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    Professional style works best for corporate jobs
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    Creative style is perfect for design roles
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    Results are AI-generated inspirations, not face-preserved edits
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>         
        </div>
      </div>
    </div>
  );
}