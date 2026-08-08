import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const { redirectMock, authMock, findUniqueMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  authMock: vi.fn(),
  findUniqueMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: findUniqueMock } },
}));

import { requireUser, requireRole, requireAdmin } from "@/lib/guards";

const OWNER_SESSION = { user: { id: "u1", name: null, email: "owner@techshop.iq", role: "owner" } };
const CUSTOMER_SESSION = { user: { id: "u2", name: null, email: "c@techshop.iq", role: "customer" } };
const DB_OWNER = { id: "u1", email: "owner@techshop.iq", role: "owner", isBlocked: false };
const DB_CUSTOMER = { id: "u2", email: "c@techshop.iq", role: "customer", isBlocked: false };

function expectRedirect(promise: Promise<unknown>, url: string) {
  return expect(promise).rejects.toThrow(`REDIRECT:${url}`);
}

describe("requireUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    await expectRedirect(requireUser(), "/login");
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when the user record is missing", async () => {
    authMock.mockResolvedValue(OWNER_SESSION);
    findUniqueMock.mockResolvedValue(null);
    await expectRedirect(requireUser(), "/login");
  });

  it("redirects to /login when the user is blocked", async () => {
    authMock.mockResolvedValue(OWNER_SESSION);
    findUniqueMock.mockResolvedValue({ ...DB_OWNER, isBlocked: true });
    await expectRedirect(requireUser(), "/login");
  });

  it("returns the freshened session when the user is unblocked", async () => {
    authMock.mockResolvedValue(OWNER_SESSION);
    findUniqueMock.mockResolvedValue(DB_OWNER);
    const session = await requireUser();
    expect(session.user.role).toBe("owner");
    expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: "u1" }, select: expect.any(Object) });
  });
});

describe("requireRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    await expectRedirect(requireRole("owner"), "/login");
  });

  it("redirects to / when the role does not match", async () => {
    authMock.mockResolvedValue(CUSTOMER_SESSION);
    findUniqueMock.mockResolvedValue(DB_CUSTOMER);
    await expectRedirect(requireRole("owner"), "/");
  });

  it("returns the session when the role matches", async () => {
    authMock.mockResolvedValue(OWNER_SESSION);
    findUniqueMock.mockResolvedValue(DB_OWNER);
    const session = await requireRole("owner");
    expect(session.user.role).toBe("owner");
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to / for a customer", async () => {
    authMock.mockResolvedValue(CUSTOMER_SESSION);
    findUniqueMock.mockResolvedValue(DB_CUSTOMER);
    await expectRedirect(requireAdmin(), "/");
  });

  it("returns the session for an owner", async () => {
    authMock.mockResolvedValue(OWNER_SESSION);
    findUniqueMock.mockResolvedValue(DB_OWNER);
    const session = await requireAdmin();
    expect(session.user.role).toBe("owner");
  });
});