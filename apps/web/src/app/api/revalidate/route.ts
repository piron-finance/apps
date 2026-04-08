import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = {
  _type?: string;
  slug?: string;
};

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured." },
      { status: 503 },
    );
  }

  const { body, isValidSignature } = await parseBody<WebhookPayload>(
    request,
    secret,
  );

  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  revalidateTag("sanity:blog");
  revalidateTag("sanity:post");
  revalidateTag("sanity:category");
  revalidateTag("sanity:blogSettings");
  revalidatePath("/blog");

  if (body?.slug) {
    revalidatePath(`/blog/${body.slug}`);
  }

  return NextResponse.json({
    revalidated: true,
    slug: body?.slug || null,
    type: body?._type || null,
  });
}
