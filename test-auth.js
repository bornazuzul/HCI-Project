// test-auth.js
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log("🔍 Testing Supabase Authentication...\n");

  try {
    // Test 1: Check connection
    console.log("1. Testing Supabase connection...");
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("   ❌ Connection failed:", error.message);
    } else {
      console.log("   ✅ Connection successful");
    }

    // Test 2: Try to sign up a test user
    console.log("\n2. Testing user registration...");
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = "Test123456!";
    const testName = "Test User";

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
        options: {
          data: { name: testName },
        },
      }
    );

    if (signUpError) {
      console.error("   ❌ Sign up failed:", signUpError.message);
    } else {
      console.log("   ✅ Sign up successful");
      console.log("   User ID:", signUpData.user?.id);

      // Test 3: Check if profile was created
      console.log("\n3. Checking profile creation...");
      if (signUpData.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", signUpData.user.id)
          .single();

        if (profileError) {
          console.error("   ❌ Profile check failed:", profileError.message);
        } else if (profile) {
          console.log("   ✅ Profile created successfully");
          console.log("   Profile data:", {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
          });
        }

        // Clean up
        console.log("\n4. Cleaning up test user...");
        await supabase.auth.admin.deleteUser(signUpData.user.id);
        console.log("   ✅ Test user cleaned up");
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }

  console.log("\n✅ Test completed");
}

testAuth();
