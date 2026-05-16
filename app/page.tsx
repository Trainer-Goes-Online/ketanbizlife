import { redirect } from "next/navigation";
import { clientConfig } from "@/client.config";

export default function RootPage() {
  redirect(`/${clientConfig.funnel.slug}`);
}
