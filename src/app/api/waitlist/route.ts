import { db } from "~/lib/firebaseAdmin";

const BATCH_SIZE = 1000;

export async function GET() {
    try {
        const data: any[] = [];
        let lastDoc = null;
        let hasMore = true;

        while (hasMore) {
            let query = db.collection("Waitlist").orderBy("joined_at").limit(BATCH_SIZE);

            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const snapshot = await query.get();

            if (snapshot.empty) {
                hasMore = false;
                break;
            }

            const batch = snapshot.docs.map((doc) => ({
                fid: doc.id,
                ...doc.data(),
            }));

            data.push(...batch);
            lastDoc = snapshot.docs[snapshot.docs.length - 1];

            if (snapshot.size < BATCH_SIZE) {
                hasMore = false;
            }
        }

        return new Response(JSON.stringify({ success: true, data }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error fetching waitlist:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
