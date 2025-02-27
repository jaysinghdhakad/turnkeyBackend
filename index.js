const express = require("express");
const { Turnkey } = require("@turnkey/sdk-server");
const cors = require("cors"); // Import the CORS middleware
require("dotenv").config(); // Ensure you have dotenv to load environment variables
const app = express();
app.use(express.json());
app.use(cors());

console.log({  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY,
  baseUrl: "https://api.turnkey.com",
  defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID})

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
    console.log(subOrgData)
    console.log(subOrgData.rootUsers)
    console.log(subOrgData.params[0])
    console.log(subOrgData.rootQuorumThreshold)
    // Call the Turnkey API to create a sub-organization
    const response = await turnkeyServer.createSubOrganization(subOrgData.params[0]);
    console.log(response)
    // Send the response back to the client
    res.status(200).json(response);
  } catch (error) {
    console.error("Error creating sub-organization:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});