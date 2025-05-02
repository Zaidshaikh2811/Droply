"use client"

import { useForm } from "react-hook-form"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema } from "@/schemas/SignInSchema"
import {
    Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Input, Checkbox, Button
} from "@heroui/react"
import { EyeFilledIcon, EyeSlashFilledIcon } from "../icons/EyePassword"
import { useToast } from "./useToast"

const SignInForm = () => {
    const router = useRouter()
    const { signIn, isLoaded, setActive } = useSignIn()
    const showToast = useToast()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => setIsVisible(!isVisible)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const signInAttempt = await signIn?.create({
                identifier: data.email,
                password: data.password,
            })

            if (signInAttempt?.status === "complete") {
                await setActive?.({ session: signInAttempt.createdSessionId })

                showToast({
                    title: "Sign in successful",
                    description: "You are now signed in.",
                    color: "success",
                })

                router.push("/")
            } else {
                showToast({
                    title: "Sign in failed",
                    description: "Invalid credentials.",
                    color: "danger",
                })
                setError("Invalid credentials")
            }
        } catch (err: any) {
            const message = err?.errors?.[0]?.message || "Something went wrong"
            showToast({
                title: "Sign in failed",
                description: message,
                color: "danger",
            })
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-[400px] flex mx-auto mt-10 p-5 shadow-lg">
            <CardHeader className="flex gap-3">
                <Image
                    alt="heroui logo"
                    height={40}
                    radius="sm"
                    src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                    width={40}
                />
                <div className="flex flex-col">
                    <p className="text-md">Sign In</p>
                </div>
            </CardHeader>

            <Divider />

            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        variant="bordered"
                        {...register("email")}
                        isInvalid={!!errors.email}
                        errorMessage={errors.email?.message}
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        type={isVisible ? "text" : "password"}
                        variant="bordered"
                        {...register("password")}
                        isInvalid={!!errors.password}
                        errorMessage={errors.password?.message}
                        endContent={
                            <button
                                aria-label="toggle password visibility"
                                className="focus:outline-none"
                                type="button"
                                onClick={toggleVisibility}
                            >
                                {isVisible ? (
                                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                ) : (
                                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                )}
                            </button>
                        }
                    />

                    <Checkbox defaultSelected color="success">
                        Remember me
                    </Checkbox>

                    <div id="clerk-captcha" />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        color="primary"
                        variant="ghost"
                        isLoading={isSubmitting}
                    >
                        Sign In
                    </Button>
                </form>
            </CardBody>

            <Divider />

            <CardFooter>
                <Link
                    isExternal
                    showAnchorIcon
                    href="https://github.com/heroui-inc/heroui"
                >
                    Visit source code on GitHub.
                </Link>
            </CardFooter>
        </Card>
    )
}

export default SignInForm
