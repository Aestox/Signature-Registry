type SearchableRegistryRecord = {
  fullName: string;
  position: string | null;
  depot: string | null;
};

export function filterRegistryRecords<T extends SearchableRegistryRecord>(
  records: readonly T[],
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");
  if (!normalizedQuery) return [...records];

  return records.filter((record) =>
    [record.fullName, record.position, record.depot].some((value) =>
      value?.toLocaleLowerCase("ru").includes(normalizedQuery),
    ),
  );
}
