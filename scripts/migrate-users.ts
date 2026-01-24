import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

async function migrateUsers() {
  try {
    // console.log("Starting user migration from profiles to Better Auth...");

    // Get all profiles
    const allProfiles = await db.select().from(profiles);

    // console.log(`Found ${allProfiles.length} profiles to migrate`);

    let migrated = 0;
    let errors = 0;

    for (const profile of allProfiles) {
      try {
        // Check if user already exists in Better Auth table
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.email, profile.email))
          .then((res) => res[0]);

        if (existingUser) {
          // console.log(`User ${profile.email} already exists, skipping...`);
          continue;
        }

        // Migrate to Better Auth user table
        await db.insert(user).values({
          id: profile.id, // Use the same UUID
          name: profile.name,
          email: profile.email,
          role: profile.role,
          emailVerified: false,
          createdAt: profile.createdAt || new Date(),
          updatedAt: new Date(),
        });

        migrated++;
        // console.log(`Migrated: ${profile.email} (${profile.role})`);
      } catch (error) {
        console.error(`Error migrating ${profile.email}:`, error);
        errors++;
      }
    }

    // console.log(`Migration complete! Migrated: ${migrated}, Errors: ${errors}`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run if called directly
if (require.main === module) {
  migrateUsers();
}

export { migrateUsers };
