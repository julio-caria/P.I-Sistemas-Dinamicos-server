import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { randomInt, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { server } from "../../helpers/server.ts";
import { db } from "../../../src/database/client.ts";
import { suppliers } from "../../../src/database/schema.ts";
import { createAuthenticatedSession } from "../../helpers/auth.ts";

describe("POST /api/v1/suppliers", () => {
  let auth: Awaited<ReturnType<typeof createAuthenticatedSession>>;
  const createdSupplierIds: string[] = [];

  beforeAll(async () => {
    await server.ready();
    auth = await createAuthenticatedSession();
  });

  afterEach(async () => {
    while (createdSupplierIds.length > 0) {
      const id = createdSupplierIds.pop()!;
      await db.delete(suppliers).where(eq(suppliers.id, id));
    }
  });

  afterAll(async () => {
    await auth.cleanup();
    await server.close();
  });

  function buildSupplierPayload(suffix: string) {
    const base = String(randomInt(10000000, 100000000));
    const digit = String(randomInt(10, 100));
    const phoneSuffix = String(randomInt(1000, 10000));

    return {
      legalName: `Editora Acadêmica ${suffix} Ltda`,
      cnpj: `${base.slice(0, 2)}.${base.slice(2, 5)}.${base.slice(5, 8)}/0001-${digit}`,
      stateRegistration: "110.042.490.114",
      email: `contato.${suffix}@fornecedor.test`,
      phone: `(11) 3344-${phoneSuffix}`,
      address: "Av. Lins de Vasconcelos, 1222 - São Paulo, SP",
      category: "Material Didático",
    };
  }

  it("should create a valid supplier and return 201 with supplierId", async () => {
    const suffix = randomUUID().slice(0, 8);
    const payload = buildSupplierPayload(suffix);

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/suppliers",
      headers: {
        authorization: `Bearer ${auth.token}`,
      },
      payload,
    });

    const body = response.json();
    if (body.supplierId) {
      createdSupplierIds.push(body.supplierId);
    }

    expect(response.statusCode).toBe(201);
    expect(body).toMatchObject({
      message: "Fornecedor cadastrado com sucesso.",
    });
    expect(typeof body.supplierId).toBe("string");

    const [saved] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, body.supplierId));

    expect(saved).toBeDefined();
    expect(saved.legalName).toBe(payload.legalName);
    expect(saved.cnpj).toBe(payload.cnpj);
    expect(saved.stateRegistration).toBe("110.042.490.114");
    expect(saved.category).toBe("Material Didático");
    expect(saved.isActive).toBe(true);
  });

  it("should store stateRegistration as null when omitted", async () => {
    const suffix = randomUUID().slice(0, 8);
    const { stateRegistration: _omitted, ...payloadWithoutIE } =
      buildSupplierPayload(suffix);

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/suppliers",
      headers: {
        authorization: `Bearer ${auth.token}`,
      },
      payload: payloadWithoutIE,
    });

    const body = response.json();
    if (body.supplierId) {
      createdSupplierIds.push(body.supplierId);
    }

    expect(response.statusCode).toBe(201);

    const [saved] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, body.supplierId));

    expect(saved.stateRegistration).toBeNull();
  });

  it("should return 409 when CNPJ is already registered", async () => {
    const suffix = randomUUID().slice(0, 8);
    const firstPayload = buildSupplierPayload(`${suffix}a`);

    const firstResponse = await server.inject({
      method: "POST",
      url: "/api/v1/suppliers",
      headers: {
        authorization: `Bearer ${auth.token}`,
      },
      payload: firstPayload,
    });

    const firstBody = firstResponse.json();
    if (firstBody.supplierId) {
      createdSupplierIds.push(firstBody.supplierId);
    }

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await server.inject({
      method: "POST",
      url: "/api/v1/suppliers",
      headers: {
        authorization: `Bearer ${auth.token}`,
      },
      payload: {
        ...buildSupplierPayload(`${suffix}b`),
        cnpj: firstPayload.cnpj,
      },
    });

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.json()).toEqual({
      message: "Supplier already registered!",
    });
  });

  it("should return 400 when required fields fail validation", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/suppliers",
      headers: {
        authorization: `Bearer ${auth.token}`,
      },
      payload: {
        legalName: "A",
        cnpj: "123",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("should return 401 when Authorization header is missing", async () => {
    const suffix = randomUUID().slice(0, 8);

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/suppliers",
      payload: buildSupplierPayload(suffix),
    });

    expect(response.statusCode).toBe(401);
  });
});