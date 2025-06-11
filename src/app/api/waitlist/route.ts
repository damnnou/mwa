import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET() {
    try {
        const response = await axios.get(`${API_URL}/waitlist`);

        return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Proxy error:", error.message || error);

        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
