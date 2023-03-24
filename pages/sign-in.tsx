import SignInPage from "@/components/SignInPage";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";

export default function SignIn()
{
	return <SignInPage />
}


export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
	const serverClient = createServerSupabaseClient(context);
	const { data: { session }} = await serverClient.auth.getSession();

	if (session)
	{
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		}
	}
	else
	{
		return {
			props: {
				session: null
			}
		}
	}
}