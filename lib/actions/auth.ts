"use server"

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import ratelimit from "../ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "@/lib/workflow";
import config from "../config";



export const signInWithCredentials = async (params: Pick<AuthCredentials, "email" | "password">,) => {
    try {
        const { email, password } = params;
        
        const ip = (await headers()).get("x-forward-for") || "127.0.0.1";
        const { success } = await ratelimit.limit(ip);
        if (!success) return redirect("/too-fast");
        
        // Fetch the user from the database
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false, // Prevent redirection
        });
        if (result?.error) {
            return { success: false, error: result.error };
        }
        if (result?.ok) {
            // If sign-in is successful, you can return a success response
            return { success: true };
        }

    } catch (error) {
        console.error("Sign-in error:", error);
        return { success: false, error:error instanceof Error ? error.message : "Sign-in error" };
    }
};

export const signUp = async (params: AuthCredentials) => {
    const { fullName, email, universityId, password, universityCard } = params;

    const ip = (await headers()).get("x-forward-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) return redirect("/too-fast");

    //Check if the user already exists
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUser.length > 0) {
        return { success: false, error: "User already exists" };
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);
    try {
        // Insert the new user into the database
        await db.insert(users).values({
            fullName,
            email,
            universityId,
            password: hashedPassword,
            universityCard,
        });

        await workflowClient.trigger({
        url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
        body: {
            email,
            fullName,
        },
        });

        await signInWithCredentials({ email, password });

        return { success: true };
    } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: "Signup error" };
    }
};