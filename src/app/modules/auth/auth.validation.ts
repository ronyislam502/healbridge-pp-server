import { z } from "zod";


const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});


const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});


const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});


const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});


const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string().min(1, "User id is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const AuthValidations = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};