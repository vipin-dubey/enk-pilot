import { redirect } from 'next/navigation';

export default async function RootPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams
  const queryString = new URLSearchParams(searchParams).toString()
  redirect(`/nb${queryString ? `?${queryString}` : ''}`);
}
