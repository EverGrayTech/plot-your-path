import { appMetadata } from "../../src/app-metadata";
import { GET } from "../../src/app/app-metadata.json/route";

import packageJson from "../../package.json";

describe("app metadata route", () => {
  it("returns the structured app metadata as json", async () => {
    const response = GET();

    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual(appMetadata);
  });

  it("includes the package version in the payload", async () => {
    const response = GET();
    const payload = await response.json();

    expect(payload.version).toBe(packageJson.version);
  });
});
