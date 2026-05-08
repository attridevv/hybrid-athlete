import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { injurySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const validated = injurySchema.parse(data);

    const injury = await prisma.injury.create({
      data: { userId, ...validated },
    });

    return NextResponse.json(injury);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating injury:", error);
    return NextResponse.json({ error: "Failed to create injury" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const injuries = await prisma.injury.findMany({
      where: { userId },
      orderBy: { reportedAt: "desc" },
    });

    return NextResponse.json(injuries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch injuries" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, userId, ...data } = body;

    if (!id || !userId) return NextResponse.json({ error: "ID and User ID required" }, { status: 400 });

    const injury = await prisma.injury.updateMany({
      where: { id, userId },
      data: {
        ...data,
        ...(data.status === "recovered" ? { resolvedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(injury);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update injury" }, { status: 500 });
  }
}
