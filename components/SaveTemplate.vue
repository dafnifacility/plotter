<template>
  <v-dialog v-model="dialog" width="500">
    <template #activator="{ on, attrs }">
      <v-btn color="red lighten-2" dark v-bind="attrs" v-on="on">
        Save Template
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline grey lighten-2">
        Save Template
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="title" label="Title" />
        <v-text-field v-model="description" label="Description" />
        <v-text-field v-model="filename" label="Filename" />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn :color="primaryBlue" text @click="save"> Save </v-btn>
        <v-btn :color="primaryBlue" text @click="cancel"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapState } from 'vuex'
import { primaryBlue } from '~/static/js/colours'
import { uploadTemplate } from '~/api/nivs'

export default {
  name: 'SaveTemplate',
  data() {
    return {
      primaryBlue,
      dialog: false,
      title: null,
      description: null,
      filename: 'template.json',
    }
  },
  methods: {
    ...mapState({
      state: state => state,
    }),
    async save() {
      const currentState = this.state
      console.log('uploading current state', currentState)
      try {
        const id = await uploadTemplate(
          this.title,
          this.description,
          this.filename,
          currentState
        )
        console.log('Successfully uploaded template', id)
      } catch (error) {
        console.error('ERROR uploading template', error)
      }
      this.dialog = false
    },
    cancel() {
      this.dialog = false
    },
  },
}
</script>
