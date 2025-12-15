import * as z from "zod"

export const loginSchema = z.object({
    email: z.email({
        message: "Please enter a valid email address",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
})

export const registerSchema = z.object({
    email: z.email({
        message: "Please enter a valid email address",
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    name: z.string().min(1, {
        message: "Name is required",
    }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
