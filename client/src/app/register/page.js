import Link from "next/link";
import AuthShell from "@/components/layout/AuthShell";
import RegisterForm from "@/components/sections/RegisterForm";

export const metadata = { title: "Create account | CampusKart" };

export default function RegisterPage() {
    return (
        <AuthShell
            title="Create your account"
            subtitle="Buy and sell on campus in a minute."
            footer={
                <>
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-accent underline-offset-4 hover:underline"
                    >
                        Log in
                    </Link>
                </>
            }
        >
            <RegisterForm />
        </AuthShell>
    );
}