import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const body = await request.json();

    // TODO: Connect to your database (MongoDB / Mongoose / Prisma) here
    console.log("Saving employer profile to DB:", body);

    return NextResponse.json(
      {
        success: true,
        message: "Employer profile updated successfully!",
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