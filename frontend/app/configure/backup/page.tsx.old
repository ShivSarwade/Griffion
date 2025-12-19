"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Shield, ArrowLeft, ArrowRight, Check, Download } from "lucide-react";
import axios from "axios";

type ConfigState = {
  primaryIdentifier: "email" | "phone";
  enable2FA: boolean;
  enablePasswordRecovery: boolean;
  enableRememberMe: boolean;
  enableAccountLockout: boolean;
  enableAdminPanel: boolean;
  enableRBAC: boolean;
  enableGroups: boolean;
  maxLoginAttempts: number;
  passwordMinLength: number;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  database: "sqlite" | "postgresql" | "mongodb";
  connectionString: string;
};

const STEPS = [
  "Primary Identifier",
  "Auth Features",
  "User Management",
  "Email Config",
  "Database",
  "Review"
];

export default function ConfigurePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [config, setConfig] = useState<ConfigState>({
    primaryIdentifier: "email",
    enable2FA: false,
    enablePasswordRecovery: true,
    enableRememberMe: true,
    enableAccountLockout: true,
    enableAdminPanel: true,
    enableRBAC: true,
    enableGroups: false,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    database: "sqlite",
    connectionString: "",
  });

  const updateConfig = (updates: Partial<ConfigState>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const calculatePrice = () => {
    let basePrice = 49;
    if (config.enable2FA) basePrice += 20;
    if (config.enableAdminPanel) basePrice += 30;
    if (config.enableRBAC) basePrice += 25;
    if (config.database !== "sqlite") basePrice += 15;
    return basePrice;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/download/generate', config, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'griffion-backend.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Backend downloaded successfully! Extract the ZIP and run "npm install" then "npm start"');
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Error downloading backend. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Griffion</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className={`text-xs ${
                  index <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <Progress value={progress} />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep]}</CardTitle>
            <CardDescription>
              {currentStep === 0 && "Choose how users will identify themselves"}
              {currentStep === 1 && "Select authentication features"}
              {currentStep === 2 && "Configure user and role management"}
              {currentStep === 3 && "Set up email notifications"}
              {currentStep === 4 && "Choose your database"}
              {currentStep === 5 && "Review your configuration"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Primary Identifier */}
            {currentStep === 0 && (
              <RadioGroup
                value={config.primaryIdentifier}
                onValueChange={(value) =>
                  updateConfig({ primaryIdentifier: value as "email" | "phone" })
                }
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="email" id="email" />
                  <div className="flex-1">
                    <Label htmlFor="email" className="cursor-pointer">
                      <div className="font-semibold">Email Address</div>
                      <div className="text-sm text-muted-foreground">
                        Users will log in with their email address
                      </div>
                    </Label>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="phone" id="phone" />
                  <div className="flex-1">
                    <Label htmlFor="phone" className="cursor-pointer">
                      <div className="font-semibold">Phone Number</div>
                      <div className="text-sm text-muted-foreground">
                        Users will log in with their phone number
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* Step 2: Auth Features */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="2fa"
                    checked={config.enable2FA}
                    onCheckedChange={(checked) => updateConfig({ enable2FA: checked as boolean })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="2fa" className="cursor-pointer">
                      <div className="font-semibold">Two-Factor Authentication (2FA)</div>
                      <div className="text-sm text-muted-foreground">
                        Add extra security with SMS or Email OTP verification
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="recovery"
                    checked={config.enablePasswordRecovery}
                    onCheckedChange={(checked) =>
                      updateConfig({ enablePasswordRecovery: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="recovery" className="cursor-pointer">
                      <div className="font-semibold">Password Recovery</div>
                      <div className="text-sm text-muted-foreground">
                        Allow users to reset forgotten passwords via email
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="remember"
                    checked={config.enableRememberMe}
                    onCheckedChange={(checked) =>
                      updateConfig({ enableRememberMe: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="remember" className="cursor-pointer">
                      <div className="font-semibold">Remember Me</div>
                      <div className="text-sm text-muted-foreground">
                        Let users stay logged in across sessions
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="lockout"
                    checked={config.enableAccountLockout}
                    onCheckedChange={(checked) =>
                      updateConfig({ enableAccountLockout: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="lockout" className="cursor-pointer">
                      <div className="font-semibold">Account Lockout</div>
                      <div className="text-sm text-muted-foreground">
                        Temporarily lock accounts after failed login attempts
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: User Management */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="admin"
                    checked={config.enableAdminPanel}
                    onCheckedChange={(checked) =>
                      updateConfig({ enableAdminPanel: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="admin" className="cursor-pointer">
                      <div className="font-semibold">Admin Panel UI</div>
                      <div className="text-sm text-muted-foreground">
                        Include a web interface for managing users and roles
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="rbac"
                    checked={config.enableRBAC}
                    onCheckedChange={(checked) => updateConfig({ enableRBAC: checked as boolean })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="rbac" className="cursor-pointer">
                      <div className="font-semibold">Role-Based Access Control (RBAC)</div>
                      <div className="text-sm text-muted-foreground">
                        Define custom roles with specific permissions
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="groups"
                    checked={config.enableGroups}
                    onCheckedChange={(checked) => updateConfig({ enableGroups: checked as boolean })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="groups" className="cursor-pointer">
                      <div className="font-semibold">Group Management</div>
                      <div className="text-sm text-muted-foreground">
                        Organize users into groups for easier management
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attempts">Max Login Attempts</Label>
                    <Input
                      id="attempts"
                      type="number"
                      value={config.maxLoginAttempts}
                      onChange={(e) =>
                        updateConfig({ maxLoginAttempts: parseInt(e.target.value) || 5 })
                      }
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passLength">Password Min Length</Label>
                    <Input
                      id="passLength"
                      type="number"
                      value={config.passwordMinLength}
                      onChange={(e) =>
                        updateConfig({ passwordMinLength: parseInt(e.target.value) || 8 })
                      }
                      min="6"
                      max="20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Email Config */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={config.smtpHost}
                    onChange={(e) => updateConfig({ smtpHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    value={config.smtpPort}
                    onChange={(e) => updateConfig({ smtpPort: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    placeholder="your-email@example.com"
                    value={config.smtpUser}
                    onChange={(e) => updateConfig({ smtpUser: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    placeholder="Your SMTP password"
                    value={config.smtpPassword}
                    onChange={(e) => updateConfig({ smtpPassword: e.target.value })}
                  />
                </div>
                <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                  💡 Tip: You can use test SMTP services like Mailtrap for development
                </div>
              </div>
            )}

            {/* Step 5: Database */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <RadioGroup
                  value={config.database}
                  onValueChange={(value) =>
                    updateConfig({ database: value as "sqlite" | "postgresql" | "mongodb" })
                  }
                >
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="sqlite" id="sqlite" />
                    <div className="flex-1">
                      <Label htmlFor="sqlite" className="cursor-pointer">
                        <div className="font-semibold">SQLite (Embedded)</div>
                        <div className="text-sm text-muted-foreground">
                          Perfect for getting started, no external database required
                        </div>
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="postgresql" id="postgresql" />
                    <div className="flex-1">
                      <Label htmlFor="postgresql" className="cursor-pointer">
                        <div className="font-semibold">PostgreSQL</div>
                        <div className="text-sm text-muted-foreground">
                          Production-ready relational database
                        </div>
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="mongodb" id="mongodb" />
                    <div className="flex-1">
                      <Label htmlFor="mongodb" className="cursor-pointer">
                        <div className="font-semibold">MongoDB</div>
                        <div className="text-sm text-muted-foreground">
                          Flexible NoSQL document database
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {config.database !== "sqlite" && (
                  <div className="space-y-2">
                    <Label htmlFor="connectionString">Connection String</Label>
                    <Input
                      id="connectionString"
                      placeholder={
                        config.database === "postgresql"
                          ? "postgresql://user:password@localhost:5432/dbname"
                          : "mongodb://localhost:27017/dbname"
                      }
                      value={config.connectionString}
                      onChange={(e) => updateConfig({ connectionString: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-muted p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">Configuration Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Primary Identifier</div>
                      <div className="font-medium capitalize">{config.primaryIdentifier}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Database</div>
                      <div className="font-medium uppercase">{config.database}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-sm mb-2">Enabled Features</div>
                    <div className="flex flex-wrap gap-2">
                      {config.enable2FA && <Badge>2FA</Badge>}
                      {config.enablePasswordRecovery && <Badge>Password Recovery</Badge>}
                      {config.enableRememberMe && <Badge>Remember Me</Badge>}
                      {config.enableAccountLockout && <Badge>Account Lockout</Badge>}
                      {config.enableAdminPanel && <Badge>Admin Panel</Badge>}
                      {config.enableRBAC && <Badge>RBAC</Badge>}
                      {config.enableGroups && <Badge>Groups</Badge>}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total Price</span>
                    <span className="text-3xl font-bold text-primary">${calculatePrice()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    One-time payment. Lifetime access to this configuration.
                  </div>
                  
                  {/* Download Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>Generating your backend...</>
                    ) : (
                      <>
                        <Download className="mr-2 h-5 w-5" />
                        Download Backend (Free Demo)
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      🎉 Free Demo Version
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Download your configured backend instantly! Extract the ZIP file, run `npm install`, 
                      then `npm start`. In production, this would be a paid download.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < STEPS.length - 1 && (
            <Button onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
      {children}
    </span>
  );
}
