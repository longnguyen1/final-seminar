export function getDegreePrefix(degree: string | null | undefined): string {
  if (!degree) return "";
  const d = degree.toLowerCase();
  if (d.includes("phó giáo sư")) return "PGS. ";
  if (d.includes("giáo sư")) return "GS. ";
  if (d.includes("tiến sĩ")) return "TS. ";
  if (d.includes("thạc sĩ")) return "ThS. ";
  if (d.includes("kỹ sư")) return "Kỹ sư. ";
  return "";
}
