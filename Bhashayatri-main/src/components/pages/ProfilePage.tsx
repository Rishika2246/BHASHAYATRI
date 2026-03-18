import { useState } from 'react';
import { motion } from "motion/react";
import { User, Settings, Globe, Bell, Shield, LogOut, MapPin, Mail, Phone, Calendar, Edit2 } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from "../../contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner@2.0.3";

export function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);

  const handleSaveProfile = () => {
    if (user) {
      updateUser({
        name: editedName,
        phone: editedPhone,
      });
      setIsEditingProfile(false);
      toast.success('Profile updated successfully! ✅');
    }
  };

  const handleToggleNotifications = (checked: boolean) => {
    setNotifications(checked);
    if (user) {
      updateUser({
        preferences: {
          ...user.preferences,
          notifications: checked,
        },
      });
      toast.success(checked ? 'Notifications enabled' : 'Notifications disabled');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully! 👋');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 mb-6 text-center relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/20 via-[#000080]/10 to-[#138808]/20"></div>
          
          <div className="relative z-10">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-xl">
              <AvatarFallback className="gradient-india text-white text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-[#000080]">{user.name}</h2>
            <p className="text-gray-600 mb-2">{user.email}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.joinedDate)}</span>
            </div>
            <Button 
              onClick={() => {
                setEditedName(user.name);
                setEditedPhone(user.phone);
                setIsEditingProfile(true);
              }}
              className="gradient-india text-white"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6"
          >
            <h3 className="text-[#000080] mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-2xl">
                <Mail className="w-5 h-5 text-[#FF9933] mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div>{user.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-2xl">
                <Phone className="w-5 h-5 text-[#FF9933] mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div>{user.phone}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Location Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6"
          >
            <h3 className="text-[#000080] mb-4">Location</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-2xl">
                <MapPin className="w-5 h-5 text-[#138808] mt-0.5" />
                <div className="flex-1">
                  {user.location.city && user.location.country && (
                    <div className="mb-1">
                      {user.location.city}, {user.location.country}
                    </div>
                  )}
                  {user.location.address && (
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {user.location.address}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    📍 {user.location.latitude.toFixed(4)}, {user.location.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6 mb-6"
        >
          <h3 className="text-[#000080] mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#FF9933]" />
                <div>
                  <div>Preferred Language</div>
                  <div className="text-sm text-gray-600">
                    {user.preferences?.language === 'hi' ? 'Hindi' : 'English'}
                  </div>
                </div>
              </div>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#FF9933]" />
                <span>Push Notifications</span>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={handleToggleNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#FF9933]" />
                <div>
                  <div>Account Security</div>
                  <div className="text-sm text-gray-600">
                    2FA Enabled
                  </div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full rounded-2xl border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 py-6"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="flex-1 gradient-india text-white"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
