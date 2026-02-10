import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getUploadAuthParams } from "@imagekit/next/server"



export async function GET(request: NextRequest) {
    const logInToken = await getToken({ req: request })

    if (!logInToken?.email) {
        return NextResponse.json({ message: "Unauthorized User!" }, { status: 401 })
    }

    const existedUser = await prisma.users.findUnique(
        {
            where: { email: logInToken.email as string }
        }
    )
    if (!existedUser) {
        return NextResponse.json({ message: "User Not Found" }, { status: 404 })
    }

     const { token, expire, signature } = getUploadAuthParams({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string, // Never expose this on client side
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
        // expire: 30 * 60, // Optional, controls the expiry time of the token in seconds, maximum 1 hour in the future
        // token: "random-token", // Optional, a unique token for request
    })

    return Response.json({ token, expire, signature, publicKey: process.env.IMAGEKIT_PUBLIC_KEY })
}