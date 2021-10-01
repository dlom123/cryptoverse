<template>
  <v-container fluid class="pa-0 ma-0 fill-height">
    <v-row no-gutters class="fill-height">
      <v-col class="ma-0 pa-0">
        <Cryptoverse />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Cryptoverse from "@/components/Cryptoverse";

export default {
  name: "Home",
  components: {
    Cryptoverse,
  },
  data: () => ({
    numCoins: 10,
    coinSize: 64,
    coins: [
      { rank: 1, name: "Bitcoin", symbol: "BTC" },
      { rank: 2, name: "Ethereum", symbol: "ETH" },
      { rank: 3, name: "Cardano", symbol: "ADA" },
      { rank: 4, name: "Tether", symbol: "USDT" },
      { rank: 5, name: "Binance Coin", symbol: "BNB" },
      { rank: 6, name: "XRP", symbol: "XRP" },
      { rank: 7, name: "Solana", symbol: "SOL" },
      { rank: 8, name: "USD Coin", symbol: "USDC" },
      { rank: 9, name: "Polkadot", symbol: "DOT" },
      { rank: 10, name: "Dogecoin", symbol: "DOGE" },
    ],
  }),
};
</script>
