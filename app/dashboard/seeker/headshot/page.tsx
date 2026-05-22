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
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState<HeadshotResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

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
        setHistory(data.data);
        // Show the latest generation
        setResult(data.data[0]);
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
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
    setError("");
  };

  const handleGenerate = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("image", image);
      formData.append("style", style);

      // POST request to the same endpoint
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
        // Refresh history after successful generation
        await fetchHeadshotHistory();
        // Clear the uploaded image after success
        removeImage();
      } else {
        setError(data.message || "Generation failed. Please try again.");
      }
    } catch (error) {
      console.error("Headshot generation error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HeadshotResult) => {
    setResult(item);
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `headshot_${Date.now()}_${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // Safe function to get generated images (handles null)
  const getGeneratedImages = (result: HeadshotResult | null) => {
    return result?.generated_images || [];
  };

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
                {/* Drop Zone - Only show when no image selected */}
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

                {/* Selected Image Preview - Smaller size */}
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

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
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
              disabled={loading || !image}
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
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
            {result && (getGeneratedImages(result).length > 0 || preview) && (
              <Card className="border-gray-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Your Headshot Results
                  </CardTitle>
                  <CardDescription>
                    AI-generated professional headshots based on your upload
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Original Uploaded Image - Show if available */}
                  {result?.original_image_url && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-600" />
                        Original Upload
                      </h3>
                      <div className="relative inline-block">
                        <img
                          referrerPolicy="no-referrer"
                          src={result.original_image_url}
                          alt="Original"
                          className="w-40 h-40 rounded-xl object-cover border-2 border-indigo-200 shadow-md"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Your uploaded photo (for reference)
                      </p>
                    </div>
                  )}

                  {/* AI Generated Images */}
                  {getGeneratedImages(result).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        AI Generated Inspirations
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {getGeneratedImages(result).map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="relative group">
                              <img
                                referrerPolicy="no-referrer"
                                src={item.image_url}
                                alt={`AI Headshot ${index + 1}`}
                                className="w-full aspect-square object-cover rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => downloadImage(item.image_url, index)}
                                  className="bg-white text-gray-900 hover:bg-gray-100"
                                >
                                  <Download className="w-4 h-4 mr-1" />
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
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        ✨ AI-generated inspiration for professional headshots
                      </p>
                    </div>
                  )}

                  {/* Empty state when no images */}
                  {getGeneratedImages(result).length === 0 && !result?.original_image_url && (
                    <div className="text-center py-8">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No results to display</p>
                      <p className="text-sm text-gray-400">Upload a photo and generate headshots</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* History Section */}
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
                      return (
                        <button
                          key={idx}
                          onClick={() => loadHistoryItem(item)}
                          className="w-full text-left p-3 border rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {generatedImages.length > 0 && generatedImages[0] && (
                              <img
                                referrerPolicy="no-referrer"
                                src={generatedImages[0].image_url}
                                alt="Thumbnail"
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {item.style_used || "Headshot"} Style
                              </p>
                              <p className="text-xs text-gray-500">
                                {generatedImages.length} variations
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
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