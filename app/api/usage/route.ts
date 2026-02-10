import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })

    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized User!" }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { email: token.email as string },
      select: {
        id: true,
        plan: true,
        usageCount: true,
        usageLimit: true
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 })
    }


    return NextResponse.json({
      usageCount: user.usageCount,
      usageLimit: user.usageLimit,
      plan: user.plan,
      canUpload: user.usageCount < user.usageLimit
    })
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: token.email as string },
      select: {
        id: true,
        usageCount: true,
        usageLimit: true,
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.usageCount >= user.usageLimit) {
      return NextResponse.json(
        {
          error: "Usage limit reached",
          usageCount: user.usageCount,
          usageLimit: user.usageLimit,
          plan: user.plan,
          canUpload: false,
        },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        usageCount: { increment: 1 },
      },
      select: {
        usageCount: true,
        usageLimit: true,
        plan: true,
      },
    });



    return NextResponse.json({
      usageCount: updatedUser.usageCount,
      usageLimit: updatedUser.usageLimit,
      plan: updatedUser.plan,
      canUpload: updatedUser.usageCount < updatedUser.usageLimit,
    });

  } catch (error) {
    console.error("Usage POST error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
