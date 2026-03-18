import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Info, Chrome, Globe, Smartphone } from "lucide-react";
import { Card } from "./ui/card";

interface LocationPermissionGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationPermissionGuide({ open, onOpenChange }: LocationPermissionGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#ff6b35]" />
            How to Enable Location Access
          </DialogTitle>
          <DialogDescription>
            Follow these steps to enable location permissions in your browser
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="chrome" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chrome">
              <Chrome className="w-4 h-4 mr-2" />
              Chrome
            </TabsTrigger>
            <TabsTrigger value="other">
              <Globe className="w-4 h-4 mr-2" />
              Other Browsers
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </TabsTrigger>
          </TabsList>

          {/* Chrome/Edge Instructions */}
          <TabsContent value="chrome" className="space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="mb-3">Google Chrome / Microsoft Edge</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click the <strong>🔒 lock icon</strong> or <strong>ⓘ info icon</strong> in the address bar (left side)</li>
                <li>Look for <strong>"Location"</strong> in the permissions list</li>
                <li>Click on the dropdown next to "Location"</li>
                <li>Select <strong>"Allow"</strong></li>
                <li>Refresh the page by pressing <strong>F5</strong> or clicking the refresh button</li>
              </ol>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> If you don't see the lock icon, the site might not support HTTPS. 
                Location features require a secure connection.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Other Browsers */}
          <TabsContent value="other" className="space-y-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <h4 className="mb-3">Firefox</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click the <strong>🔒 lock icon</strong> in the address bar</li>
                <li>Click <strong>"Clear Permissions and Reload"</strong> (if shown)</li>
                <li>Or click <strong>"More Information" → "Permissions" tab</strong></li>
                <li>Find "Access Your Location" and uncheck "Use Default"</li>
                <li>Select <strong>"Allow"</strong></li>
                <li>Refresh the page</li>
              </ol>
            </Card>

            <Card className="p-4 bg-purple-50 border-purple-200">
              <h4 className="mb-3">Safari (macOS)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <strong>Safari → Settings (Preferences)</strong></li>
                <li>Click the <strong>"Websites"</strong> tab</li>
                <li>Select <strong>"Location"</strong> from the left sidebar</li>
                <li>Find this website in the list</li>
                <li>Change setting to <strong>"Allow"</strong></li>
                <li>Refresh the page</li>
              </ol>
            </Card>
          </TabsContent>

          {/* Mobile Instructions */}
          <TabsContent value="mobile" className="space-y-4">
            <Card className="p-4 bg-orange-50 border-orange-200">
              <h4 className="mb-3">📱 Android (Chrome)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Tap the <strong>three dots (⋮)</strong> in the top-right corner</li>
                <li>Tap <strong>"Settings"</strong></li>
                <li>Tap <strong>"Site settings"</strong></li>
                <li>Tap <strong>"Location"</strong></li>
                <li>Find this website and tap it</li>
                <li>Select <strong>"Allow"</strong></li>
                <li>Go back and refresh the page</li>
              </ol>
            </Card>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="mb-3">📱 iOS (Safari)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Open <strong>Settings</strong> app on your iPhone</li>
                <li>Scroll down and tap <strong>"Safari"</strong></li>
                <li>Tap <strong>"Location"</strong> under Privacy & Security</li>
                <li>Select <strong>"Ask"</strong> or <strong>"Allow"</strong></li>
                <li>Return to Safari and refresh the page</li>
                <li>Tap <strong>"Allow"</strong> when prompted</li>
              </ol>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> On mobile, you may also need to enable location services 
                in your device's system settings (Settings → Privacy → Location Services).
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Alternative Options */}
        <Alert className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <Sparkles className="h-4 w-4 text-[#ff6b35]" />
          <AlertDescription>
            <strong>Can't enable location?</strong> No problem! You can:
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm ml-4">
              <li>Enter your <strong>city or landmark name manually</strong> for personalized recommendations</li>
              <li>Use the app's <strong>manual location search</strong> to find nearby places</li>
              <li>Continue with <strong>general travel information</strong> and enable location later</li>
            </ul>
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
