export function getScoreColor(score: number): string {
  if (score >= 80) return "text-[#01472e]";
  if (score >= 60) return "text-[#a3b18a]";
  if (score >= 40) return "text-[#854d0e]";
  return "text-[#7f1d1d]";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-[#e9edc9]";
  if (score >= 60) return "bg-[#ccd5ae]";
  if (score >= 40) return "bg-[#fefae0] border border-[#a3b18a]/30";
  return "bg-[#7f1d1d]/10";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

export function getScoreColorHex(score: number): string {
  if (score >= 80) return "#01472e";
  if (score >= 60) return "#a3b18a";
  if (score >= 40) return "#854d0e";
  return "#7f1d1d";
}

export function getScoreGradientColor(score: number): string {
  if (score >= 80) return "from-[#01472e] to-[#01472e]/90";
  if (score >= 60) return "from-[#a3b18a] to-[#a3b18a]/90";
  if (score >= 40) return "from-[#854d0e] to-[#854d0e]/90";
  return "from-[#7f1d1d] to-[#7f1d1d]/90";
}

export function getScoreGradientText(score: number): string {
  if (score >= 80) return "text-[#01472e]";
  if (score >= 60) return "text-[#a3b18a]";
  if (score >= 40) return "text-[#854d0e]";
  return "text-[#7f1d1d]";
}

