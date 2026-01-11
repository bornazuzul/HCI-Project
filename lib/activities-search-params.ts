import { parseAsInteger, parseAsString } from "nuqs/server";

export async function loadActivitiesSearchParams(searchParams: Promise<any>) {
  const params = await searchParams;

  // Parse page, default to 1 if invalid
  const rawPage = parseAsInteger.withDefault(1).parse(params?.page);
  const page = Math.max(1, rawPage);

  // Parse category, default to empty string
  const category = parseAsString.withDefault("").parse(params?.category);

  // Parse my filter, default to "false"
  const my = parseAsString.withDefault("false").parse(params?.my);

  return {
    page,
    category: category || "",
    my,
  };
}
