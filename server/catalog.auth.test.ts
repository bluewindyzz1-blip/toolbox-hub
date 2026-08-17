import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createGuestContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("catalog administrator access", () => {
  it("rejects category administration for a non-authenticated caller", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(caller.catalog.adminSnapshot()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
