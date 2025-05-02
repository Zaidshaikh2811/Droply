

import { auth } from "@clerk/nextjs/server";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";



export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, parentId, userId: bodyUserId } = body;
        if (!name || typeof name !== "string" || name.trim() === "" ||
            !bodyUserId) {
            return NextResponse.json("Bad Request", { status: 400 });
        }
        if (bodyUserId !== userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),
                        eq(files.userId, userId),
                        eq(files.isFolder, true)
                    )
                );
            if (!parentFolder) {
                return NextResponse.json("Parent folder not found", { status: 404 });
            }

            const folderData = {
                id: uuidv4(),
                name: name.trim(),
                path: `/folders/${userId}/${uuidv4()}`,
                size: 0,
                type: "folder",
                fileUrl: "",
                thumbnailUrl: "",
                userId: userId,
                parentId: parentId,
                isFolder: true,
                isStarred: false,
                isTrash: false,
                createdAt: new Date(),
                updatedAt: new Date(),

            }
            await db.insert(files).values(folderData).returning();
            return NextResponse.json("Folder created", { status: 201 });
        }


    }
    catch (error) {
        console.error("Error creating folder:", error);
        return NextResponse.json("Internal Server Error", { status: 500 });
    }
}