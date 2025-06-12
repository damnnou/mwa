"use client";

import Header from "~/components/Header";
import { useWaitlistData } from "~/hooks/useWaitlist";
import { useMemo, useState, useEffect } from "react";
import { cn } from "~/lib/utils";
import { RegistrationChart } from "~/components/RegistrationChart";
import { useRouter, useSearchParams } from "next/navigation";
import { getPageNumbers } from "~/lib/getPageNumbers";

const USERS_PER_PAGE = 50;

export default function MainPage() {
    const { data, isLoading } = useWaitlistData();

    const router = useRouter();
    const searchParams = useSearchParams();

    // Получаем страницу из url или по умолчанию 1
    const initialPage = Number(searchParams?.get("page") ?? "1");
    const [page, setPage] = useState(initialPage > 0 ? initialPage : 1);

    // Если URL параметр изменился, обновляем состояние страницы
    useEffect(() => {
        const currentPage = Number(searchParams?.get("page") ?? "1");
        if (currentPage > 0 && currentPage !== page) {
            setPage(currentPage);
        }
    }, [searchParams]);

    // При смене страницы обновляем URL параметр
    const setPageAndUpdateURL = (newPage: number) => {
        if (!searchParams) return;
        setPage(newPage);
        // Обновляем URL параметр, сохраняя остальные параметры
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set("page", newPage.toString());
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    // ... [Твой код по вычислению статистик — оставляем без изменений] ...

    const { total, last24h, last24hChange, last7d, last7dChange } = useMemo(() => {
        if (!data) {
            return {
                total: 0,
                last24h: 0,
                last24hPrev: 0,
                last24hChange: 0,
                last7d: 0,
                last7dPrev: 0,
                last7dChange: 0,
            };
        }

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const total = data.length;
        const last24h = data.filter((item) => item.joined_at > oneDayAgo).length;
        const last24hPrev = data.filter((item) => item.joined_at <= oneDayAgo && item.joined_at > twoDaysAgo).length;

        const last7d = data.filter((item) => item.joined_at > sevenDaysAgo).length;
        const last7dPrev = data.filter((item) => item.joined_at <= sevenDaysAgo && item.joined_at > fourteenDaysAgo).length;

        const last24hChange = last24hPrev ? ((last24h - last24hPrev) / last24hPrev) * 100 : last24h > 0 ? 100 : 0;
        const last7dChange = last7dPrev ? ((last7d - last7dPrev) / last7dPrev) * 100 : last7d > 0 ? 100 : 0;

        return {
            total,
            last24h,
            last24hPrev,
            last24hChange,
            last7d,
            last7dPrev,
            last7dChange,
        };
    }, [data]);

    const formatChange = (change: number) => `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;

    const [expanded, setExpanded] = useState<number | null>(null);
    const [walletFilter, setWalletFilter] = useState<"all" | "external" | "native">("all");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Отфильтрованные и отсортированные пользователи
    const filteredUsers = useMemo(() => {
        if (!data) return [];

        const filtered = walletFilter === "all" ? data : data.filter((user) => user.wallet_type === walletFilter);

        const sorted = [...filtered].sort((a, b) => {
            const aTime = new Date(a.joined_at).getTime();
            const bTime = new Date(b.joined_at).getTime();
            return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        });

        return sorted;
    }, [data, walletFilter, sortOrder]);

    // Пагинация — вычисляем пользователей текущей страницы
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

    if (isLoading)
        return (
            <div className="flex flex-col items-center mx-auto max-w-[1024px] w-full h-full">
                <Header />
                <div className="flex flex-col mt-12 items-center w-full">
                    <div className="flex flex-col gap-2 items-center bg-white w-full rounded-2xl p-4 shadow-xl">
                        <h3>Loading...</h3>
                    </div>
                </div>
            </div>
        );

    return (
        <div className="flex flex-col items-center mx-auto max-w-[1024px] w-full h-full">
            <Header />

            <div className="flex flex-col mt-12 items-center w-full">
                <div className="grid grid-cols-3 max-lg:grid-cols-1 w-full gap-4">
                    <div className="flex flex-col gap-2 items-start bg-white rounded-2xl p-4 shadow-xl">
                        <h3>Total Users</h3>
                        <p className="text-3xl font-bold">{total}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-start bg-white rounded-2xl p-4 shadow-xl">
                        <h3>Joined Last 24h</h3>
                        <div className="flex w-full items-center justify-between">
                            <p className="text-3xl font-bold">{last24h}</p>
                            <span className={cn("text-xl", last24hChange > 0 ? "text-green-600" : "text-red-500")}>
                                {formatChange(last24hChange)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-start bg-white rounded-2xl p-4 shadow-xl">
                        <h3>Joined Last 7 Days</h3>
                        <div className="flex w-full items-center justify-between">
                            <p className="text-3xl font-bold">{last7d}</p>
                            <span className={cn("text-xl", last7dChange > 0 ? "text-green-600" : "text-red-500")}>
                                {formatChange(last7dChange)}
                            </span>
                        </div>
                    </div>
                </div>

                <RegistrationChart data={data || []} />

                <div className="my-12 w-full">
                    <div className="flex max-lg:flex-col gap-4 items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Waitlist Users ({filteredUsers.length})</h2>

                        <div className="flex gap-2">
                            {["all", "external", "native"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setWalletFilter(type as any)}
                                    className={`px-4 py-1 rounded-full border transition ${
                                        walletFilter === type ? "bg-black text-white" : "bg-white text-black border-black/30"
                                    }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}

                            <button
                                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                                className="lg:px-4 lg:py-1 rounded-full border bg-white text-black border-black/30"
                                title="Toggle sort by date"
                            >
                                Sort by: <span>{sortOrder === "asc" ? "Oldest" : "Newest"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {paginatedUsers.map((user, index) => {
                            const isOpen = expanded === index + (page - 1) * USERS_PER_PAGE;

                            return (
                                <div key={user.fid} className="shadow-md bg-white rounded-2xl">
                                    <button
                                        onClick={() => setExpanded(isOpen ? null : index + (page - 1) * USERS_PER_PAGE)}
                                        className="w-full flex justify-between items-center px-4 py-3 font-medium duration-200 rounded-2xl hover:bg-gray-100"
                                    >
                                        <span>{user.username}</span>
                                        <span
                                            className={cn(
                                                "text-sm",
                                                user.joined_at.getTime() > new Date().getTime() - 24 * 60 * 60 * 1000
                                                    ? "text-green-600"
                                                    : "text-gray-500"
                                            )}
                                        >
                                            {new Date(user.joined_at).toLocaleString("ru")}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div className="px-4 pt-2 pb-4 text-sm text-gray-700 space-y-1">
                                            <div>
                                                <strong>FID:</strong> {user.fid}
                                            </div>
                                            <div>
                                                <strong>Farcaster Profile:</strong>{" "}
                                                <a className="underline" target="_blank" href={`https://farcaster.xyz/${user.username}`}>
                                                    https://farcaster.xyz/{user.username}
                                                </a>
                                            </div>
                                            <div>
                                                <strong>Wallet Type:</strong> {user.wallet_type}
                                            </div>
                                            <div>
                                                <strong>Wallet Address:</strong> {user.wallet_address}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPageAndUpdateURL(page - 1)}
                            className="px-4 py-2 rounded border bg-white max-lg:hidden disabled:opacity-50"
                        >
                            Previous
                        </button>

                        {getPageNumbers(page, totalPages).map((p, idx) =>
                            p === "..." ? (
                                <span key={`dots-${idx}`} className="px-3 py-1">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => setPageAndUpdateURL(p as number)}
                                    className={cn("px-3 py-1 rounded border", p === page ? "bg-black text-white" : "bg-white text-black")}
                                >
                                    {p}
                                </button>
                            )
                        )}

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPageAndUpdateURL(page + 1)}
                            className="px-4 py-2 rounded border  max-lg:hidden bg-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
