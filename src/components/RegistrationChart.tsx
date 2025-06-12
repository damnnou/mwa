import { useEffect, useMemo, useRef, useState } from "react";
import { createChart, LineSeries, Time, type IChartApi } from "lightweight-charts";
import { ParsedUser } from "~/hooks/useWaitlist";

const intervals = {
    ["10m"]: 10 * 60 * 1000,
    ["1h"]: 60 * 60 * 1000,
    ["4h"]: 4 * 60 * 60 * 1000,
    ["12h"]: 12 * 60 * 60 * 1000,
    ["24h"]: 24 * 60 * 60 * 1000,
};

function aggregateCounts(data: ParsedUser[], bucketSizeMs: number) {
    const now = Date.now();
    const earliest = Math.min(...data.map((u) => u.joined_at.getTime()));
    const start = Math.floor(earliest / bucketSizeMs) * bucketSizeMs;

    const buckets: { [key: number]: number } = {};

    for (let t = start; t <= now; t += bucketSizeMs) {
        buckets[t] = 0;
    }

    for (const u of data) {
        const t = Math.floor(u.joined_at.getTime() / bucketSizeMs) * bucketSizeMs;
        if (buckets[t] !== undefined) {
            buckets[t]++;
        }
    }

    const points = Object.entries(buckets).map(([timestamp, value]) => ({
        time: Math.floor(Number(timestamp) / 1000) as Time,
        value,
    }));

    return points;
}

export function RegistrationChart({ data }: { data: ParsedUser[] }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [interval, setInterval] = useState<"10m" | "1h" | "4h" | "12h" | "24h">("10m");

    const chartData = useMemo(() => {
        if (!data) return [];
        return aggregateCounts(data, intervals[interval]);
    }, [interval, data]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: {
                background: { color: "#ffffff" },
                textColor: "#000000",
            },
            grid: {
                vertLines: { color: "#e0e0e0" },
                horzLines: { color: "#e0e0e0" },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            localization: {
                timeFormatter: (time: number) => {
                    const date = new Date(time * 1000);
                    return date.toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                },
            },
        });

        const lineSeries = chart.addSeries(LineSeries, {
            priceFormat: {
                type: "custom",
                formatter: (price: number) => Math.round(price).toString(),
            },
        });
        lineSeries.setData(chartData);
        chartRef.current = chart;
        chart.timeScale().fitContent();

        return () => {
            chart.remove();
        };
    }, [chartData]);

    return (
        <div className="w-full mt-12 flex flex-col gap-4">
            <div className="flex max-lg:flex-col justify-between items-center mb-2 gap-2">
                <h2 className="text-xl font-bold">Registrations Chart</h2>
                <div className="flex gap-2">
                    {["10m", "1h", "4h", "12h", "24h"].map((intv) => (
                        <button
                            key={intv}
                            onClick={() => setInterval(intv as any)}
                            className={`px-3 py-1 max-w-12 rounded-full text-sm border ${
                                interval === intv ? "bg-black text-white" : "bg-white text-black border-gray-300"
                            }`}
                        >
                            {intv}
                        </button>
                    ))}
                </div>
            </div>
            <div ref={chartContainerRef} className="w-full rounded-xl shadow-md overflow-hidden bg-white" />
        </div>
    );
}
