import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL!;

export function middleware(req: NextRequest) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    const isValidOrigin = !origin || origin === ALLOWED_ORIGIN || (referer && referer.startsWith(ALLOWED_ORIGIN));

    if (!isValidOrigin) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};
