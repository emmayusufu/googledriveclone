import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Folder from "@/models/Folder";
import File from "@/models/File";
import { auth } from "@clerk/nextjs";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();

  const url = new URL(req.url);
  const parentId = url.searchParams.get("parentId");

  // Fetch folders and files for this user and parent
  const folders = await Folder.find({
    userId,
    parentId: parentId || null,
  }).sort("name");
  const files = await File.find({ userId, parentId: parentId || null }).sort(
    "name"
  );
  return NextResponse.json({ folders, files });
}
