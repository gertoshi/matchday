import type { ReactNode } from 'react';

type AuthCardProps = {
    children: ReactNode;
};

export default function AuthCard({ children }: AuthCardProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
            <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
                {children}
            </section>
        </main>
    );
}