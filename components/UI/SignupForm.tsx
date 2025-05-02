"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { signUpSchema } from "@/schemas/signUpSchema";
import { useToast } from "./useToast";
import { Form, Input, Button, Divider, Card, CardBody } from "@heroui/react";
import { MailIcon } from "../icons/Mail";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const SignupForm = () => {
    const router = useRouter();
    const showToast = useToast();

    const [verifying, setVerifying] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [authError, setAuthError] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { signUp, isLoaded, setActive } = useSignUp();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        setAuthError(null);
        try {
            if (!isLoaded) return;
            console.log(data);

            await signUp.create({
                emailAddress: data.email,
                password: data.password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            showToast({
                title: "Check your inbox",
                description: "Verification code sent to your email",
                color: "success",
            });

            setVerifying(true);
        } catch (error: any) {
            console.error(error);
            setAuthError(error.errors?.[0]?.message || "Something went wrong");
            showToast({
                title: "Signup Error",
                description: error.errors?.[0]?.message || "Failed to sign up",
                color: "danger",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setVerifyError(null);
        try {
            if (!isLoaded || !signUp) return;

            const result = await signUp.attemptEmailAddressVerification({ code: verifyCode });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                showToast({
                    title: "Verification Successful",
                    description: "You are now signed in",
                    color: "success",
                });
                router.push("/");
            } else {
                setVerifyError("Verification could not be completed.");
            }
        } catch (error: any) {
            console.log(error);
            setVerifyError(error.errors?.[0]?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex  justify-center  px-4">
            <Card className="w-full h-fit max-w-md p-6 shadow-xl  rounded-xl">
                <CardBody>
                    {verifying ? (
                        <>
                            <h2 className="text-xl font-semibold mb-4 text-center">Verify your email</h2>
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <Input
                                    label="Verification Code"
                                    placeholder="Enter verification code"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value)}
                                    isRequired
                                />
                                {verifyError && (
                                    <div className="text-red-500 text-sm">{verifyError}</div>
                                )}
                                <Button type="submit" isLoading={isSubmitting} color="primary" fullWidth>
                                    Verify
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-2 text-center">Sign Up</h2>
                            <p className="text-sm text-gray-500 mb-6 text-center">Create a new account</p>

                            <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <Input
                                    {...register("email")}
                                    isRequired
                                    errorMessage={errors.email?.message}
                                    label="Email"
                                    placeholder="Enter your email"
                                    type="email"
                                    startContent={<MailIcon className="text-xl text-default-400" />}
                                    labelPlacement="outside"
                                />
                                <div className="w-full relative">
                                    <Input
                                        {...register("password")}
                                        isRequired
                                        errorMessage={errors.password?.message}
                                        label="Password"
                                        placeholder="Enter your password"
                                        type={showPassword ? "text" : "password"}
                                        labelPlacement="outside"

                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute top-9 right-3 text-gray-500"
                                    >
                                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                    </button>
                                </div>

                                <div className="w-full relative" >
                                    <Input
                                        {...register("confirmPassword")}
                                        isRequired
                                        errorMessage={errors.confirmPassword?.message}
                                        label="Confirm Password"
                                        placeholder="Re-enter your password"
                                        type={showConfirm ? "text" : "password"}
                                        labelPlacement="outside"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((prev) => !prev)}
                                        className="absolute top-9 right-3 text-gray-500"
                                    >
                                        {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                    </button>
                                </div>

                                <Divider />
                                {authError && <div className="text-red-500 text-sm">{authError}</div>}
                                <div id="clerk-captcha" className="my-4" />
                                <Button type="submit" isLoading={isSubmitting} color="primary" fullWidth>
                                    Sign Up
                                </Button>
                            </Form>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default SignupForm;
