import axios from "axios";
import useSWR from "swr";

type RawUser = {
    username: string;
    wallet_address: string;
    joined_at: string;
    wallet_type: string;
    fid: number;
};

export type ParsedUser = Omit<RawUser, "joined_at"> & { joined_at: Date };

export function useWaitlistData() {
    const { data, isLoading } = useSWR<RawUser[]>(["waitlistData"], async () => {
        const { data } = await axios.get(`api/waitlist`);
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
