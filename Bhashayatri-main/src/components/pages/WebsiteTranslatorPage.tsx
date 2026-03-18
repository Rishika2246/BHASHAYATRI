import { useState } from "react";
import { motion } from "motion/react";
import { Globe, ArrowRight, Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";

export function WebsiteTranslatorPage() {
  const [url, setUrl] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("hindi");
  const [translatedUrl, setTranslatedUrl] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!url.trim()) return;

    setIsTranslating(true);

    try {
      // In production, call Python backend to translate website
      // const response = await fetch('/api/translate-website', { ... });
      
      // Mock: Generate translated URL (Google Translate as example)
      const encodedUrl = encodeURIComponent(url);
      const langCode = getGoogleTranslateCode(targetLanguage);
      const mockTranslatedUrl = `https://translate.google.com/translate?sl=auto&tl=${langCode}&u=${encodedUrl}`;
      
      setTimeout(() => {
        setTranslatedUrl(mockTranslatedUrl);
        setIsTranslating(false);
      }, 1500);
    } catch (error) {
      console.error('Translation error:', error);
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTranslated = () => {
    if (translatedUrl) {
      window.open(translatedUrl, '_blank');
    }
  };

  const getGoogleTranslateCode = (lang: string): string => {
    const codes: Record<string, string> = {
      'hindi': 'hi',
      'bengali': 'bn',
      'tamil': 'ta',
      'telugu': 'te',
      'marathi': 'mr',
      'gujarati': 'gu',
      'kannada': 'kn',
      'malayalam': 'ml',
      'punjabi': 'pa',
      'english': 'en',
    };
    return codes[lang] || 'hi';
  };

  const exampleWebsites = [
    { name: 'Tourism Website', url: 'https://www.incredibleindia.org' },
    { name: 'Railway Booking', url: 'https://www.irctc.co.in' },
    { name: 'Government Portal', url: 'https://www.india.gov.in' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1676718912572-b3ebcff192e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW1hbGF5YSUyMG1vdW50YWluc3xlbnwxfHx8fDE3NjAyMTA5MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Mountains"
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
          <h1 className="mb-2">🌐 Website Language Converter</h1>
          <p className="text-gray-600">Translate any website into your preferred language</p>
        </motion.div>

        {/* Main Translator Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 mb-6"
        >
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
            {/* Input URL */}
            <div>
              <label className="block text-sm mb-3">Website URL</label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="rounded-2xl mb-4"
              />
              
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                  <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
                  <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
                  <SelectItem value="marathi">Marathi (मराठी)</SelectItem>
                  <SelectItem value="gujarati">Gujarati (ગુજરાતી)</SelectItem>
                  <SelectItem value="kannada">Kannada (ಕನ್ನಡ)</SelectItem>
                  <SelectItem value="malayalam">Malayalam (മലയാളം)</SelectItem>
                  <SelectItem value="punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <Button
                onClick={handleTranslate}
                disabled={!url.trim() || isTranslating}
                className="gradient-india text-white rounded-full w-16 h-16"
                size="icon"
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Output URL */}
            <div>
              <label className="block text-sm mb-3">Translated Website</label>
              {translatedUrl ? (
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-br from-[#fff5f0] to-white rounded-2xl border border-[#ff6b35]/30">
                    <p className="text-sm break-all">{translatedUrl}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleOpenTranslated}
                      size="sm"
                      className="flex-1 gradient-india text-white rounded-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center text-gray-400">
                  {isTranslating ? 'Translating...' : 'Translated URL will appear here'}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="mb-4">Try These Examples:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {exampleWebsites.map((site, index) => (
              <Card
                key={index}
                className="p-4 glass border-white/30 hover:border-[#ff6b35]/30 transition-all cursor-pointer"
                onClick={() => setUrl(site.url)}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-[#ff6b35]" />
                  <div>
                    <h4 className="text-sm">{site.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{site.url}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#ff6b35]/10 flex items-center justify-center">
                <span className="text-xl">1️⃣</span>
              </div>
              <h4 className="text-sm mb-2">Enter URL</h4>
              <p className="text-xs text-gray-600">
                Paste any website URL you want to translate
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#138808]/10 flex items-center justify-center">
                <span className="text-xl">2️⃣</span>
              </div>
              <h4 className="text-sm mb-2">Select Language</h4>
              <p className="text-xs text-gray-600">
                Choose your preferred language from 10+ options
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#0066cc]/10 flex items-center justify-center">
                <span className="text-xl">3️⃣</span>
              </div>
              <h4 className="text-sm mb-2">Browse Translated</h4>
              <p className="text-xs text-gray-600">
                Access the website in your language instantly
              </p>
            </div>
          </div>
        </motion.div>

        {/* API Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🔌 <strong>Python Backend:</strong> POST /api/translate-website (URL translation + proxy)
          </p>
        </div>
      </div>
    </div>
  );
}
