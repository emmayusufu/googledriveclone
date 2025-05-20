import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ZodSchema } from "zod";
import { connectToDatabase } from "./db";
import { rateLimit } from "./rateLimit";

const defaultRateLimit = {
  windowMs: 60000,
  max: 60,
};

const uploadRateLimit = {
  windowMs: 60000,
  max: 20,
};

type HandlerFunction = (params: {
  userId: string;
  request: Request;
}) => Promise<Response>;

export function createAuthHandler(
  handler: HandlerFunction,
  rateLimitConfig = defaultRateLimit
) {
  return async function (request: Request) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const isUpload = request.url.includes("/api/files");
      const config = isUpload ? uploadRateLimit : rateLimitConfig;
      const limiter = rateLimit(config);
      const limitResult = await limiter(userId, request);

      if (limitResult && "limitExceeded" in limitResult) {
        await connectToDatabase();
        const result = await handler({ userId, request });

        if (result instanceof NextResponse) {
          Object.entries(limitResult.headers).forEach(([key, value]) => {
            result.headers.set(key, value);
          });
          return result;
        }
        return result;
      } else {
        return limitResult;
      }
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}

export function validateRequest<T>(schema: ZodSchema<T>) {
  return async (req: Request) => {
    try {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams.entries());
      return await schema.parseAsync(params);
    } catch {
      throw new Error("Validation failed");
    }
  };
}
