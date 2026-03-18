import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, Calendar, DollarSign, Volume2, Send, Clock, Utensils, Hotel,
  Plane, Car, Camera, ShoppingBag, Heart, Star, TrendingUp, Users,
  Download, Share2, Plus, Trash2, Edit, Check, X, Sun, Cloud,
  Sparkles, Zap, Map, Navigation, AlertCircle, Bookmark, Info
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Progress } from "../ui/progress";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { toast } from "sonner@2.0.3";
import { generateItinerary } from "../../utils/api";

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  type: "attraction" | "food" | "hotel" | "transport" | "shopping" | "activity";
  cost: number;
  duration: number;
  description?: string;
  imageUrl?: string;
  rating?: number;
  bookingUrl?: string;
  notes?: string;
  completed?: boolean;
}

interface DayPlan {
  day: number;
  date: string;
  title: string;
  weather?: { temp: number; condition: string; icon: string };
  activities: Activity[];
  totalCost: number;
  totalDuration: number;
}

interface TripPlan {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  spentBudget: number;
  travelers: number;
  preferences: string[];
  days: DayPlan[];
  savedPlaces: SavedPlace[];
}

interface SavedPlace {
  id: string;
  name: string;
  type: string;
  rating: number;
  cost: number;
}

export function TripPlannerPage() {
  // Form States
  const [destination, setDestination] = useState("Jaipur");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [budget, setBudget] = useState(25000);
  const [travelers, setTravelers] = useState(2);
  const [preferences, setPreferences] = useState<string[]>(["culture", "food"]);
  
  // Trip States
  const [currentTrip, setCurrentTrip] = useState<TripPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  
  // UI States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "map" | "budget">("timeline");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Budget Tracking
  const [customExpenses, setCustomExpenses] = useState<Array<{id: string; name: string; amount: number; category: string}>>([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  
  // Collaboration
  const [collaborators, setCollaborators] = useState<string[]>(["You"]);
  const [inviteEmail, setInviteEmail] = useState("");

  const preferenceOptions = [
    { id: "culture", name: "Cultural Sites", icon: "🏛️" },
    { id: "food", name: "Food & Dining", icon: "🍽️" },
    { id: "adventure", name: "Adventure", icon: "🏔️" },
    { id: "shopping", name: "Shopping", icon: "🛍️" },
    { id: "nature", name: "Nature", icon: "🌳" },
    { id: "nightlife", name: "Nightlife", icon: "🎉" },
    { id: "photography", name: "Photography", icon: "📸" },
    { id: "relaxation", name: "Relaxation", icon: "🧘" },
  ];

  const activityTypes = [
    { id: "attraction", name: "Attraction", icon: MapPin, color: "blue" },
    { id: "food", name: "Food", icon: Utensils, color: "green" },
    { id: "hotel", name: "Accommodation", icon: Hotel, color: "purple" },
    { id: "transport", name: "Transport", icon: Car, color: "orange" },
    { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "pink" },
    { id: "activity", name: "Activity", icon: Camera, color: "cyan" },
  ];

  // Mock trip data
  const mockTrip: TripPlan = {
    id: "trip_1",
    destination: "Jaipur",
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    budget: 25000,
    spentBudget: 15500,
    travelers: 2,
    preferences: ["culture", "food"],
    savedPlaces: [
      { id: "1", name: "Amber Fort", type: "attraction", rating: 4.8, cost: 500 },
      { id: "2", name: "Hawa Mahal", type: "attraction", rating: 4.7, cost: 200 },
      { id: "3", name: "Spice Court", type: "restaurant", rating: 4.5, cost: 1200 },
    ],
    days: [
      {
        day: 1,
        date: new Date().toLocaleDateString(),
        title: "Arrival & City Exploration",
        weather: { temp: 28, condition: "Sunny", icon: "☀️" },
        activities: [
          {
            id: "a1",
            time: "10:00 AM",
            title: "Hotel Check-in",
            location: "Jaipur City Center",
            type: "hotel",
            cost: 3500,
            duration: 30,
            rating: 4.5,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
            description: "Luxury hotel in central location",
          },
          {
            id: "a2",
            time: "2:00 PM",
            title: "Hawa Mahal Visit",
            location: "Old City",
            type: "attraction",
            cost: 200,
            duration: 90,
            rating: 4.7,
            imageUrl: "https://images.unsplash.com/photo-1599661046827-dacff0f6f7ab?w=400",
            description: "Palace of Winds - iconic 5-story pink sandstone structure",
          },
          {
            id: "a3",
            time: "5:00 PM",
            title: "Johari Bazaar Shopping",
            location: "Old City",
            type: "shopping",
            cost: 2000,
            duration: 120,
            rating: 4.3,
            description: "Traditional jewelry and textiles market",
          },
          {
            id: "a4",
            time: "7:30 PM",
            title: "Rooftop Dinner",
            location: "Near City Palace",
            type: "food",
            cost: 1500,
            duration: 90,
            rating: 4.6,
            description: "Authentic Rajasthani cuisine with city views",
          },
        ],
        totalCost: 7200,
        totalDuration: 330,
      },
      {
        day: 2,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
        title: "Historical Forts Day",
        weather: { temp: 30, condition: "Partly Cloudy", icon: "⛅" },
        activities: [
          {
            id: "a5",
            time: "8:00 AM",
            title: "Amber Fort Tour",
            location: "Amber",
            type: "attraction",
            cost: 500,
            duration: 180,
            rating: 4.9,
            imageUrl: "https://images.unsplash.com/photo-1599661046827-dacff0f6f7ab?w=400",
            description: "Magnificent fort with elephant rides available",
          },
          {
            id: "a6",
            time: "12:30 PM",
            title: "Traditional Rajasthani Thali",
            location: "Near Fort",
            type: "food",
            cost: 800,
            duration: 60,
            rating: 4.5,
            description: "Complete traditional meal with 15+ dishes",
          },
          {
            id: "a7",
            time: "2:30 PM",
            title: "Jaigarh Fort",
            location: "Amber Road",
            type: "attraction",
            cost: 300,
            duration: 120,
            rating: 4.6,
            description: "Fort housing the world's largest cannon on wheels",
          },
          {
            id: "a8",
            time: "6:00 PM",
            title: "Sunset at Nahargarh",
            location: "Aravalli Hills",
            type: "attraction",
            cost: 200,
            duration: 90,
            rating: 4.8,
            description: "Best sunset views of Pink City",
          },
        ],
        totalCost: 1800,
        totalDuration: 450,
      },
      {
        day: 3,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        title: "Culture & Departure",
        weather: { temp: 29, condition: "Clear", icon: "🌤️" },
        activities: [
          {
            id: "a9",
            time: "9:00 AM",
            title: "City Palace Complex",
            location: "Old City",
            type: "attraction",
            cost: 700,
            duration: 150,
            rating: 4.7,
            imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400",
            description: "Royal residence with museum and courtyards",
          },
          {
            id: "a10",
            time: "12:00 PM",
            title: "Jantar Mantar",
            location: "Near City Palace",
            type: "attraction",
            cost: 200,
            duration: 60,
            rating: 4.4,
            description: "UNESCO World Heritage astronomical observatory",
          },
          {
            id: "a11",
            time: "2:00 PM",
            title: "Farewell Lunch",
            location: "Hotel Restaurant",
            type: "food",
            cost: 1200,
            duration: 90,
            rating: 4.5,
          },
          {
            id: "a12",
            time: "4:00 PM",
            title: "Airport Transfer",
            location: "To Airport",
            type: "transport",
            cost: 500,
            duration: 45,
          },
        ],
        totalCost: 2600,
        totalDuration: 345,
      },
    ],
  };

  // Initialize with mock data
  useEffect(() => {
    if (!currentTrip) {
      setCurrentTrip(mockTrip);
    }
  }, []);

  // Calculate trip duration
  const getTripDuration = () => {
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calculate budget status
  const getBudgetStatus = () => {
    if (!currentTrip) return { percentage: 0, remaining: budget, status: "safe" };
    
    const spent = currentTrip.spentBudget + customExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (spent / budget) * 100;
    const remaining = budget - spent;
    
    let status = "safe";
    if (percentage > 90) status = "danger";
    else if (percentage > 75) status = "warning";
    
    return { percentage, remaining, status, spent };
  };

  // Generate itinerary
  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    toast.info("Generating AI-powered itinerary...");
    
    try {
      const result = await generateItinerary(
        destination,
        budget,
        getTripDuration(),
        preferences
      );
      
      // In production, use result.data
      setTimeout(() => {
        setCurrentTrip(mockTrip);
        setIsGenerating(false);
        toast.success("Itinerary generated successfully!");
      }, 2000);
      
    } catch (error) {
      setIsGenerating(false);
      toast.error("Failed to generate itinerary");
    }
  };

  // Toggle preference
  const togglePreference = (prefId: string) => {
    setPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(p => p !== prefId)
        : [...prev, prefId]
    );
  };

  // Toggle activity completion
  const toggleActivityCompletion = (dayIndex: number, activityId: string) => {
    if (!currentTrip) return;
    
    const updatedDays = [...currentTrip.days];
    const activity = updatedDays[dayIndex].activities.find(a => a.id === activityId);
    if (activity) {
      activity.completed = !activity.completed;
      setCurrentTrip({ ...currentTrip, days: updatedDays });
      toast.success(activity.completed ? "Activity marked as completed" : "Activity marked as incomplete");
    }
  };

  // Add custom expense
  const addCustomExpense = () => {
    if (!newExpenseName || !newExpenseAmount) return;
    
    const expense = {
      id: `exp_${Date.now()}`,
      name: newExpenseName,
      amount: parseFloat(newExpenseAmount),
      category: "other"
    };
    
    setCustomExpenses(prev => [...prev, expense]);
    setNewExpenseName("");
    setNewExpenseAmount("");
    toast.success("Expense added");
  };

  // Export itinerary
  const exportItinerary = () => {
    if (!currentTrip) return;
    
    const content = currentTrip.days.map(day => 
      `DAY ${day.day}: ${day.title}\n` +
      `Date: ${day.date}\n` +
      `Weather: ${day.weather?.condition} ${day.weather?.temp}°C\n\n` +
      day.activities.map(act => 
        `${act.time} - ${act.title}\n` +
        `Location: ${act.location}\n` +
        `Cost: ₹${act.cost}\n` +
        `${act.description || ''}\n`
      ).join('\n')
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${destination}-itinerary.txt`;
    a.click();
    toast.success("Itinerary exported");
  };

  // Share itinerary
  const shareItinerary = () => {
    if (navigator.share && currentTrip) {
      navigator.share({
        title: `Trip to ${currentTrip.destination}`,
        text: `Check out my trip itinerary to ${currentTrip.destination}!`,
        url: window.location.href,
      }).then(() => toast.success("Shared successfully"))
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 gradient-india rounded-2xl flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <h1>AI Trip Planner</h1>
          </div>
          <p className="text-gray-600">Create perfect itineraries with AI-powered recommendations</p>
        </motion.div>

        {!currentTrip ? (
          // Trip Planning Form
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 glass">
              <h2 className="mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#ff6b35]" />
                Plan Your Perfect Trip
              </h2>

              <div className="space-y-6">
                {/* Destination */}
                <div>
                  <label className="block text-sm mb-2">📍 Destination</label>
                  <Input
                    placeholder="Where do you want to go?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">📅 Start Date</label>
                    <Input
                      type="date"
                      value={startDate.toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                      className="rounded-2xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">📅 End Date</label>
                    <Input
                      type="date"
                      value={endDate.toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-xl">
                  <Info className="w-4 h-4" />
                  <span>Trip duration: {getTripDuration()} days</span>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm mb-2">💰 Budget (₹)</label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                      className="rounded-2xl"
                    />
                    <Slider
                      value={[budget]}
                      onValueChange={(v) => setBudget(v[0])}
                      min={5000}
                      max={100000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>₹5,000</span>
                      <span>₹{budget.toLocaleString()}</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>
                </div>

                {/* Travelers */}
                <div>
                  <label className="block text-sm mb-2">👥 Number of Travelers</label>
                  <Select value={travelers.toString()} onValueChange={(v) => setTravelers(parseInt(v))}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Person" : "People"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferences */}
                <div>
                  <label className="block text-sm mb-3">✨ Travel Preferences</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {preferenceOptions.map(pref => (
                      <button
                        key={pref.id}
                        onClick={() => togglePreference(pref.id)}
                        className={`p-3 rounded-2xl border-2 transition-all text-left ${
                          preferences.includes(pref.id)
                            ? 'border-[#ff6b35] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{pref.icon}</div>
                        <div className="text-sm">{pref.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Options */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-[#ff6b35] hover:underline flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Advanced Options
                  </button>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-4 p-4 bg-gray-50 rounded-2xl"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Include accommodation</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Include transportation</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Include meals</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Optimize for budget</span>
                          <Switch />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateItinerary}
                  disabled={isGenerating || !destination}
                  className="w-full gradient-india text-white rounded-2xl py-6"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Generating AI Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Itinerary with AI
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          // Generated Itinerary View
          <div className="space-y-6">
            {/* Trip Header */}
            <Card className="p-6 glass">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="mb-2">{currentTrip.destination} Trip</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {currentTrip.days.length} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {currentTrip.travelers} travelers
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ₹{currentTrip.budget.toLocaleString()} budget
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={shareItinerary} className="rounded-full">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportItinerary} className="rounded-full">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCurrentTrip(null)} 
                    className="rounded-full"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Budget Usage</span>
                  <span className={`${
                    budgetStatus.status === 'danger' ? 'text-red-600' :
                    budgetStatus.status === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    ₹{budgetStatus.spent?.toLocaleString()} / ₹{currentTrip.budget.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={budgetStatus.percentage} 
                  className={`h-2 ${
                    budgetStatus.status === 'danger' ? '[&>div]:bg-red-500' :
                    budgetStatus.status === 'warning' ? '[&>div]:bg-yellow-500' :
                    '[&>div]:bg-green-500'
                  }`}
                />
                <p className="text-xs text-gray-600">
                  {budgetStatus.remaining >= 0 
                    ? `₹${budgetStatus.remaining.toLocaleString()} remaining` 
                    : `₹${Math.abs(budgetStatus.remaining).toLocaleString()} over budget`}
                </p>
              </div>
            </Card>

            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-2xl">
                <TabsTrigger value="timeline" className="rounded-2xl">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="budget" className="rounded-2xl">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget
                </TabsTrigger>
                <TabsTrigger value="map" className="rounded-2xl">
                  <MapPin className="w-4 h-4 mr-2" />
                  Map View
                </TabsTrigger>
              </TabsList>

              {/* Timeline View */}
              <TabsContent value="timeline" className="space-y-6 mt-6">
                {/* Day Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentTrip.days.map((day, idx) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(idx)}
                      className={`px-6 py-3 rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
                        selectedDay === idx
                          ? 'gradient-india text-white shadow-lg'
                          : 'bg-white border-2 border-gray-200 hover:border-[#ff6b35]'
                      }`}
                    >
                      <div className="text-sm">Day {day.day}</div>
                      <div className="text-xs opacity-80">{day.date}</div>
                    </button>
                  ))}
                </div>

                {/* Selected Day Details */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDay}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {currentTrip.days[selectedDay] && (
                      <Card className="p-6 glass">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="mb-2">{currentTrip.days[selectedDay].title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {currentTrip.days[selectedDay].weather && (
                                <span className="flex items-center gap-1">
                                  <span>{currentTrip.days[selectedDay].weather?.icon}</span>
                                  {currentTrip.days[selectedDay].weather?.temp}°C - {currentTrip.days[selectedDay].weather?.condition}
                                </span>
                              )}
                              <span>₹{currentTrip.days[selectedDay].totalCost.toLocaleString()}</span>
                              <span>{Math.floor(currentTrip.days[selectedDay].totalDuration / 60)}h {currentTrip.days[selectedDay].totalDuration % 60}m</span>
                            </div>
                          </div>
                        </div>

                        {/* Activities */}
                        <div className="space-y-4">
                          {currentTrip.days[selectedDay].activities.map((activity) => {
                            const activityType = activityTypes.find(t => t.id === activity.type);
                            const Icon = activityType?.icon || MapPin;
                            
                            return (
                              <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-2xl border-2 transition-all ${
                                  activity.completed 
                                    ? 'bg-green-50 border-green-300' 
                                    : 'bg-white border-gray-200 hover:border-[#ff6b35]'
                                }`}
                              >
                                <div className="flex gap-4">
                                  {activity.imageUrl && (
                                    <img 
                                      src={activity.imageUrl} 
                                      alt={activity.title}
                                      className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                                    />
                                  )}
                                  
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge className={`bg-${activityType?.color}-100 text-${activityType?.color}-700 border-${activityType?.color}-300`}>
                                            <Icon className="w-3 h-3 mr-1" />
                                            {activityType?.name}
                                          </Badge>
                                          {activity.rating && (
                                            <div className="flex items-center gap-1 text-xs">
                                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                              <span>{activity.rating}</span>
                                            </div>
                                          )}
                                        </div>
                                        <h4 className="mb-1">{activity.title}</h4>
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                          <MapPin className="w-3 h-3" />
                                          {activity.location}
                                        </p>
                                      </div>
                                      
                                      <button
                                        onClick={() => toggleActivityCompletion(selectedDay, activity.id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                          activity.completed
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-gray-300 hover:border-green-500'
                                        }`}
                                      >
                                        {activity.completed && <Check className="w-4 h-4 text-white" />}
                                      </button>
                                    </div>
                                    
                                    {activity.description && (
                                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                    )}
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {activity.time}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        ₹{activity.cost}
                                      </span>
                                      <span>{activity.duration} min</span>
                                    </div>
                                    
                                    {activity.bookingUrl && (
                                      <Button size="sm" variant="outline" className="mt-2 rounded-full">
                                        Book Now
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </Card>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* Budget View */}
              <TabsContent value="budget" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Budget Breakdown */}
                  <Card className="p-6 glass">
                    <h3 className="mb-4">Budget Breakdown</h3>
                    <div className="space-y-3">
                      {activityTypes.map(type => {
                        const typeTotal = currentTrip.days.reduce((sum, day) => 
                          sum + day.activities
                            .filter(a => a.type === type.id)
                            .reduce((s, a) => s + a.cost, 0)
                        , 0);
                        
                        if (typeTotal === 0) return null;
                        
                        const Icon = type.icon;
                        const percentage = (typeTotal / budgetStatus.spent!) * 100;
                        
                        return (
                          <div key={type.id}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {type.name}
                              </span>
                              <span className="">₹{typeTotal.toLocaleString()}</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Custom Expenses */}
                  <Card className="p-6 glass">
                    <h3 className="mb-4">Additional Expenses</h3>
                    
                    <div className="space-y-2 mb-4">
                      {customExpenses.map(expense => (
                        <div key={expense.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                          <span className="text-sm">{expense.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">₹{expense.amount}</span>
                            <button
                              onClick={() => setCustomExpenses(prev => prev.filter(e => e.id !== expense.id))}
                              className="text-red-600 hover:scale-110 transition-transform"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Expense name"
                        value={newExpenseName}
                        onChange={(e) => setNewExpenseName(e.target.value)}
                        className="rounded-xl"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                        className="rounded-xl w-32"
                      />
                      <Button onClick={addCustomExpense} className="rounded-xl">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Savings Tips */}
                <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
                  <h4 className="mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    AI Savings Tips
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>💡 Book accommodations 2-3 months in advance to save up to 30%</p>
                    <p>🍽️ Try local street food for authentic experience at lower costs</p>
                    <p>🚇 Use public transportation - metro is efficient and economical</p>
                    <p>🎫 Buy combo tickets for multiple attractions to save ₹500-1000</p>
                  </div>
                </Card>
              </TabsContent>

              {/* Map View */}
              <TabsContent value="map" className="space-y-6 mt-6">
                <Card className="p-6 glass">
                  <h3 className="mb-4">Interactive Map</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Interactive map view coming soon!</p>
                    <p className="text-sm text-gray-500">Visualize your entire trip route with optimized directions</p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* API Integration Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
          <p className="text-sm">
            <strong className="text-blue-800">🔌 Python Backend:</strong>
            <span className="text-blue-700 text-xs ml-2">
              POST /api/trip/plan (AI Itinerary Generation) • GET /api/trip/recommendations (Personalized Suggestions) • 
              POST /api/trip/optimize (Budget Optimization)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
