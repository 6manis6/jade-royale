import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.IMGBB_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "IMGBB_API_KEY is not set" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof image === "string") {
      return NextResponse.json(
        { success: false, error: "Image file is required" },
        { status: 400 },
      );
    }

    const file = image as File;
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Empty image file" },
        { status: 400 },
      );
    }

    // imgbb is most reliable with base64 payloads.
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const uploadData = new URLSearchParams();
    uploadData.set("image", base64);
    uploadData.set("name", file.name.replace(/\.[^/.]+$/, ""));

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: uploadData,
      },
    );

    const raw = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (!response.ok || !data?.data?.url) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.error?.message ||
            data?.message ||
            `Upload failed with status ${response.status}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      url: data.data.url,
      displayUrl: data.data.display_url,
      thumbUrl: data.data.thumb?.url,
      deleteUrl: data.data.delete_url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
