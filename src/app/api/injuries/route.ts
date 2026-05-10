import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { injurySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: userId } = await requireCurrentDbUser();
    const validated = injurySchema.parse(body);

    const injury = await prisma.injury.create({
      data: { userId, ...validated },
    });

    return NextResponse.json(injury);
  } catch (error: any) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating injury:", error);
    return NextResponse.json({ error: "Failed to create injury" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { id: userId } = await requireCurrentDbUser();

    const injuries = await prisma.injury.findMany({
      where: { userId },
      orderBy: { reportedAt: "desc" },
    });

    return NextResponse.json(injuries);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch injuries" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const { id: userId } = await requireCurrentDbUser();

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const injury = await prisma.injury.updateMany({
      where: { id, userId },
      data: {
        ...data,
        ...(data.status === "recovered" ? { resolvedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(injury);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update injury" }, { status: 500 });
  }
}
