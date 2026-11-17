import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const body = await request.json();

    // TODO: Handle password hashing (e.g., bcrypt) and account updates in your DB
    console.log("Updating account credentials/settings:", {
      email: body.email,
      emailNotifications: body.emailNotifications,
      hasNewPassword: !!body.newPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account settings updated successfully!",
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