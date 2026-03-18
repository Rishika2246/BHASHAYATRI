import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { WifiOff, Search, Clock, Download, Trash2, FileText, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  getOfflineQueries,
  getCachedTranslations,
  searchOfflineQueries,
  getOfflineStats,
  getOfflineSuggestions,
  clearOfflineData,
  exportOfflineData,
  OfflineQuery,
  CachedTranslation,
} from "../../utils/offline";

export function OfflinePage() {
  const [queries, setQueries] = useState<OfflineQuery[]>([]);
  const [translations, setTranslations] = useState<CachedTranslation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(getOfflineStats());
  const [activeTab, setActiveTab] = useState<'queries' | 'translations'>('queries');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setQueries(getOfflineQueries());
    setTranslations(getCachedTranslations());
    setStats(getOfflineStats());
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = searchOfflineQueries(term);
      setQueries(results);
    } else {
      setQueries(getOfflineQueries());
    }
  };

  const handleClearData = () => {
    if (confirm('Clear all offline data? This cannot be undone.')) {
      clearOfflineData();
      loadData();
    }
  };

  const handleExportData = () => {
    const data = exportOfflineData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhashayatri-offline-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXJhbGElMjBiYWNrd2F0ZXJzfGVufDF8fHx8MTc2MDIxMDkwMHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Kerala"
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
          <h1 className="mb-2 flex items-center justify-center gap-2">
            <WifiOff className="w-8 h-8 text-[#ff6b35]" />
            Offline Assistant
          </h1>
          <p className="text-gray-600">Access your saved queries and translations offline</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ff6b35]/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-[#ff6b35]" />
              </div>
              <div>
                <p className="text-2xl">{stats.totalQueries}</p>
                <p className="text-sm text-gray-600">Saved Queries</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#138808]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#138808]" />
              </div>
              <div>
                <p className="text-2xl">{stats.totalTranslations}</p>
                <p className="text-sm text-gray-600">Translations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0066cc]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#0066cc]" />
              </div>
              <div>
                <p className="text-sm">Last Updated</p>
                <p className="text-xs text-gray-600">
                  {stats.lastUpdated
                    ? new Date(stats.lastUpdated).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search & Actions */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex gap-2 mb-4">
            <Input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search offline data..."
              className="flex-1 rounded-full"
            />
            <Button
              onClick={handleExportData}
              variant="outline"
              className="rounded-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleClearData}
              variant="destructive"
              className="rounded-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab('queries')}
              variant={activeTab === 'queries' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full ${
                activeTab === 'queries' ? 'gradient-india text-white' : ''
              }`}
            >
              💬 Queries ({queries.length})
            </Button>
            <Button
              onClick={() => setActiveTab('translations')}
              variant={activeTab === 'translations' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full ${
                activeTab === 'translations' ? 'gradient-india text-white' : ''
              }`}
            >
              🔤 Translations ({translations.length})
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[500px] glass rounded-3xl p-6">
          {activeTab === 'queries' && (
            <div className="space-y-4">
              {queries.length === 0 ? (
                <div className="text-center py-12">
                  <WifiOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2">No offline queries yet</h3>
                  <p className="text-gray-600">
                    Your chat queries will be saved automatically for offline access
                  </p>
                </div>
              ) : (
                queries.map((query) => (
                  <motion.div
                    key={query.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {query.language}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(query.timestamp)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Query:</p>
                      <p>{query.query}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#fff5f0] to-white rounded-xl p-3">
                      <p className="text-sm text-gray-600 mb-1">Response:</p>
                      <p className="text-sm">{query.response}</p>
                    </div>

                    {query.location && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{query.location}</span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'translations' && (
            <div className="space-y-3">
              {translations.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2">No cached translations</h3>
                  <p className="text-gray-600">
                    Translations will be cached automatically for faster access
                  </p>
                </div>
              ) : (
                translations.map((trans) => (
                  <motion.div
                    key={trans.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {trans.sourceLanguage}
                        </Badge>
                        <span>→</span>
                        <Badge className="gradient-india text-white text-xs">
                          {trans.targetLanguage}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(trans.timestamp)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Original:</p>
                        <p className="text-sm">{trans.originalText}</p>
                      </div>
                      <div className="bg-gradient-to-br from-[#fff5f0] to-white rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Translation:</p>
                        <p className="text-sm">{trans.translatedText}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </ScrollArea>

        {/* Offline Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 glass rounded-2xl p-6"
        >
          <h3 className="mb-4">💡 Suggested based on your history</h3>
          <div className="flex flex-wrap gap-2">
            {getOfflineSuggestions().map((suggestion, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-white rounded-full text-sm border border-gray-200 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>

        {/* API Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-800">
            💾 All data is stored locally in your browser for offline access
          </p>
        </div>
      </div>
    </div>
  );
}
