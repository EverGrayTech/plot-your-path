import { appMetadata } from "../../app-metadata";

export function GET() {
  return Response.json(appMetadata);
}
