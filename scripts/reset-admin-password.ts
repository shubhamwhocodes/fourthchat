const main = async () => {
    const { config } = await import("dotenv")
    const path = await import("path")
    config({ path: path.resolve(process.cwd(), ".env.local") })

    const { db } = await import("../lib/db")
    const { users } = await import("../lib/schema")
    const { eq } = await import("drizzle-orm")
    const { default: bcrypt } = await import("bcryptjs")

    try {
        const allUsers = await db.query.users.findMany({ limit: 1 });

        if (allUsers.length === 0) {
            console.error("No admin user found. Please register via the web interface first.");
            process.exit(1);
        }

        const adminUser = allUsers[0];

        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, adminUser.id));

        console.log(`Password reset successfully for user: ${adminUser.email}`);
        console.log(`New Password: ${generatedPassword}`);
        console.log("Please copy this password and keep it safe. You can change it later in settings.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to reset password:", error);
        process.exit(1);
    }
}

main();
