<template>
  <v-card outlined class="bg-grey">
    <v-card-title class="py-3 text-h6 font-weight-bold bg-grey">
      <v-icon color="primary" class="pr-1">
        mdi-image-filter-vintage
      </v-icon>
      Aesthetics
    </v-card-title>
    <v-divider />
    <v-card-subtitle>Map columns to visual properies</v-card-subtitle>
    <v-card-text>
      <v-list class="bg-grey">
        <Aesthetic
          v-for="aesthetic in currentAesthetics"
          :key="aesthetic"
          :name="aesthetic"
        />
      </v-list>
      <v-overflow-btn
        v-model="addAestheticSelected"
        :items="aesthetics"
        item-value="name"
        label="Add new aesthetic"
        flat
        filled
        hide-details
        class="pt-2"
        @input="addAesthetic"
      >
        <template #item="{ item, attrs, on }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-content>
              <v-list-item-icon>
                <v-icon v-text="item.icon" />
              </v-list-item-icon>
              <v-list-item-title
                :id="attrs['aria-labelledby']"
                v-text="item.name"
              />

              <v-list-item-subtitle v-text="item.text" />
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-overflow-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import Aesthetic from '~/components/Aesthetic'
import { aesthetics } from '~/constants/aesthetics'

export default {
  name: 'Dataset',
  components: {
    Aesthetic,
  },
  data() {
    return { addAestheticSelected: null }
  },
  computed: {
    currentAesthetics() {
      const geometry = this.$store.getters['geometries/geometry']
      return Object.keys(geometry.aesthetics)
    },
    aesthetics() {
      return aesthetics
    },
  },
  methods: {
    addAesthetic(name) {
      this.$store.commit('geometries/addAesthetic', name)
      this.$nextTick(() => {
        this.addAestheticSelected = null
      })
    },
  },
}
</script>
