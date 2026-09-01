import { loadCaspianQuestions } from "@/lib/caspian/questions";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(loadCaspianQuestions());
}
