import { loadCaspianFacts } from "@/lib/caspian/facts";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(loadCaspianFacts(), {
    headers: { "Cache-Control": "no-store" },
  });
}
