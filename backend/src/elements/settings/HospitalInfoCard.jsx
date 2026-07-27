import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Phone,
  ShieldPlus,
  FileBadge,
} from "lucide-react";

const HospitalInfoCard = () => {
  return (
    
      <Card className="max-w-3xl mx-auto w-full p-6 ">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              Hospital Information
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage hospital details and contact information
            </p>
          </div>

          <Button>Save Changes</Button>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
          {/* Hospital Name */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Building2 className="w-4 h-4" />
              Hospital Name
            </div>

            <p className="text-lg font-semibold">
              MediCore Hospital
            </p>
          </div>

          {/* Registration Number */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FileBadge className="w-4 h-4" />
              Registration No.
            </div>

            <p className="text-lg font-semibold">
              MH-2024-00142
            </p>
          </div>

          {/* City */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              City
            </div>

            <p className="text-lg font-semibold">
              Prayagraj
            </p>
          </div>

          {/* State */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              State
            </div>

            <p className="text-lg font-semibold">
              Uttar Pradesh
            </p>
          </div>

          {/* Address */}
          <div className="space-y-1 md:col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              Address
            </div>

            <p className="text-lg font-semibold">
              14 Civil Lines, Medical District
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Phone className="w-4 h-4" />
              Contact
            </div>

            <p className="text-lg font-semibold">
              +91 532 240 0000
            </p>
          </div>

          {/* Emergency Line */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <ShieldPlus className="w-4 h-4" />
              Emergency Line
            </div>

            <p className="text-lg font-semibold text-red-500">
              +91 532 240 0911
            </p>
          </div>
        </CardContent>
      </Card>
    
  );
};

export default HospitalInfoCard;