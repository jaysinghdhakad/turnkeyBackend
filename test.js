
const { Turnkey } = require("@turnkey/sdk-server");
const { TurnkeySigner } = require('@turnkey/ethers')
const ethers = require('ethers')

const userAddress = "0x9CA3E77B9656fAFd1DA7bf62c3b2109dED5b944a" //wallet address
const turnkeyConfig = {
  TURNKEY_ORGANIZATION_ID: "a9863492-030c-4d37-958f-3b53ec872d9a",
  TURNKEY_API_PRIVATE_KEY: "b673c6c60fe58cd6cd895c89a417fcd0b8049f4a770b60a1cd7327b495e6165d",
  TURNKEY_API_PUBLIC_KEY: "02ea48a36962388ebadc369dc67d270f8bf760ac027e517a7cdf02a02efbba24b3",
}

const Erc20Abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const swapConfig = {
  slippage: "10",
  amount: "10000000000",
  tokenIn: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Swapped with tokenOut
  tokenOut: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Swapped with tokenIn
  sender: userAddress,
  receiver: userAddress,
  chainID: 8453,
  isDelegate: false,
  feeReceiver: '0xf7b25C8B97C455eC2c4977290ae13ED5267A5d34',
  feeBps: 100,
  skipSimulation: true
}



const turnkeyClient = async () => {
  console.log("turnkeyConfig TURNKEY_API_PRIVATE_KEY", turnkeyConfig.TURNKEY_API_PRIVATE_KEY)
  console.log("turnkeyConfig TURNKEY_API_PUBLIC_KEY", turnkeyConfig.TURNKEY_API_PUBLIC_KEY)
  console.log("turnkeyConfig TURNKEY_ORGANIZATION_ID", turnkeyConfig.TURNKEY_ORGANIZATION_ID)
  const turnkey = new Turnkey({
    defaultOrganizationId: turnkeyConfig.TURNKEY_ORGANIZATION_ID,
    apiBaseUrl: 'https://api.turnkey.com',
    apiPrivateKey: turnkeyConfig.TURNKEY_API_PRIVATE_KEY,
    apiPublicKey: turnkeyConfig.TURNKEY_API_PUBLIC_KEY,
  })

  const apiClient = turnkey.apiClient()

  return apiClient
}

const getTurnkeySigner = async (address) => {
  const turnkey = new Turnkey({
    defaultOrganizationId: turnkeyConfig.TURNKEY_ORGANIZATION_ID,
    apiBaseUrl: 'https://api.turnkey.com',
    apiPrivateKey: turnkeyConfig.TURNKEY_API_PRIVATE_KEY,
    apiPublicKey: turnkeyConfig.TURNKEY_API_PUBLIC_KEY,
  })
  const apiClient = turnkey.apiClient()
  const turnkeySigner = new TurnkeySigner({
    client: apiClient,
    organizationId: turnkeyConfig.TURNKEY_ORGANIZATION_ID,
    signWith: address,
  })
  const provider = new ethers.JsonRpcProvider(
    `https://base-mainnet.g.alchemy.com/v2/QDFlkfQUNnP6Izn4-PwAs7xQIkRXDrla`
  )
  const connectedSigner = turnkeySigner.connect(provider)
  return connectedSigner
}

const main = async () => {
  const provider = new ethers.JsonRpcProvider(
    `https://base-mainnet.g.alchemy.com/v2/QDFlkfQUNnP6Izn4-PwAs7xQIkRXDrla`
  )
  const apiClient = await turnkeyClient();

  const walletsResponse = await apiClient.getWallets()


  const existingWallet = walletsResponse.wallets[0]

  const walletAddresses = await apiClient.getWalletAccounts({
    walletId: existingWallet.walletId,
  })
  console.log("walletAddresses", walletAddresses.accounts[0].address)

  const connectedSigner = await getTurnkeySigner(walletAddresses.accounts[0].address);

  const postUrl = 'https://metaagg.velvetdao.xyz/api/v1/route/evm/swap'

  // Convert params object to URL query string
  const queryString = new URLSearchParams(swapConfig).toString()
  const getUrl = `${postUrl}?${queryString}`
  let metaQuote;


  const latestNonce = await provider.getTransactionCount(
    userAddress,
    'latest'
  )

  // Get the pending nonce which includes pending transactions
  const pendingNonce = await provider.getTransactionCount(
    userAddress,
    'pending'
  )

  // Use the higher of the two nonces to ensure we don't reuse a nonce
  const safeNonce = Math.max(latestNonce, pendingNonce)
  const feeData = await provider.getFeeData()

  //better chances of inclusion
    const maxFeePerGas =
      (feeData.maxFeePerGas * BigInt(130)) / BigInt(100)
    const maxPriorityFeePerGas =
      (feeData.maxPriorityFeePerGas * BigInt(130)) / BigInt(100)
  try {
    const response = await fetch(getUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const errorDetails = await response.json()
      throw new Error(`${errorDetails.message}`)
    }

    metaQuote = await response.json()

  } catch (error) {
    console.error(error)
  }

  const sellTokenAddress = swapConfig.tokenIn
  if (sellTokenAddress != "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    console.log("sellTokenAddress", sellTokenAddress)
 
    const erc20ContractEthers = new ethers.Contract(
      sellTokenAddress,
      Erc20Abi,
      provider
    )
    console
    const approveTx = await erc20ContractEthers.approve.populateTransaction(
      ethers.getAddress('0x463A344bDD94b60D6cfDcAE0f4EABBC71a51Fd18'),
      swapConfig.amount)

    console.log("approveTx", approveTx.data)

    // Get the latest nonce from the network
 

    // Add 10% buffer to the current network fees for 

    const tx = {
      chainId: 8453,
      gasLimit: '18000000',
      nonce: safeNonce.toString(),
      to: sellTokenAddress,
      data: approveTx.data,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    }


    // Add retry logic for transaction sending
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        const transaction = await connectedSigner.sendTransaction(tx)

        console.log(transaction)
        break // Exit loop if successful
      } catch (error) {
        console.log('🚀 ~ handleTradeAmountClick ~ error:', error)
        if (
          error.code === 'NONCE_EXPIRED' &&
          retryCount < maxRetries - 1
        ) {
          // If nonce is expired and we haven't hit max retries, increment nonce and retry
          tx.nonce = (parseInt(tx.nonce) + 1).toString()
          retryCount++
          console.log(
            `Retrying with nonce ${tx.nonce} (attempt ${retryCount + 1})`
          )
          continue
        }
        throw error
      }
      // }
    }
  }

  console.log("metaQuote", metaQuote)



  const tx = {
    chainId: 8453,
    gasLimit: '18000000',
    nonce: safeNonce.toString(),
    to: metaQuote.data[0].to,
    data: metaQuote.data[0].data,
    value: metaQuote.data[0].value,
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  }

  console.log("tx", tx)

  // Add retry logic for transaction sending
  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries) {
    try {
      const transaction = await connectedSigner.sendTransaction(tx)

      console.log(transaction)
      break // Exit loop if successful
    } catch (error) {
      console.log('🚀 ~ handleTradeAmountClick ~ error:', error)
      if (
        error.code === 'NONCE_EXPIRED' &&
        retryCount < maxRetries - 1
      ) {
        // If nonce is expired and we haven't hit max retries, increment nonce and retry
        tx.nonce = (parseInt(tx.nonce) + 1).toString()
        retryCount++
        console.log(
          `Retrying with nonce ${tx.nonce} (attempt ${retryCount + 1})`
        )
        continue
      }
      throw error
    }
  }
}

const runMain = async () => {
  try {
    await main(); // Call the main function asynchronously
  } catch (error) {
    console.error('Error running main:', error);
  }
};

runMain();
