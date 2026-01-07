"use server";

import { createUserActivity } from "@/lib/api/user-activities";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema
const activitySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20).max(500),
  category: z.enum([
    "environment",
    "community",
    "education",
    "health",
    "animals",
  ]),
  date: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Date cannot be in the past"),
  time: z.string(),
  location: z.string().min(3).max(200),
  maxApplicants: z.number().min(1).max(500),
  organizerId: z.string().uuid(),
});

export async function createActivity(formData: FormData) {
  try {
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      maxApplicants: Number(formData.get("maxApplicants")),
      organizerId: formData.get("organizerId") as string,
    };

    // Validate input
    const validatedData = activitySchema.parse(rawData);

    // Create activity in database
    const activity = await createUserActivity(validatedData);

    // Revalidate the activities page
    revalidatePath("/activities");
    revalidatePath("/admin/pending-activities");

    return {
      success: true,
      message: "Activity submitted for admin approval!",
      activityId: activity.id,
    };
  } catch (error) {
    console.error("Error creating activity:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      };
    }

    return {
      success: false,
      message: "Failed to create activity. Please try again.",
    };
  }
}
