import { auth } from "@/lib/auth/auth";
import { AuthError } from "next-auth";

export const GET = auth;
export const POST = auth;

// Handle auth request errors
export async function HEAD() {
  try {
    await auth();
    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return new Response(
        JSON.stringify({
          message: error.message,
          type: error.type,
        }),
        { status: 400 }
      );
    }
    return new Response(
      JSON.stringify({
        message: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
}
