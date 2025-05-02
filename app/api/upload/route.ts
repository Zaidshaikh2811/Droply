import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { image } from "@heroui/theme";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { imagekit, userId: bodyUserId } = body;

        if (!imagekit || !bodyUserId) {
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });
        }
        if (userId !== bodyUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const fileData = {
            name: imagekit.name || "Untitled",
            path: imagekit.filePath || `/droply/${userId}/${Date.now()}/${imagekit.name}`,
            userId: bodyUserId,
            fileUrl: imagekit.fileUrl || null,
            size: imagekit.size || 0,
            type: imagekit.type || "image",
            thumbnailUrl: imagekit.thumbnail || null,
            parentId: null,
            isFolder: false,
            isTrash: false,
            isStarred: false,
        }

        const [newFile] = await db.insert(files).values(fileData).returning()
        return NextResponse.json(newFile, { status: 201 });

    }
    catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}