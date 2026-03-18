import { useState, useRef } from "react";
import { motion } from "motion/react";
import { FileText, Upload, Download, Volume2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner@2.0.3";

export function DocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("hindi");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translated, setTranslated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF, DOCX, DOC, or TXT file");
        return;
      }

      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      setTranslated(false);
      toast.success(`File "${selectedFile.name}" selected`);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    // Simulate file processing
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        setTranslated(true);
        toast.success("Document translated successfully!");
        
        // Play a completion sound
        playCompletionSound();
      }
    }, 300);
  };

  const playCompletionSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleListen = () => {
    const textToSpeak = `Translated document in ${language}. This is a sample translation. Connect the Python backend to get real translations.`;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Set language based on selection
      const langCodes: Record<string, string> = {
        'hindi': 'hi-IN',
        'tamil': 'ta-IN',
        'bengali': 'bn-IN',
        'telugu': 'te-IN',
        'english': 'en-IN',
      };
      utterance.lang = langCodes[language] || 'en-IN';
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(utterance.lang.split('-')[0])
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => {
        toast.success(`Speaking in ${language}...`);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReset = () => {
    setFile(null);
    setProgress(0);
    setIsProcessing(false);
    setTranslated(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">📄 Document Translator</h1>
          <p className="text-gray-600">Translate PDFs and documents instantly</p>
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 mb-6"
        >
          <label className="block text-sm mb-2">Target Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
              <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
              <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
              <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {!isProcessing && !translated ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center border-4 border-dashed border-gray-300"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            {!file ? (
              <>
                <div className="w-24 h-24 gradient-saffron rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                <h3 className="mb-2">Upload Document</h3>
                <p className="text-gray-600 mb-6">PDF, DOCX, DOC, TXT up to 10MB</p>
                <Button 
                  className="gradient-india text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="mb-2">File Selected</h3>
                <p className="text-gray-600 mb-2">{file.name}</p>
                <p className="text-sm text-gray-500 mb-6">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    className="gradient-india text-white"
                    onClick={handleUpload}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Translate Document
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleReset}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        ) : isProcessing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass rounded-3xl p-8 mb-6">
              <h3 className="mb-6">Processing Document</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Extracting Text...</span>
                    <span className="text-sm text-[#ff6b35]">{progress >= 33 ? "✓" : "..."}</span>
                  </div>
                  <Progress value={Math.min(progress, 33) * 3} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Translating...</span>
                    <span className="text-sm text-[#ff6b35]">{progress >= 66 ? "✓" : "..."}</span>
                  </div>
                  <Progress value={Math.max(0, Math.min(progress - 33, 33)) * 3} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Generating Audio...</span>
                    <span className="text-sm text-[#ff6b35]">{progress >= 100 ? "✓" : "..."}</span>
                  </div>
                  <Progress value={Math.max(0, progress - 66) * 3} />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="glass rounded-3xl p-6">
              <h4 className="mb-4">Original (English)</h4>
              <div className="bg-white rounded-2xl p-4 h-64 overflow-y-auto border">
                <p className="text-sm">
                  Sample travel brochure content about visiting incredible destinations across India. 
                  Discover ancient temples, pristine beaches, majestic mountains, and vibrant cities. 
                  Experience the rich cultural heritage, delicious cuisine, and warm hospitality. 
                  Connect the Python backend to process real documents with Bhashini OCR and translation APIs.
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="glass rounded-3xl p-6 bg-gradient-to-br from-[#fff5f0] to-white">
              <h4 className="mb-4">Translation ({language})</h4>
              <div className="bg-white rounded-2xl p-4 h-64 overflow-y-auto border border-[#ff6b35]/30">
                <p className="text-sm">
                  {language === 'hindi' && 'भारत भर में अविश्वसनीय गंतव्यों की यात्रा के बारे में नमूना यात्रा विवरणिका सामग्री।'}
                  {language === 'tamil' && 'இந்தியா முழுவதும் அற்புதமான இடங்களுக்கு வருகை தரும் மாதிரி பயண விளம்பரப்புத்தக உள்ளடக்கம்.'}
                  {language === 'bengali' && 'ভারত জুড়ে অবিশ্বাস্য গন্তব্য পরিদর্শন সম্পর্কে নমুনা ভ্রমণ ব্রোশিওর সামগ্রী।'}
                  {language === 'telugu' && 'భారతదేశం అంతటా అద్భుతమైన గమ్యస్థానాలను సందర్శించడం గురించి నమూనా ప్రయాణ బ్రోచర్ కంటెంట్.'}
                  {language === 'english' && 'Sample travel brochure content about visiting incredible destinations...'}
                  <br /><br />
                  प्राचीन मंदिरों, प्राचीन समुद्र तटों, राजसी पहाड़ों और जीवंत शहरों की खोज करें...
                  <br /><br />
                  (Connect Python backend for real translation)
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  className="gradient-india text-white"
                  onClick={handleListen}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  New Document
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🔌 <strong>Backend Integration:</strong> /document/upload → /bhashini/ocr → /bhashini/mt → /bhashini/tts
          </p>
        </div>
      </div>
    </div>
  );
}
