<template>
  <v-container fluid class="main-container pa-0 ma-0 fill-height">
    <v-row no-gutters class="fill-height">
      <Cryptoverse :allGalaxies="galaxies" :coins="coins" />
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
      { rank: 1, name: "bitcoin", symbol: "BTC" },
      { rank: 2, name: "ethereum", symbol: "ETH" },
      { rank: 3, name: "cardano", symbol: "ADA" },
      { rank: 4, name: "tether", symbol: "USDT" },
      { rank: 5, name: "binance coin", symbol: "BNB" },
      { rank: 6, name: "xrp", symbol: "XRP" },
      { rank: 7, name: "solana", symbol: "SOL" },
      { rank: 8, name: "usd coin", symbol: "USDC" },
      { rank: 9, name: "polkadot", symbol: "DOT" },
      { rank: 10, name: "dogecoin", symbol: "DOGE" },
    ],
    galaxies: [
      {
        name: "The NFT Way",
        coords: {
          // coords represent center point of galaxy
          x: 721,
          y: 721,
        },
        width: 300,
        height: 200,
        repCoin: {
          rank: 7,
          name: "solana",
          symbol: "SOL",
          filename: "solana.png",
        },
      },
      {
        name: "Alpha Satoshi",
        coords: {
          // coords represent center point of galaxy
          x: 258,
          y: 158,
        },
        width: 500,
        height: 300,
        repCoin: {
          rank: 1,
          name: "bitcoin",
          symbol: "BTC",
          filename: "bitcoin.png",
        },
      },
    ],
  }),
};
</script>
