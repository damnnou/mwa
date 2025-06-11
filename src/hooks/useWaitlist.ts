import axios from "axios";
import useSWR from "swr";

type RawUser = {
    username: string;
    wallet_address: string;
    joined_at: string;
    wallet_type: string;
    fid: number;
};

type ParsedUser = Omit<RawUser, "joined_at"> & { joined_at: Date };

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useWaitlistData() {
    const { data, isLoading } = useSWR<RawUser[]>(["waitlistData"], async () => {
        const { data } = await axios.get(`${API_URL}/waitlist`);
        return data;
    });

    const parsedData: ParsedUser[] | undefined = data?.map((user) => ({
        ...user,
        joined_at: new Date(user.joined_at),
    }));

    return {
        data: parsedData,
        isLoading: isLoading,
    };
}
