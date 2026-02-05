import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const token = await getToken({req: request})

    if (!token?.email) {
        return NextResponse.json({message: "Unauthorized User!"}, {status: 401})
    }

    const user = await prisma.users.findUnique({
        where: { email: token.email as string},
        select: {
            id: true,
            plan: true,
            usageCount: true,
            usageLimit: true
        },
    });

    if (!user) {
        return NextResponse.json({message: "User Not Found"}, {status: 404})
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