const express = require("express");
const { Turnkey } = require("@turnkey/sdk-server");
const { generateP256KeyPair, compressRawPublicKey } = require("@turnkey/crypto");
const { ethers } = require("ethers");
const cors = require("cors"); // Import the CORS middleware
require("dotenv").config(); // Ensure you have dotenv to load environment variables
const app = express();
app.use(express.json());
app.use(cors());

console.log({
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY,
  baseUrl: "https://api.turnkey.com",
  defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID
})

const serviceAccountKeys = generateP256KeyPair();

const serviceAccountPublicKey = serviceAccountKeys.publicKey;
const serviceAccountPrivateKey = serviceAccountKeys.privateKey;

const metaAggregatorManager = ethers.getAddress("0x463A344bDD94b60D6cfDcAE0f4EABBC71a51Fd18")
const metaAggregatorSwap = ethers.getAddress("0x7d6Dbe08F610cA1Ade4Fea11e5d40d0Fb9fAeCC7")

let rootUsers = []

const serviceAccount = {
  userName: "Service Account",
  apiKeys: [
    {
      apiKeyName: `Wallet Auth - ${serviceAccountPublicKey}`,
      publicKey: serviceAccountPublicKey,
      curveType: "API_KEY_CURVE_SECP256K1", // Adjust based on your wallet type
    },
  ],
  oauthProviders: [],
  authenticators: [],
  userTags: []
}

// Initialize the Turnkey Server Client
const turnkeyServer = new Turnkey({
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY,
  apiBaseUrl: "https://api.turnkey.com",
  defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID,
}).apiClient();
// Endpoint to create a sub-organization
app.post("/api/create-sub-organization", async (req, res) => {
  try {
    const subOrgData = req.body;

    console.log(subOrgData.params[0])
    subOrgData.params[0].rootUsers.push(serviceAccount)
    // Call the Turnkey API to create a sub-organization
    const response = await turnkeyServer.createSubOrganization(subOrgData.params[0]);
    console.log(response)

    rootUsers = response.rootUserIds;
    // Send the response back to the client
    res.status(200).json(response);
  } catch (error) {
    console.error("Error creating sub-organization:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/create-user", async (req, res) => {
  const userData = req.body;
  console.log(userData)
  const organizationId = userData.params[0];
  const users = userData.params[1];
  console.log(users)

  const serviceAccountServer = new Turnkey({
    apiPrivateKey: serviceAccountPrivateKey,
    apiPublicKey: serviceAccountPublicKey,
    apiBaseUrl: "https://api.turnkey.com",
    defaultOrganizationId: organizationId,
  }).apiClient();


  const response = await serviceAccountServer.createUsers(
    {
      organizationId: organizationId,
      users: users,
    });

  console.log(response)
  res.status(200).json(response);
  const paddedMetaAggregatorManager = ethers.zeroPadValue(metaAggregatorManager, 32).slice(2)


  const policyResponse = await serviceAccountServer.createPolicy({
    organizationId: organizationId,
    policyName: "Allow Delegated Account to sign transactions",

    effect: "EFFECT_ALLOW",
    consensus: `approvers.any(user, user.id == '${response.userIds[0]}')`,
    condition: `eth.tx.to == '${metaAggregatorManager}' || eth.tx.to == '${metaAggregatorSwap}'  || (eth.tx.data[0..10] == '0x095ea7b3' &&  eth.tx.data[10..42] == '${paddedMetaAggregatorManager}')`,
    notes: "Allow Delegated Account to sign transactions to specific address",
  })

  let rootUsersData = []

  for (let i = rootUsers.length - 1; i >= 0; i--) {
    const rootUser = rootUsers[i];
    console.log(rootUser)
    const user = await serviceAccountServer.getUser({
      organizationId: organizationId,
      userId: rootUser
    })
    if (user.user.userName == "Service Account") {
      const deletePolicy = await serviceAccountServer.createPolicy({
        organizationId: organizationId,
        policyName: "Allow user  to delete users",
        effect: "EFFECT_ALLOW",
        consensus: `approvers.any(user, user.id == '${user.user.userId}')`,
        condition: "activity.action == 'DELETE' && activity.resource == 'USER'",
        notes: "Allow user to delete users"
      })
      console.log(deletePolicy)
    } else {
      const updateResponse = await serviceAccountServer.updateRootQuorum({
        organizationId: organizationId,
        userIds: [user.user.userId],
        threshold: 1,
      })
      console.log(updateResponse)
    }
    rootUsersData.push(user)
  }
  for(const user of rootUsersData){
    console.log(user);
    if (user.user.userName == "Service Account") {
      const deleteUser = await serviceAccountServer.deleteUsers({
        organizationId: organizationId,
        userIds: [`${user.user.userId}`]
      })
      console.log(deleteUser)
    }
  }
  const finalOrganisation = await turnkeyServer.getOrganizationConfigs({organizationId: organizationId});
  console.log(finalOrganisation.configs.quorum.userIds)
})

app.post("/api/get-sub-org-ids", async (req, res) => {
  const userData = req.body;
  console.log(userData)

  const response = await turnkeyServer.getSubOrgIds(userData.params[0]);
  // const response = await turnkeyServer.getSubOrgIds();
  res.status(200).json(response);
})
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});