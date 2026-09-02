import { loadOverview } from "@/lib/caspian/overview";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(loadOverview(), {
    headers: { "Cache-Control": "no-store" },
  });
}
