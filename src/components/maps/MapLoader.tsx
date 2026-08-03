import { Loader2 } from "lucide-react";

export function MapLoader() {
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] bg-[#e9edc9]/50 rounded-[2.5rem] border border-[#01472e]/10 flex flex-col items-center justify-center shadow-inner">
      <Loader2 className="w-8 h-8 text-[#01472e] animate-spin mb-4" />
      <span className="text-sm font-sans font-medium text-[#01472e]/60 uppercase tracking-widest">
        Loading Maps...
      </span>
    </div>
  );
}
