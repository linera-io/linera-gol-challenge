// Linera network configuration
export const LINERA_RPC_URL = "https://faucet.testnet-conway.linera.net/";

// Game of Life scoring chain IDs
export const GOL_SCORING_CHAIN_IDS = [
  "74b5850ecf6a7389523f7a9748dc6f81fc71533757f617b65e5c9f01fa1430b8",
  "3e6bdd095d2e4e30f12e8da38ea1409f2442696b01badbda4226577df09479ff",
  "78bfe088e0e6ab2acbb894c7bac4b537650a98ca7337667cef38359b6c590508",
  "d6e2e25987b75a51f9ac1df8851bd0e0d16d858e7e2896b1e9d511bac8e13f92"
]

// Game of Life application ID
export const GOL_APP_ID = "750eb4b947761eeece6c52fd488ec23442dce240fab150b93ea2212b014aaace";

// Previous application IDs. (This is used to mark puzzles as solved in the UI.)
export const PREVIOUS_GOL_APP_IDS = ["27145fa604adf9996647a9a2add1dafe8f80f1a547835edf62ee408cd8903dd3"];

// Dynamic wallet configuration (sandbox)
export const DYNAMIC_SANDBOX_ENVIRONMENT_ID = "cf12f3ef-d589-499c-8acb-be7cc211c6e0";

// Dynamic wallet configuration (live)
export const DYNAMIC_LIVE_ENVIRONMENT_ID = "0f2cf892-98a5-43cb-8ebb-3881229a0610";
