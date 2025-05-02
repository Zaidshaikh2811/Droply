
import { auth } from "@clerk/nextjs/server";
import { files } from "@/lib/db/schema"
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { form } from "@heroui/theme";


if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    throw new Error("ImageKit credentials are not set in the environment variables.");
}

var imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_NToxMEOt0S******************",
    privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || "private_NToxMEOt0S******************",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/your_imagekit_id"
});

export async function POST(request: NextRequest) {
    try {

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        const formdata = await request.formData()
        const file = formdata.get("file") as File
        const fileName = formdata.get("fileName") as string
        const parentId = formdata.get("parentId") as string || null
        const formUserId = formdata.get("formUserId") as string || null

        if (formUserId !== userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }
        if (!file || !fileName) {
            return NextResponse.json("Missing file, fileName or fileType", { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            return NextResponse.json("File size exceeds the limit of 10MB", { status: 400 });
        }



        if (parentId) {
            const [parentFolder] = await db.select().from(files)
                .where(and(eq(files.id, parentId),
                    eq(files.userId, userId),
                    eq(files.isFolder, true)
                ))
                .limit(1).execute()

            if (!parentFolder) {
                return NextResponse.json("Parent folder not found or not authorized", { status: 404 });
            }



        }


        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            return NextResponse.json("Invalid file type", { status: 400 });
        }


        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        const folderPath = parentId ? `/droply/${userId}/folder/${parentId}` : `/droply/${userId}`

        const originalFileName = file.name.split('.').pop() || '';




        const fileExtension = originalFileName.split('.').pop() || 'jpg';

        const uniqueFileName = `${uuidv4()}.${fileExtension}`


        const uploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: uniqueFileName,
            folder: folderPath,
            useUniqueFileName: false,
        })


        const fileData = {
            name: originalFileName,
            path: uploadResponse.filePath,
            size: file.size,
            type: file.type,
            userId: userId,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl || null,
            parentId: parentId,
            isFolder: false,
            isFile: true,
            isStarred: false,
            isTrash: false,
            createdAt: new Date(),
            updatedAt: new Date(),


        };

        const [newFile] = await db.insert(files).values(fileData).returning()

        return NextResponse.json(newFile, { status: 200 });

    }
    catch (error) {
        console.error("Error in POST /api/files/upload:", error);
        return NextResponse.json("Internal Server Error", { status: 500 });
    }
}