import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Building2,
  Users,
  Bell,
  BrainCircuit,
  ShieldCheck,
  DatabaseBackup,
} from "lucide-react";

const settingsItems = [
  {
    title: "Hospital Info",
    icon: Building2,
  },
  {
    title: "User Management",
    icon: Users,
  },
  {
    title: "Notifications",
    icon: Bell,
  },
  {
    title: "AI Configuration",
    icon: BrainCircuit,
  },
  {
    title: "Security",
    icon: ShieldCheck,
  },
  {
    title: "Data & Backup",
    icon: DatabaseBackup,
  },
];

const SettingsCard = () => {
  return (
      <Card className="w-full ">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                <p className="font-medium text-base">
                  {item.title}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    
  );
};

export default SettingsCard;