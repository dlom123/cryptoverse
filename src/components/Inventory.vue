<template>
    <v-overlay
        absolute
        :value="showInventory"
    ></v-overlay>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
    name: "Inventory",
    computed: {
        ...mapState(['showInventory'])
    },
    methods: {
        ...mapMutations(['setShowInventory']),
        // hideInventory(e) {
        //     this.setShowInventory(false)
        // }
    }
}
</script>
