const { Turnkey } = require("@turnkey/sdk-server");
const dotenv = require("dotenv");
dotenv.config();
const turnkeyServer = new Turnkey({
    apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY,
    apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY,
    apiBaseUrl: "https://api.turnkey.com",
    defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID,
  }).apiClient();


  async function fetchUsers() {
    const users = await turnkeyServer.getPolicy({organizationId: "0a85de15-c0aa-49bf-8fb1-7e4f48d4137c", policyId: "03a88068-561e-47da-9761-7e3e04f3ffd3"});
    console.log(users)
}
(async function() {
  await fetchUsers();
})();
// ... e 