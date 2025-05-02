

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";




export async function PATCH(req: Request, { params }: { params: { fileId: string } }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }
        const { fileId } = params;
        const file = await db.query.files.findFirst({
            where: and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        });
        if (!file) {
            return NextResponse.json("File not found", { status: 404 });
        }
        await db.update(files).set({ isTrash: !file.isTrash }).where(eq(files.id, fileId));
        return NextResponse.json("File trashed successfully", { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json("Internal Server Error", { status: 500 });
    }
}
