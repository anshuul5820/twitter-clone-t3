/*
prefetch data & render it to page
 */
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "./root";
import SuperJSON from "superjson";
import { createInnerTRPCContext } from "./trpc";

export function ssgHelper() {
  return createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null, revalidateSSG: null }), //in ssg, no user-> user=null
    transformer: SuperJSON,
  });
}
