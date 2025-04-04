import { useQuery } from "@tanstack/react-query";
import { getFacultyByIdQueryOptions } from "@/lib/api";

export const facultyLoader = async ({
  params,
}: {
  params: { facultyId: string };
}) => {
  const { facultyId } = params;
  const { data } = useQuery(getFacultyByIdQueryOptions(facultyId));

  if (!data) throw new Error("failed to fetch faculty member");

  return data;
};
