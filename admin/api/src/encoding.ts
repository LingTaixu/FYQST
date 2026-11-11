export function selectEncoding(
  header: string | null,
  supported: string[],
): string | undefined {
  const preferences = new Map<string, number>();
  for (const item of (header || "").split(",")) {
    const [name, ...params] = item.trim().toLowerCase().split(";");
    const quality = params.find((p) => p.trim().startsWith("q="));
    const q = quality ? Number(quality.trim().slice(2)) : 1;
    if (name && Number.isFinite(q) && q >= 0 && q <= 1)
      preferences.set(name, q);
  }
  return supported
    .map((name, index) => ({
      name,
      index,
      q: preferences.get(name) ?? preferences.get("*") ?? 0,
    }))
    .filter((p) => p.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)[0]?.name;
}
