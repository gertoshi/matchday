type AuthLogoProps = {
    description?: string;
};

export default function AuthLogo({
    description = 'Iniciá sesión para gestionar tus torneos.',
}: AuthLogoProps) {
    return (
        <div className="mb-8 text-center">
            <img
                src="/images/matchday-logo.jpeg"
                alt="Matchday"
                className="mx-auto mb-4 h-28 w-full max-w-[260px] object-contain"
            />

            {description && (
                <p className="text-sm text-gray-500">
                    {description}
                </p>
            )}
        </div>
    );
}
