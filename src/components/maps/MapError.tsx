import { MapPinOff } from "lucide-react";

export function MapError({ error }: { error?: string }) {
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] bg-[#fefae0] rounded-[2.5rem] border border-[#01472e]/20 flex flex-col items-center justify-center text-center p-6 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#01472e]/10 flex items-center justify-center text-[#01472e] mb-4">
        <MapPinOff className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-display text-[#01472e] uppercase mb-2">Map Unavailable</h3>
      <p className="text-sm font-sans text-[#01472e]/70 max-w-xs">
        {error || "Could not load the interactive map. Please check your connection or API key."}
      </p>
    </div>
  );
}
