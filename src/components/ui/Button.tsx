interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isLoading?: boolean;
}

export function Button({ children, className = "", isLoading = false, ...props }: ButtonProps) {
    return (
        <button
            className={`w-full flex  min-h-[56px] duration-200 hover:scale-105  mx-auto rounded-xl shadow-lg items-center gap-2 justify-center bg-gradient-to-r from-pink-500 via-violet-400 to-sky-400 text-white py-3 px-6  transition-all disabled:opacity-50 disabled:cursor-not-allowed  ${className}`}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                </div>
            ) : (
                children
            )}
        </button>
    );
}
