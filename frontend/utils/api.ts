export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const postJson = async <TData = unknown, TResponse = unknown>(
  path: string,
  data: TData,
  token?: string
): Promise<TResponse> => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Request failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as TResponse;
};
