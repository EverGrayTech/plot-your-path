import { readFileSync } from "node:fs";
import path from "node:path";

import packageJson from "../../package.json";
import { appMetadata } from "../../src/app-metadata";

describe("generated app metadata artifact", () => {
  it("matches the structured app metadata json payload", () => {
    const artifactPath = path.join(process.cwd(), "public", "app-metadata.json");
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

    expect(artifact).toEqual(appMetadata);
  });

  it("includes the package version in the payload", () => {
    const artifactPath = path.join(process.cwd(), "public", "app-metadata.json");
    const payload = JSON.parse(readFileSync(artifactPath, "utf8"));

    expect(payload.version).toBe(packageJson.version);
  });
});
