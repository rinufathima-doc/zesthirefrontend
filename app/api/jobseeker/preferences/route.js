import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    // TODO: Extract token, verify user via JWT, and update your MongoDB / DB here
    console.log("Saving jobseeker preferences:", body);

    return NextResponse.json(
      {
        success: true,
        message: "Preferences updated successfully!",
        data: body,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}