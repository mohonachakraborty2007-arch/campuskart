import { Suspense } from "react";
import VerifyEmailView from "@/components/sections/VerifyEmailView";

export const metadata = { title: "Verify your email | CampusKart" };

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailView />
        </Suspense>
    );
}