import axios from "axios";
import useSWR from "swr";

type RawUser = {
    username: string;
    wallet_address: string;
    joined_at: { _seconds: number; _nanoseconds: number };
    wallet_type: string;
    fid: number;
};

type ParsedUser = Omit<RawUser, "joined_at"> & { joined_at: Date };

export function useWaitlistData() {
    const { data, isLoading } = useSWR<{
        whitelisted: boolean;
        data: RawUser[] | null | undefined;
    }>(["waitlistData"], async () => {
        const { data } = await axios.get(`/api/waitlist`);
        return data;
    });

    const parsedData: ParsedUser[] | undefined = data?.data?.map((user) => ({
        ...user,
        joined_at: new Date(user.joined_at._seconds * 1000),
    }));

    return {
        data: parsedData,
        isLoading: isLoading,
    };
}
