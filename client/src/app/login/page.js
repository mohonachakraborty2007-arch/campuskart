import { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/layout/AuthShell";
import LoginForm from "@/components/sections/LoginForm";

export const metadata = { title: "Log in | CampusKart" };

export default function LoginPage() {
    return (
        <AuthShell
            title="Welcome back"
            subtitle="Log in to message sellers and post items."
            footer={
                <>
                    New here?{" "}
                    <Link
                        href="/register"
                        className="text-accent underline-offset-4 hover:underline"
                    >
                        Create an account
                    </Link>
                </>
            }
        >
            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </AuthShell>
    );
}