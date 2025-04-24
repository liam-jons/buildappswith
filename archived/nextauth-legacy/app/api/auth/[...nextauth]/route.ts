// Import the handlers directly from the auth module
import { GET, POST } from "@/lib/auth/auth";
import { AuthError } from "next-auth";
import { auth } from "@/lib/auth/auth";

// Export the handlers directly
export { GET, POST };

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