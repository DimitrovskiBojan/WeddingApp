<template>
  <q-footer elevated class="bg-pink-4 text-white">
    <q-tabs v-model="tab" inline-label class="text-white">
      <q-tab name="camera" icon="photo_camera" label="Прикачи слики" @click="goToCamera" />
      <q-tab name="gallery" icon="photo_library" label="Галерија" @click="goToGallery" />
    </q-tabs>
  </q-footer>
</template>

<script>
export default {
  name: 'FooterNavigation',

  data() {
    return {
      tab: localStorage.getItem("nav_value")
    }
  },

  methods: {
    goToCamera() {
      this.$router.push('/')
      localStorage.setItem("nav_value", "camera")
    },

    goToGallery() {
      this.$router.push('/gallery')
      localStorage.setItem("nav_value", "gallery")
    }
  }
}
</script>
