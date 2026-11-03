import { dnsFailureMessage } from "./dns-status";

describe("dnsFailureMessage", () => {
  test("completed lookups (with or without records) are not failures", () => {
    expect(dnsFailureMessage("ok")).toBeNull();
    expect(dnsFailureMessage("not_found")).toBeNull();
    expect(dnsFailureMessage(undefined)).toBeNull();
  });

  test("failed lookups explain why there is no answer", () => {
    expect(dnsFailureMessage("timeout")).toMatch(/timeout/);
    expect(dnsFailureMessage("servfail")).toMatch(/SERVFAIL/);
    expect(dnsFailureMessage("error")).toMatch(/No se pudo completar/);
  });
});
