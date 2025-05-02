import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import ImageKit from 'imagekit';



if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    throw new Error("ImageKit credentials are not set in the environment variables.");
}

var imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_NToxMEOt0S******************",
    privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || "private_NToxMEOt0S******************",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/your_imagekit_id"
});


export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const authParams = imagekit.getAuthenticationParameters()


        return NextResponse.json({
            ...authParams
        })
    }
    catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
