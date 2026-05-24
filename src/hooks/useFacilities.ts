import { apis } from "@/apis";
import { Facility } from "@/types/facility";
import { useQuery } from "@tanstack/react-query";

interface UseFacilitiesOptions {
  search?: string;
}

export function useFacilities({ search = "" }: UseFacilitiesOptions = {}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["facilities"],
    queryFn: apis.facilities.list,
    staleTime: 5 * 60 * 1000,
  });

  const facilities = (data?.results ?? []).filter((facility: Facility) =>
    facility.name.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    facilities,
    isLoading,
    isError,
  };
}
