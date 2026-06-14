import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const key = `uploads/users/${Date.now()}-${file.name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    return NextResponse.json({
      success: true,
      imagePath: key,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);

    return NextResponse.json(
      {
        error: "Failed to upload image",
      },
      {
        status: 500,
      },
    );
  }
}
