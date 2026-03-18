import { useState } from "react";
import { motion } from "motion/react";
import { Camera, Upload, Volume2, Languages, Scan } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { extractTextFromImage } from "../../utils/api";

export function OCRPage() {
  const [hasImage, setHasImage] = useState(false);
  const [targetLang, setTargetLang] = useState("hindi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    originalText: string;
    translatedText: string;
    language: string;
  } | null>(null);

  const languages = [
    "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi", "English"
  ];

  const handleImageUpload = async (file?: File) => {
    setHasImage(true);
    setIsProcessing(true);
    
    try {
      // Python API: OCR + Translation
      if (file) {
        const result = await extractTextFromImage(file, targetLang);
        if (result.success) {
          setOcrResult({
            originalText: result.data?.original_text || "Library",
            translatedText: result.data?.translated_text || "पुस्तकालय",
            language: result.data?.language || "English"
          });
        }
      } else {
        // Mock data for demo
        setOcrResult({
          originalText: "Library",
          translatedText: "पुस्तकालय",
          language: "English"
        });
      }
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1715264500941-27bf30bf46eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWphc3RoYW4lMjBkZXNlcnR8ZW58MXx8fHwxNzYwMTg2NjA4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Rajasthan"
          className="w-full h-full object-cover opacity-5 blur-sm"
        />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">📸 Visual Sign Translator</h1>
          <p className="text-gray-600">Scan and translate text from images</p>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-6 mb-6"
        >
          <label className="block mb-2">Translate to:</label>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.toLowerCase()} value={lang.toLowerCase()}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Upload Area */}
        {!hasImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center mb-6 border-4 border-dashed border-gray-300 hover:border-[#ff6b35] transition-colors cursor-pointer"
            onClick={handleImageUpload}
          >
            <div className="w-24 h-24 gradient-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <h3 className="mb-2">Upload or Capture Image</h3>
            <p className="text-gray-600 mb-6">
              Drop an image here or click to browse
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="gradient-india text-white">
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview with AR Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-6"
            >
              <div className="relative bg-gray-200 rounded-2xl overflow-hidden mb-4" style={{ height: "300px" }}>
                {/* Mock Image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Scan className="w-16 h-16 mx-auto mb-2" />
                    <p>Sample Sign Board</p>
                  </div>
                </div>
                
                {/* AR Overlay */}
                {!isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6"
                  >
                    <div className="text-white">
                      <p className="text-lg">पुस्तकालय</p>
                      <p className="text-sm opacity-80">Library</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Processing Animation */}
                {isProcessing && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/50"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-[#ff6b35] border-t-transparent rounded-full mx-auto mb-4"
                      />
                      <p className="text-white">Processing...</p>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setHasImage(false)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </Button>
                <Button size="sm" className="gradient-india text-white" onClick={() => setIsProcessing(true)}>
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Again
                </Button>
              </div>
            </motion.div>

            {/* OCR Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-4"
            >
              {/* Detected Text */}
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3>Detected Text</h3>
                  <Languages className="w-5 h-5 text-[#0066cc]" />
                </div>
                <div className="bg-white rounded-2xl p-4 mb-4 min-h-[120px] border border-gray-200">
                  <p className="text-lg">{ocrResult?.originalText || "Library"}</p>
                  <p className="text-sm text-gray-500 mt-2">Language: {ocrResult?.language || "English"}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Play Original
                </Button>
              </div>

              {/* Translated Text */}
              <div className="glass rounded-3xl p-6 bg-gradient-to-br from-[#fff5f0] to-white">
                <div className="flex items-center justify-between mb-4">
                  <h3>Translation</h3>
                  <div className="w-3 h-3 rounded-full bg-[#ff6b35] animate-pulse"></div>
                </div>
                <div className="bg-white rounded-2xl p-4 mb-4 min-h-[120px] border border-[#ff6b35]/30">
                  <p className="text-lg">{ocrResult?.translatedText || "पुस्तकालय"}</p>
                  <p className="text-sm text-gray-500 mt-2">Language: {targetLang}</p>
                </div>
                <Button size="sm" className="gradient-india text-white">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Play Translation
                </Button>
              </div>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-3xl p-6"
            >
              <h4 className="mb-4">Processing Pipeline</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                    <span className="text-sm">OCR Extraction</span>
                  </div>
                  <div className="h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                    <span className="text-sm">Translation</span>
                  </div>
                  <div className="h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                    <span className="text-sm">Audio Generation</span>
                  </div>
                  <div className="h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* API Integration Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🔌 <strong>Python Backend:</strong> POST /api/bhashini/ocr (multipart/form-data)
          </p>
        </div>
      </div>
    </div>
  );
}
