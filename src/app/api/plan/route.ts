import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { id: userId } = await requireCurrentDbUser();
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    let where: any = { userId };

    if (monthParam) {
      const monthStart = new Date(monthParam);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
      where.date = { gte: monthStart, lte: monthEnd };
    }

    const activities = await prisma.plan.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id: userId } = await requireCurrentDbUser();
    const body = await request.json();

    const plan = await prisma.plan.create({
      data: {
        userId,
        date: new Date(body.date),
        type: body.type || "run",
        name: body.name || null,
        distance: body.distance || null,
        duration: body.duration || null,
        rpe: body.rpe || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id: userId } = await requireCurrentDbUser();
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("id");

    if (!planId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.plan.deleteMany({ where: { id: planId, userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
