import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";



export const GET = async (req: Request) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const queryUserId = searchParams.get("userId");
        const parentId = searchParams.get("parentId");

        if (!queryUserId || typeof queryUserId !== "string" || queryUserId.trim() === "") {
            return NextResponse.json("Bad Request", { status: 400 });
        }
        if (queryUserId !== userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }
        if (parentId && (typeof parentId !== "string" || parentId.trim() === "")) {
            return NextResponse.json("Bad Request", { status: 400 });
        }

        let userFiles;
        if (parentId) {
            await db.select().from(files).where(
                and(
                    eq(files.parentId, parentId),
                    eq(files.userId, userId),

                )

            )
        } else {
            await db.select().from(files).where(
                and(
                    eq(files.userId, userId),
                    isNull(files.parentId)
                )
            );
        }

    }
    catch (error) {
        console.error("Error in GET /api/files:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}